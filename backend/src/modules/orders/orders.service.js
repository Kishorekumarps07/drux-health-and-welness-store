const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const { getPagination, getPagingData } = require('../../lib/pagination.util');

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
  async placeOrder(userId, { addressId, paymentMethod, notes }) {
    // Validate address belongs to user
    const address = await prisma.address.findFirst({ where: { id: addressId, userId } });
    if (!address) throw new AppError('Address not found.', 404);

    // Load cart
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });
    if (!cart || cart.items.length === 0) throw new AppError('Your cart is empty.', 400);

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

    const shippingCharge = subtotal >= 499 ? 0 : 49;
    const total = subtotal + shippingCharge;

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
      // Update order status
      const updatedOrder = await tx.order.update({
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

      return updatedOrder;
    });
  }

  /**
   * Internal helper to create an order from pre-calculated cart data.
   * Used by the payment verification flow to ensure atomicity.
   */
  async createOrderFromVerifiedCart(userId, tx, { addressId, totals, paymentMethod = 'RAZORPAY', notes }) {
    const { subtotal, shippingCharge, total, items } = totals;

    // Create the order
    const order = await tx.order.create({
      data: {
        userId,
        addressId,
        paymentMethod,
        notes,
        subtotal,
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

    const [orders, total] = await prisma.$transaction([
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
    const order = await prisma.order.findFirst({ where: { id: orderId, userId } });
    if (!order) throw new AppError('Order not found.', 404);
    if (!['PENDING', 'CONFIRMED'].includes(order.status)) {
      throw new AppError('Order cannot be cancelled at this stage.', 400);
    }

    return prisma.order.update({
      where: { id: orderId },
      data: { status: "CANCELLED" },
      include: ORDER_INCLUDE,
    });
  }

  async getVendorOrders(vendorId, query) {
    const { skip, take, page, limit } = getPagination(query);

    // Fetch orders that contain at least one item from this vendor
    const [orders, total] = await prisma.$transaction([
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

    const [orders, total] = await prisma.$transaction([
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
    return prisma.order.update({
      where: { id: orderId },
      data: { status },
      include: ORDER_INCLUDE,
    });
  }
}

module.exports = new OrdersService();
