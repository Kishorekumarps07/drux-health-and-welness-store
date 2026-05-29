const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

const CART_INCLUDE = {
  items: {
    include: {
      product: {
        include: { images: { where: { isPrimary: true }, take: 1 }, vendor: { select: { id: true, storeName: true } } },
      },
    },
  },
};

class CartService {
  async getOrCreate(userId) {
    let cart = await prisma.cart.findUnique({ where: { userId }, include: CART_INCLUDE });
    if (!cart) {
      cart = await prisma.cart.create({ data: { userId }, include: CART_INCLUDE });
    }
    return cart;
  }

  async addItem(userId, { productId, quantity = 1 }) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product || product.status !== 'ACTIVE') throw new AppError('Product not available.', 404);
    if (product.stockQty < quantity) throw new AppError(`Only ${product.stockQty} units available.`, 400);

    const cart = await this.getOrCreate(userId);

    const existing = await prisma.cartItem.findUnique({ where: { cartId_productId: { cartId: cart.id, productId } } });

    if (existing) {
      await prisma.cartItem.update({ where: { id: existing.id }, data: { quantity: existing.quantity + quantity } });
    } else {
      await prisma.cartItem.create({ data: { cartId: cart.id, productId, quantity } });
    }

    return this.getOrCreate(userId);
  }

  async updateItem(userId, itemId, { quantity }) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new AppError('Cart not found.', 404);

    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new AppError('Cart item not found.', 404);

    if (quantity <= 0) {
      await prisma.cartItem.delete({ where: { id: itemId } });
    } else {
      await prisma.cartItem.update({ where: { id: itemId }, data: { quantity } });
    }

    return this.getOrCreate(userId);
  }

  async removeItem(userId, itemId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) throw new AppError('Cart not found.', 404);

    const item = await prisma.cartItem.findFirst({ where: { id: itemId, cartId: cart.id } });
    if (!item) throw new AppError('Cart item not found.', 404);

    await prisma.cartItem.delete({ where: { id: itemId } });
    return this.getOrCreate(userId);
  }

  async clearCart(userId) {
    const cart = await prisma.cart.findUnique({ where: { userId } });
    if (!cart) return;
    await prisma.cartItem.deleteMany({ where: { cartId: cart.id } });
  }

  async syncCart(userId, items) {
    const cart = await this.getOrCreate(userId);

    // Merge strategy: if item exists, use max(quantity).
    // Skip products that are inactive or deleted to prevent FK errors.
    for (const item of items) {
      // Validate product exists and is available before touching the DB
      const product = await prisma.product.findUnique({
        where: { id: item.productId },
        select: { id: true, status: true, stockQty: true }
      });

      if (!product || product.status !== 'ACTIVE') {
        // Product deleted or inactive — skip silently
        continue;
      }

      const safeQty = Math.min(item.quantity, product.stockQty || 1);

      const existing = await prisma.cartItem.findUnique({
        where: { cartId_productId: { cartId: cart.id, productId: item.productId } }
      });

      if (existing) {
        await prisma.cartItem.update({
          where: { id: existing.id },
          data: { quantity: Math.max(existing.quantity, safeQty) }
        });
      } else {
        await prisma.cartItem.create({
          data: { cartId: cart.id, productId: item.productId, quantity: safeQty }
        });
      }
    }

    return this.getOrCreate(userId);
  }

  async calculateTotals(userId) {
    const cart = await prisma.cart.findUnique({
      where: { userId },
      include: { items: { include: { product: true } } },
    });

    if (!cart || cart.items.length === 0) {
      return { subtotal: 0, shippingCharge: 0, total: 0, items: [] };
    }

    let subtotal = 0;
    const items = cart.items.map((item) => {
      const itemPrice = parseFloat(item.product.price);
      const itemTotal = itemPrice * item.quantity;
      subtotal += itemTotal;
      return {
        productId: item.productId,
        vendorId: item.product.vendorId,
        title: item.product.title,
        price: itemPrice,
        quantity: item.quantity,
        total: itemTotal,
      };
    });

    const shippingCharge = subtotal >= 499 ? 0 : 49;
    const total = subtotal + shippingCharge;

    return { 
      subtotal, 
      shippingCharge, 
      total, 
      items, 
      id: cart.id 
    };
  }
}

module.exports = new CartService();
