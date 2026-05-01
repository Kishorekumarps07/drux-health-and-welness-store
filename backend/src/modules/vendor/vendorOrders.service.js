'use strict';

const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const { getPagination, getPagingData } = require('../../lib/pagination.util');

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

    const [items, total] = await prisma.$transaction([
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

    // 4. ATOMIC TRANSACTION: Update Item & Sync Order
    return prisma.$transaction(async (tx) => {
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

      return updatedItem;
    });
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
