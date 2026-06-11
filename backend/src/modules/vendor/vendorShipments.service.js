'use strict';

const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const { getPagination, getPagingData } = require('../../lib/pagination.util');
const shiprocketClient = require('../../lib/shiprocket');
const { sendEmail } = require('../../lib/email');
const emailTemplates = require('../../lib/emailTemplates');

class VendorShipmentsService {
  /**
   * Helper to get the vendor context for a user
   */
  async getVendorId(userId) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor profile not found.', 404);
    return vendor.id;
  }

  /**
   * List shipments belonging to the vendor
   */
  async getShipments(userId, query) {
    const vendorId = await this.getVendorId(userId);

    // Dynamic Self-Healing: Auto-create missing Shipment records for pre-existing orders
    try {
      const orderItems = await prisma.orderItem.findMany({
        where: { vendorId },
        select: { orderId: true },
        distinct: ['orderId']
      });
      const orderIds = orderItems.map(item => item.orderId);

      if (orderIds.length > 0) {
        const existingShipments = await prisma.shipment.findMany({
          where: { vendorId, orderId: { in: orderIds } },
          select: { orderId: true }
        });
        const existingOrderIds = new Set(existingShipments.map(s => s.orderId));
        const missingOrderIds = orderIds.filter(id => !existingOrderIds.has(id));

        if (missingOrderIds.length > 0) {
          await Promise.all(missingOrderIds.map(orderId => 
            prisma.shipment.create({
              data: {
                orderId,
                vendorId,
                status: 'READY_TO_SHIP'
              }
            }).catch(err => console.error('Failed to auto-create missing shipment:', err))
          ));
        }
      }
    } catch (healErr) {
      console.error('Failed to self-heal missing shipments:', healErr);
    }

    const { skip, take, page, limit } = getPagination(query);
    const { status } = query;

    const where = { vendorId };
    if (status) where.status = status;

    const [shipments, total] = await Promise.all([
      prisma.shipment.findMany({
        where,
        skip,
        take,
        include: {
          order: {
            include: {
              user: { select: { id: true, name: true, email: true, phone: true } },
              address: true,
              items: {
                where: { vendorId },
                include: {
                  product: {
                    include: {
                      images: { where: { isPrimary: true }, take: 1 }
                    }
                  }
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' },
      }),
      prisma.shipment.count({ where }),
    ]);

    return { shipments, ...getPagingData(total, page, limit) };
  }

  /**
   * Fetch details of a single vendor shipment
   */
  async getShipmentDetails(userId, shipmentId) {
    const vendorId = await this.getVendorId(userId);
    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, vendorId },
      include: {
        order: {
          include: {
            user: { select: { id: true, name: true, email: true, phone: true } },
            address: true,
            items: {
              where: { vendorId },
              include: {
                product: {
                  include: {
                    images: { where: { isPrimary: true }, take: 1 }
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!shipment) throw new AppError('Shipment not found.', 404);
    return shipment;
  }

  /**
   * Book a shipment on Shiprocket and generate AWB/courier info
   */
  async bookShipment(userId, shipmentId, bookingDetails = {}) {
    const vendorId = await this.getVendorId(userId);

    // 1. Fetch shipment and verify vendor ownership
    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, vendorId },
      include: {
        order: {
          include: {
            user: true,
            address: true,
            items: {
              where: { vendorId },
              include: { product: true }
            }
          }
        }
      }
    });

    if (!shipment) throw new AppError('Shipment not found.', 404);
    if (shipment.shiprocketOrderId || shipment.status !== 'READY_TO_SHIP') {
      throw new AppError(`Shipment cannot be booked (current status: ${shipment.status}).`, 400);
    }

    const vendor = await prisma.vendor.findUnique({ where: { id: vendorId } });
    const vendorPickupNickname = vendor?.pickupLocation;

    const { order } = shipment;
    const { address, user } = order;

    if (!address) {
      throw new AppError('Shipping address is missing for this order.', 400);
    }

    // 2. Parse billing / shipping customer name
    const fullName = address.fullName || user.name || 'Customer';
    const nameParts = fullName.trim().split(/\s+/);
    const firstName = nameParts[0] || 'Customer';
    const lastName = nameParts.slice(1).join(' ') || ' ';

    // 3. Format order date for Shiprocket (YYYY-MM-DD HH:mm)
    const orderDate = new Date(order.createdAt);
    const formattedDate = orderDate.toISOString().replace(/T/, ' ').replace(/\..+/, '').slice(0, 16);

    // 4. Calculate total of vendor items
    const subtotal = order.items.reduce((sum, item) => sum + Number(item.price) * item.quantity, 0);

    // 5. Map order items to Shiprocket schema
    const orderItems = order.items.map(item => ({
      name: item.title,
      sku: item.product.sku || item.productId,
      units: item.quantity,
      selling_price: Number(item.price),
    }));

    // 6. Build the Shiprocket API payload
    const pickupLocation = bookingDetails.pickupLocation || vendorPickupNickname || process.env.SHIPROCKET_DEFAULT_PICKUP_LOCATION || 'Primary';
    const paymentMethod = order.paymentMethod === 'COD' ? 'COD' : 'Prepaid';

    const shiprocketPayload = {
      order_id: `${order.id}-${shipment.id.slice(0, 8)}`,
      order_date: formattedDate,
      pickup_location: pickupLocation,
      billing_customer_name: firstName,
      billing_last_name: lastName,
      billing_address: address.street,
      billing_city: address.city,
      billing_pincode: address.pincode,
      billing_state: address.state,
      billing_country: address.country || 'India',
      billing_email: user.email || 'customer@druxstore.com',
      billing_phone: address.phone || user.phone || '9999999999',
      shipping_is_billing: true,
      order_items: orderItems,
      payment_method: paymentMethod,
      sub_total: subtotal,
      length: Number(bookingDetails.length || 15),
      breadth: Number(bookingDetails.width || bookingDetails.breadth || 10),
      height: Number(bookingDetails.height || 5),
      weight: Number(bookingDetails.weight || 0.5),
    };

    // 7. Call Shiprocket API to create the order
    let srOrder;
    try {
      srOrder = await shiprocketClient.createOrder(shiprocketPayload);
    } catch (err) {
      throw new AppError(`Shiprocket order creation failed: ${err.message}`, 400);
    }

    if (!srOrder || !srOrder.shipment_id) {
      throw new AppError('Shiprocket did not return a valid shipment ID.', 500);
    }

    // 8. Try to assign AWB immediately
    let awbCode = null;
    let courierName = null;
    try {
      const awbResponse = await shiprocketClient.assignAwb(srOrder.shipment_id);
      if (awbResponse && awbResponse.response && awbResponse.response.data) {
        const awbData = awbResponse.response.data;
        awbCode = awbData.awb_code;
        courierName = awbData.courier_name;
      }
    } catch (awbErr) {
      console.error('Failed to automatically assign AWB on booking:', awbErr);
      // We don't block the booking flow if AWB assignment fails or is delayed.
    }

    // 9. Update database shipment record
    const updatedShipment = await prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        shiprocketOrderId: String(srOrder.order_id),
        shipmentId: String(srOrder.shipment_id),
        awbCode,
        courierName,
        status: 'READY_TO_SHIP',
      },
    });

    // 10. Automatically update the corresponding order item statuses to PROCESSING
    try {
      await prisma.orderItem.updateMany({
        where: {
          orderId: order.id,
          vendorId,
          status: { in: ['PENDING'] }
        },
        data: {
          status: 'PROCESSING'
        }
      });
    } catch (updateErr) {
      console.error('Failed to update order item statuses after booking shipment:', updateErr);
    }

    return updatedShipment;
  }

  /**
   * Assign/generate AWB for a booked shipment if it was not assigned during booking
   */
  async generateAwb(userId, shipmentId) {
    const vendorId = await this.getVendorId(userId);

    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, vendorId }
    });

    if (!shipment) throw new AppError('Shipment not found.', 404);
    if (!shipment.shipmentId) {
      throw new AppError('This shipment has not been booked on Shiprocket yet.', 400);
    }

    if (shipment.awbCode) {
      return shipment; // Already assigned
    }

    // Call Shiprocket API to assign AWB
    try {
      const awbResponse = await shiprocketClient.assignAwb(shipment.shipmentId);
      if (awbResponse && awbResponse.response && awbResponse.response.data) {
        const awbData = awbResponse.response.data;
        
        const updated = await prisma.shipment.update({
          where: { id: shipment.id },
          data: {
            awbCode: awbData.awb_code,
            courierName: awbData.courier_name,
          }
        });
        
        return updated;
      } else {
        throw new Error(awbResponse?.message || 'No AWB data returned from Shiprocket.');
      }
    } catch (err) {
      // Self-Healing: If Shiprocket says order is cancelled, sync our DB to CANCELLED
      if (err.message && err.message.toLowerCase().includes('cancel')) {
        console.warn(`Shiprocket indicated order is cancelled. Syncing shipment ${shipment.id} to CANCELLED in DB.`);
        try {
          await prisma.$transaction(async (tx) => {
            await tx.shipment.update({
              where: { id: shipment.id },
              data: { status: 'CANCELLED' }
            });
            await tx.orderItem.updateMany({
              where: {
                orderId: shipment.orderId,
                vendorId,
                status: { not: 'CANCELLED' }
              },
              data: { status: 'CANCELLED' }
            });
            const vendorOrdersService = require('./vendorOrders.service');
            await vendorOrdersService.syncParentOrderStatus(shipment.orderId, tx);
          });
        } catch (syncErr) {
          console.error('Failed to auto-sync cancelled shipment in database:', syncErr);
        }
      }
      throw new AppError(`Courier assignment failed: ${err.message}`, 400);
    }
  }

  /**
   * Retrieve PDF label URL for a booked shipment
   */
  async getShipmentLabel(userId, shipmentId) {
    const vendorId = await this.getVendorId(userId);
    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, vendorId }
    });

    if (!shipment) throw new AppError('Shipment not found.', 404);
    if (!shipment.shipmentId) {
      throw new AppError('This shipment has not been booked on Shiprocket yet.', 400);
    }

    // Return cached URL if exists
    if (shipment.labelUrl) {
      return shipment.labelUrl;
    }

    // Auto-assign AWB if missing
    if (!shipment.awbCode) {
      try {
        const updatedShipment = await this.generateAwb(userId, shipmentId);
        shipment.awbCode = updatedShipment.awbCode;
      } catch (autoErr) {
        throw new AppError('Cannot generate a label for a shipment that has no AWB generated.', 400);
      }
    }

    // Otherwise fetch from Shiprocket and update DB
    try {
      const labelUrl = await shiprocketClient.generateLabel(shipment.shipmentId);
      if (!labelUrl) {
        throw new AppError('Shiprocket did not return a valid label URL.', 500);
      }

      await prisma.shipment.update({
        where: { id: shipment.id },
        data: { labelUrl }
      });

      return labelUrl;
    } catch (err) {
      throw new AppError(`Failed to retrieve shipping label: ${err.message}`, 400);
    }
  }

  /**
   * Mark shipment as handed over / dispatched to courier
   */
  async handoverShipment(userId, shipmentId) {
    const vendorId = await this.getVendorId(userId);

    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, vendorId }
    });

    if (!shipment) throw new AppError('Shipment not found.', 404);
    if (shipment.status !== 'READY_TO_SHIP') {
      throw new AppError(`Shipment must be booked and ready to ship to be handed over (current status: ${shipment.status}).`, 400);
    }

    // Auto-assign AWB if missing
    if (!shipment.awbCode) {
      try {
        const updatedShipment = await this.generateAwb(userId, shipmentId);
        shipment.awbCode = updatedShipment.awbCode;
        shipment.courierName = updatedShipment.courierName;
      } catch (autoErr) {
        throw new AppError('Cannot handover a shipment that has no AWB generated.', 400);
      }
    }

    // Update shipment status to SHIPPED
    const updatedShipment = await prisma.shipment.update({
      where: { id: shipment.id },
      data: { status: 'SHIPPED' }
    });

    // Automatically update the corresponding order item statuses to SHIPPED and set shippedAt timestamp
    try {
      await prisma.orderItem.updateMany({
        where: {
          orderId: shipment.orderId,
          vendorId,
          status: { in: ['PENDING', 'PROCESSING'] }
        },
        data: {
          status: 'SHIPPED',
          shippedAt: new Date()
        }
      });
    } catch (updateErr) {
      console.error('Failed to update order item statuses to SHIPPED after handover:', updateErr);
    }

    // Send SHIPPED email to customer (fire-and-forget)
    try {
      const orderRecord = await prisma.order.findUnique({
        where: { id: shipment.orderId },
        include: { user: { select: { name: true, email: true } } },
      });
      if (orderRecord?.user?.email) {
        sendEmail({
          to: orderRecord.user.email,
          subject: `Your Drux order #${shipment.orderId.slice(0, 8)} has been shipped! 🚚`,
          html: emailTemplates.orderStatusUpdate({
            customerName: orderRecord.user.name,
            orderId: shipment.orderId,
            status: 'SHIPPED',
            awbCode: updatedShipment.awbCode || shipment.awbCode,
            courierName: updatedShipment.courierName || shipment.courierName,
          }),
        });
      }
    } catch (emailErr) {
      console.error('[Email] Failed to send SHIPPED email to customer after handover:', emailErr.message);
    }

    return updatedShipment;
  }

  /**
   * Track shipment events
   */
  async trackShipment(userId, shipmentId) {
    const vendorId = await this.getVendorId(userId);
    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, vendorId }
    });

    if (!shipment) throw new AppError('Shipment not found.', 404);
    if (!shipment.awbCode) {
      throw new AppError('No AWB code is assigned to this shipment yet.', 400);
    }

    try {
      const trackingData = await shiprocketClient.trackShipment(shipment.awbCode);
      return trackingData;
    } catch (err) {
      throw new AppError(`Failed to fetch tracking data: ${err.message}`, 400);
    }
  }

  /**
   * Cancel a vendor shipment and its associated order items / Shiprocket booking
   */
  async cancelShipment(userId, shipmentId) {
    const vendorId = await this.getVendorId(userId);

    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, vendorId }
    });

    if (!shipment) throw new AppError('Shipment not found.', 404);

    // Block cancellation if already shipped/delivered
    if (shipment.status === 'SHIPPED' || shipment.status === 'DELIVERED') {
      throw new AppError(`Cannot cancel a shipment that is already ${shipment.status.toLowerCase()}.`, 400);
    }

    if (shipment.status === 'CANCELLED') {
      throw new AppError('Shipment is already cancelled.', 400);
    }

    // 1. If booked on Shiprocket, cancel the order there
    if (shipment.shiprocketOrderId) {
      try {
        await shiprocketClient.cancelOrder(shipment.shiprocketOrderId);
      } catch (err) {
        console.error(`Failed to cancel order ${shipment.shiprocketOrderId} on Shiprocket:`, err.message);
        // Do not block local cancellation if Shiprocket API has an issue (e.g. order already cancelled or invalid state)
      }
    }

    // 2. Perform updates in a transaction to ensure all order items and shipment are cancelled atomically
    const updatedShipment = await prisma.$transaction(async (tx) => {
      const updated = await tx.shipment.update({
        where: { id: shipmentId },
        data: { status: 'CANCELLED' }
      });

      // Update all items for this vendor-order to CANCELLED
      await tx.orderItem.updateMany({
        where: {
          orderId: shipment.orderId,
          vendorId,
          status: { not: 'CANCELLED' }
        },
        data: { status: 'CANCELLED' }
      });

      // Sync parent order status
      const vendorOrdersService = require('./vendorOrders.service');
      await vendorOrdersService.syncParentOrderStatus(shipment.orderId, tx);

      return updated;
    });

    // Send cancellation emails (fire-and-forget)
    try {
      const orderRecord = await prisma.order.findUnique({
        where: { id: shipment.orderId },
        include: { user: { select: { name: true, email: true } } },
      });
      // Customer email
      if (orderRecord?.user?.email) {
        sendEmail({
          to: orderRecord.user.email,
          subject: `Your Drux order #${shipment.orderId.slice(0, 8)} shipment has been cancelled`,
          html: emailTemplates.orderCancelled({
            customerName: orderRecord.user.name,
            orderId: shipment.orderId,
          }),
        });
      }
      // Vendor email
      const vendorRecord = await prisma.vendor.findUnique({
        where: { id: vendorId },
        include: { user: { select: { email: true, name: true } } },
      });
      if (vendorRecord?.user?.email) {
        const cancelledItems = await prisma.orderItem.findMany({
          where: { orderId: shipment.orderId, vendorId }
        });
        sendEmail({
          to: vendorRecord.user.email,
          subject: `Shipment cancelled for order #${shipment.orderId.slice(0, 8)}`,
          html: emailTemplates.itemCancelledForVendor({
            vendorName: vendorRecord.storeName,
            orderId: shipment.orderId,
            customerName: orderRecord?.user?.name || 'Customer',
            items: cancelledItems,
          }),
        });
      }
    } catch (emailErr) {
      console.error('[Email] Failed to send cancellation emails for shipment cancel:', emailErr.message);
    }

    return updatedShipment;
  }

  /**
   * Manually mark shipment as SHIPPED and set tracking details
   */
  async manualShipment(userId, shipmentId, { awbCode, courierName, trackingUrl }) {
    const vendorId = await this.getVendorId(userId);

    const shipment = await prisma.shipment.findFirst({
      where: { id: shipmentId, vendorId }
    });

    if (!shipment) throw new AppError('Shipment not found.', 404);

    // Update shipment details and set status to SHIPPED
    const updatedShipment = await prisma.shipment.update({
      where: { id: shipment.id },
      data: {
        awbCode,
        courierName,
        trackingUrl,
        status: 'SHIPPED'
      }
    });

    // Update matching order items status to SHIPPED and set shippedAt timestamp
    try {
      await prisma.orderItem.updateMany({
        where: {
          orderId: shipment.orderId,
          vendorId,
          status: { in: ['PENDING', 'PROCESSING'] }
        },
        data: {
          status: 'SHIPPED',
          shippedAt: new Date()
        }
      });
    } catch (updateErr) {
      console.error('Failed to update order item statuses to SHIPPED during manual ship:', updateErr);
    }

    // Sync parent order status if needed
    try {
      const vendorOrdersService = require('./vendorOrders.service');
      await vendorOrdersService.syncParentOrderStatus(shipment.orderId);
    } catch (syncErr) {
      console.error('Failed to sync parent order status during manual ship:', syncErr);
    }

    // Send SHIPPED email to customer (fire-and-forget)
    try {
      const orderRecord = await prisma.order.findUnique({
        where: { id: shipment.orderId },
        include: { user: { select: { name: true, email: true } } },
      });
      if (orderRecord?.user?.email) {
        sendEmail({
          to: orderRecord.user.email,
          subject: `Your Drux order #${shipment.orderId.slice(0, 8)} has been shipped! 🚚`,
          html: emailTemplates.orderStatusUpdate({
            customerName: orderRecord.user.name,
            orderId: shipment.orderId,
            status: 'SHIPPED',
            awbCode,
            courierName,
          }),
        });
      }
    } catch (emailErr) {
      console.error('[Email] Failed to send shipped notification for manual shipment:', emailErr.message);
    }

    return updatedShipment;
  }
}

module.exports = new VendorShipmentsService();
