const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const { getPagination, getPagingData } = require('../../lib/pagination.util');
const notificationsService = require('../users/notifications.service');
const couponsService = require('../coupons/coupons.service');

const ORDER_INCLUDE = {
  items: { 
    include: { 
      product: { 
        include: { 
          images: { where: { isPrimary: true }, take: 1 } 
        } 
      }, 
      vendor: { select: { id: true, storeName: true } } 
    } 
  },
  address: true,
  payment: true,
};

class OrdersService {
  async placeOrder(userId, { addressId, paymentMethod, notes, couponCode }) {
    // Validate address belongs to user
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new AppError('Address not found.', 404);

    // Load cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) throw new AppError('Your cart is empty.', 400);

    // Validate coupon (if provided)
    let coupon = null;
    if (couponCode) {
      try {
        coupon = await couponsService.validateCoupon(couponCode);
      } catch {
        throw new AppError('Invalid or expired coupon code.', 400);
      }
    }

    // Calculate totals
    const orderItems = [];
    let subtotal = 0;

    for (const item of cart.items) {
      const { product, quantity } = item;
      if (product.status !== 'ACTIVE') throw new AppError(`"${product.title}" is no longer available.`, 400);
      if (product.stockQty < quantity) throw new AppError(`Insufficient stock for "${product.title}".`, 400);

      const itemPrice = parseFloat(product.price);
      const itemTotal = itemPrice * quantity;
      subtotal += itemTotal;
      orderItems.push({
        productId: product.id,
        vendorId: product.vendorId,
        title: product.title,
        price: product.price,
        quantity,
        total: itemTotal,
      });
    }

    // Compute coupon discount on applicable items only
    let discount = 0;
    if (coupon) {
      let applicableSubtotal = subtotal;
      if (coupon.productId) {
        applicableSubtotal = cart.items
          .filter(i => i.product.id === coupon.productId)
          .reduce((acc, i) => acc + parseFloat(i.product.price) * i.quantity, 0);
      } else if (coupon.vendorId) {
        applicableSubtotal = cart.items
          .filter(i => i.product.vendorId === coupon.vendorId)
          .reduce((acc, i) => acc + parseFloat(i.product.price) * i.quantity, 0);
      }
      discount = Math.round((applicableSubtotal * coupon.discountPercent) / 100);
    }

    const shippingCharge = subtotal >= 499 ? 0 : 49;
    const total = Math.max(0, subtotal - discount + shippingCharge);

    const isCod = paymentMethod === 'COD';

    // Create order in a transaction
    const order = await prisma.$transaction(async (tx) => {
      // Create order (PENDING if online, CONFIRMED if COD)
      const newOrder = await tx.order.create({
        data: {
          userId, 
          addressId, 
          paymentMethod, 
          notes,
          subtotal,
          discount,
          shippingCharge, 
          total,
          status: isCod ? 'CONFIRMED' : 'PENDING',
          paymentStatus: 'CREATED', 
          items: { create: orderItems },
        },
        include: ORDER_INCLUDE,
      });

      // If COD, finalize immediately
      if (isCod) {
        for (const item of cart.items) {
          const updatedProd = await tx.product.update({
            where: { id: item.productId },
            data: { stockQty: { decrement: item.quantity } },
          });
          if (updatedProd.stockQty < 0) {
            throw new AppError(`Insufficient stock for ${updatedProd.title}.`, 400);
          }
        }
        await tx.cartItem.deleteMany({ where: { cartId: cart.id } });
      }

      // If there is a coupon, increment its usageCount inside the transaction
      if (coupon) {
        await tx.coupon.update({
          where: { id: coupon.id },
          data: { usageCount: { increment: 1 } }
        });
      }

      try {
        await notificationsService.createNotification(
          userId,
          isCod ? 'Order Confirmed' : 'Order Placed',
          `Your order #${newOrder.id.slice(0, 8)} of ₹${newOrder.total} has been placed successfully.`,
          `/dashboard/orders/${newOrder.id}`,
          'order'
        );
      } catch (err) {
        console.error('Failed to create notification for order placement:', err);
      }

      return newOrder;
    });

    return order;
  }

  async finalizePaidOrder(userId, orderId, { razorpayPaymentId }) {
    const order = await prisma.order.findUnique({
      where: { id: orderId, userId },
      include: { items: true },
    });

    if (!order) throw new AppError('Order not found.', 404);
    if (order.paymentStatus === 'ORDER_CREATED') return order; // Already processed

    return prisma.$transaction(async (tx) => {
      const result = await tx.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          paymentStatus: 'ORDER_CREATED',
        },
        include: ORDER_INCLUDE,
      });

      // Decrement stock
      for (const item of order.items) {
        const updatedProd = await tx.product.update({
          where: { id: item.productId },
          data: { stockQty: { decrement: item.quantity } },
        });
        if (updatedProd.stockQty < 0) {
          throw new AppError(`Insufficient stock for ${updatedProd.title}.`, 400);
        }
      }

      // Clear cart
      await tx.cartItem.deleteMany({
        where: { cart: { userId } },
      });

      try {
        await notificationsService.createNotification(
          userId,
          'Order Confirmed',
          `Your payment was verified. Order #${result.id.slice(0, 8)} is confirmed.`,
          `/dashboard/orders/${result.id}`,
          'order'
        );
      } catch (err) {
        console.error('Failed to create notification for verified order:', err);
      }

      return result;
    });
  }

  /**
   * Internal helper to create an order from pre-calculated cart data.
   * Used by the payment verification flow to ensure atomicity.
   */
  async createOrderFromVerifiedCart(userId, tx, { addressId, totals, paymentMethod = 'RAZORPAY', notes }) {
    const { subtotal, shippingCharge, total, items, discount = 0 } = totals;

    // Create the order
    const order = await tx.order.create({
      data: {
        userId,
        addressId,
        paymentMethod,
        notes,
        subtotal,
        discount,
        shippingCharge,
        total,
        status: 'CONFIRMED',
        paymentStatus: 'ORDER_CREATED',
        items: {
          create: items.map(item => ({
            productId: item.productId,
            vendorId: item.vendorId,
            title: item.title,
            price: item.price,
            quantity: item.quantity,
            total: item.total
          }))
        }
      },
      include: ORDER_INCLUDE
    });

    // Update stock
    for (const item of items) {
      const product = await tx.product.update({
        where: { id: item.productId },
        data: { stockQty: { decrement: item.quantity } }
      });
      if (product.stockQty < 0) {
        throw new AppError(`Insufficient stock for ${product.title} after payment.`, 400);
      }
    }

    return order;
  }

  async getMyOrders(userId, query) {
    const { skip, take, page, limit } = getPagination(query);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({ where: { userId }, skip, take, include: ORDER_INCLUDE, orderBy: { createdAt: 'desc' } }),
      prisma.order.count({ where: { userId } }),
    ]);

    return { orders, ...getPagingData(total, page, limit) };
  }

  async getById(userId, orderId) {
    const order = await prisma.order.findFirst({ where: { id: orderId, userId }, include: ORDER_INCLUDE });
    if (!order) throw new AppError('Order not found.', 404);
    return order;
  }

  async cancel(userId, orderId) {
    const order = await prisma.order.findFirst({ 
      where: { id: orderId, userId },
      include: { items: true }
    });
    if (!order) throw new AppError('Order not found.', 404);
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled at this stage.', 400);
    }

    const updated = await prisma.$transaction(async (tx) => {
      const updatedOrder = await tx.order.update({
        where: { id: orderId },
        data: { status: "CANCELLED" },
        include: ORDER_INCLUDE,
      });

      // IMPORTANT: Only restore stock for CONFIRMED orders.
      // PENDING orders (online payment initiated but not yet verified) never had
      // their stock decremented in placeOrder(), so restoring would create phantom stock.
      const stockWasReserved = order.status === 'CONFIRMED';
      if (stockWasReserved) {
        for (const item of order.items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQty: { increment: item.quantity } }
          });
        }
      }

      return updatedOrder;
    });

    try {
      await notificationsService.createNotification(
        userId,
        'Order Cancelled',
        `Your order #${updated.id.slice(0, 8)} has been cancelled successfully.`,
        `/dashboard/orders/${updated.id}`,
        'order'
      );
    } catch (err) {
      console.error('Failed to create notification for cancelled order:', err);
    }

    return updated;
  }

  async getVendorOrders(vendorId, query) {
    const { skip, take, page, limit } = getPagination(query);

    // Fetch orders that contain at least one item from this vendor
    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        where: {
          items: {
            some: { vendorId },
          },
        },
        skip,
        take,
        include: {
          ...ORDER_INCLUDE,
          // Filter items to only show what belongs to this vendor
          items: {
            where: { vendorId },
            include: {
              product: {
                include: {
                  images: { where: { isPrimary: true }, take: 1 },
                },
              },
            },
          },
        },
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count({
        where: {
          items: {
            some: { vendorId },
          },
        },
      }),
    ]);

    return { orders, ...getPagingData(total, page, limit) };
  }

  async getAllOrders(query) {
    const { skip, take, page, limit } = getPagination(query);

    const [orders, total] = await Promise.all([
      prisma.order.findMany({
        skip,
        take,
        include: ORDER_INCLUDE,
        orderBy: { createdAt: "desc" },
      }),
      prisma.order.count(),
    ]);

    return { orders, ...getPagingData(total, page, limit) };
  }

  async updateStatus(orderId, { status }) {
    const updated = await prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: ORDER_INCLUDE,
    });

    try {
      await notificationsService.createNotification(
        updated.userId,
        'Order Status Update',
        `Your order #${updated.id.slice(0, 8)} status is now ${status.toUpperCase()}.`,
        `/dashboard/orders/${updated.id}`,
        'order'
      );
    } catch (err) {
      console.error('Failed to create notification for order status update:', err);
    }

    return updated;
  }
}

module.exports = new OrdersService();
