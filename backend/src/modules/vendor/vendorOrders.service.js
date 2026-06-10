'use strict';

const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const { getPagination, getPagingData } = require('../../lib/pagination.util');
const { sendEmail } = require('../../lib/email');
const emailTemplates = require('../../lib/emailTemplates');

class VendorOrdersService {
  /**
   * Helper to get the vendor context for a user
   */
  async getVendorId(userId) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor profile not found.', 404);
    return vendor.id;
  }

  /**
   * Get paginated order items belonging to the vendor
   */
  async getMyOrderItems(userId, query) {
    const vendorId = await this.getVendorId(userId);
    const { skip, take, page, limit } = getPagination(query);
    const { status } = query;

    const where = { vendorId };
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      prisma.orderItem.findMany({
        where,
        skip,
        take,
        include: {
          order: {
            include: {
              user: { select: { name: true, email: true, phone: true } },
              address: true,
            },
          },
          product: { include: { images: { where: { isPrimary: true }, take: 1 } } },
        },
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.orderItem.count({ where }),
    ]);

    return { items, ...getPagingData(total, page, limit) };
  }

  /**
   * Get specific order item details
   */
  async getOrderItem(userId, itemId) {
    const vendorId = await this.getVendorId(userId);
    const item = await prisma.orderItem.findFirst({
      where: { id: itemId, vendorId },
      include: {
        order: {
          include: {
            user: { select: { name: true, email: true, phone: true } },
            address: true,
          },
        },
        product: true,
      },
    });

    if (!item) throw new AppError('Order item not found.', 404);
    return item;
  }

  /**
   * Update order item status and sync with parent order
   */
  async updateItemStatus(userId, itemId, newStatus) {
    const vendorId = await this.getVendorId(userId);

    // 1. Fetch current item for validation
    const item = await prisma.orderItem.findFirst({
      where: { id: itemId, vendorId }
    });
    if (!item) throw new AppError('Order item not found.', 404);

    // 2. Validate Transition Rules
    const currentStatus = item.status;
    const STATUS_ORDER = { PENDING: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: 4 };

    // Block logic
    if (currentStatus === 'DELIVERED' && newStatus === 'CANCELLED') {
      throw new AppError('Cannot cancel a delivered item.', 400);
    }
    if (newStatus !== 'CANCELLED' && STATUS_ORDER[newStatus] < STATUS_ORDER[currentStatus]) {
      throw new AppError(`Cannot revert status from ${currentStatus} back to ${newStatus}.`, 400);
    }
    if (currentStatus === 'CANCELLED') {
      throw new AppError('Cannot update a cancelled item.', 400);
    }

    // 3. Prepare Audit Timestamps
    const auditUpdates = {};
    if (newStatus === 'SHIPPED' && !item.shippedAt) auditUpdates.shippedAt = new Date();
    if (newStatus === 'DELIVERED' && !item.deliveredAt) auditUpdates.deliveredAt = new Date();

    // Check Shipment state if canceling
    let shipmentCancelAction = null; // 'CANCEL_SHIPMENT_AND_ORDER' or 'RESET_SHIPMENT_BOOKING' or null
    let shipmentIdToUpdate = null;
    let srOrderIdToCancel = null;

    if (newStatus === 'CANCELLED') {
      const shipment = await prisma.shipment.findFirst({
        where: { orderId: item.orderId, vendorId }
      });

      if (shipment) {
        shipmentIdToUpdate = shipment.id;
        if (shipment.shiprocketOrderId) {
          srOrderIdToCancel = shipment.shiprocketOrderId;
        }

        // Count other non-cancelled items in this order for this vendor
        const otherActiveItemsCount = await prisma.orderItem.count({
          where: {
            orderId: item.orderId,
            vendorId,
            id: { not: itemId },
            status: { not: 'CANCELLED' }
          }
        });

        if (otherActiveItemsCount === 0) {
          shipmentCancelAction = 'CANCEL_SHIPMENT_AND_ORDER';
        } else if (shipment.shiprocketOrderId) {
          // Some items remain, but shipment was booked -> need to reset booking on Shiprocket
          shipmentCancelAction = 'RESET_SHIPMENT_BOOKING';
        }
      }
    }

    // Call Shiprocket if needed (outside database transaction)
    if (srOrderIdToCancel) {
      try {
        const shiprocketClient = require('../../lib/shiprocket');
        await shiprocketClient.cancelOrder(srOrderIdToCancel);
      } catch (srErr) {
        console.error(`Failed to cancel Shiprocket order ${srOrderIdToCancel} during item cancellation:`, srErr.message);
        // Proceed with DB update even if Shiprocket fails to keep consistency
      }
    }

    // 4. ATOMIC TRANSACTION: Update Item & Sync Order
    const result = await prisma.$transaction(async (tx) => {
      // Update the line item
      const updatedItem = await tx.orderItem.update({
        where: { id: itemId, vendorId }, // Concurrency protection via where
        data: { 
          status: newStatus,
          ...auditUpdates
        }
      });

      // Recalculate parent order status
      await this.syncParentOrderStatus(updatedItem.orderId, tx);

      // Perform shipment updates if cancelling
      if (shipmentIdToUpdate) {
        if (shipmentCancelAction === 'CANCEL_SHIPMENT_AND_ORDER') {
          await tx.shipment.update({
            where: { id: shipmentIdToUpdate },
            data: { status: 'CANCELLED' }
          });
        } else if (shipmentCancelAction === 'RESET_SHIPMENT_BOOKING') {
          // Reset Shiprocket integration fields but keep READY_TO_SHIP so they can re-book
          await tx.shipment.update({
            where: { id: shipmentIdToUpdate },
            data: {
              shiprocketOrderId: null,
              shipmentId: null,
              awbCode: null,
              courierName: null,
              labelUrl: null,
              status: 'READY_TO_SHIP'
            }
          });
        }
      }

      return updatedItem;
    });

    // 5. Invalidate vendor stats & profile caches
    try {
      const vendorStatsService = require('./vendorStats.service');
      const vendorProfileService = require('./vendorProfile.service');
      vendorStatsService.clearVendorStatsCache(userId);
      vendorProfileService.clearVendorProfileCache(userId);
    } catch (err) {
      // Suppress invalidation errors
    }

    // 6. Send customer status update email (fire-and-forget)
    try {
      const orderRecord = await prisma.order.findUnique({
        where: { id: result.orderId },
        include: { user: { select: { name: true, email: true } } },
      });
      if (orderRecord?.user?.email) {
        const shipment = await prisma.shipment.findFirst({
          where: { orderId: result.orderId, vendorId }
        });
        sendEmail({
          to: orderRecord.user.email,
          subject: `Update on your Drux order #${result.orderId.slice(0, 8)}`,
          html: emailTemplates.orderStatusUpdate({
            customerName: orderRecord.user.name,
            orderId: result.orderId,
            status: newStatus,
            awbCode: shipment?.awbCode || null,
            courierName: shipment?.courierName || null,
          }),
        });
      }
    } catch (emailErr) {
      console.error('[Email] Failed to send item status update email to customer:', emailErr.message);
    }

    return result;
  }

  /**
   * Internal logic to derive Order.status from its items
   */
  async syncParentOrderStatus(orderId, tx) {
    const allItems = await tx.orderItem.findMany({
      where: { orderId }
    });

    const totalItems = allItems.length;
    const deliveredCount = allItems.filter(i => i.status === 'DELIVERED').length;
    const cancelledCount = allItems.filter(i => i.status === 'CANCELLED').length;
    const pendingCount = allItems.filter(i => i.status === 'PENDING').length;

    let newOrderStatus = 'PARTIAL';

    if (deliveredCount === totalItems) {
      newOrderStatus = 'DELIVERED';
    } else if (cancelledCount === totalItems) {
      newOrderStatus = 'CANCELLED';
    } else if (pendingCount === totalItems) {
      newOrderStatus = 'PENDING';
    } else if (deliveredCount + cancelledCount === totalItems) {
      // If everything is either delivered or cancelled, it's realistically DELIVERED or PARTIAL
      // We'll call it DELIVERED if anything was delivered, else it was all cancelled
      newOrderStatus = deliveredCount > 0 ? 'DELIVERED' : 'CANCELLED';
    } else {
      // Any other mixed state is PARTIAL fulfillment
      newOrderStatus = 'PARTIAL';
    }

    await tx.order.update({
      where: { id: orderId },
      data: { status: newOrderStatus }
    });
  }
}

module.exports = new VendorOrdersService();
