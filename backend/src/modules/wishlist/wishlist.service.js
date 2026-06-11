const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

const WISHLIST_PRODUCT_SELECT = {
  id: true,
  title: true,
  slug: true,
  description: true,
  shortDesc: true,
  price: true,
  comparePrice: true,
  stockQty: true,
  sku: true,
  status: true,
  averageRating: true,
  reviewCount: true,
  isFeatured: true,
  isBestSeller: true,
  isNew: true,
  tags: true,
  metadata: true,
  createdAt: true,
  updatedAt: true,
  images: {
    where: { isPrimary: true },
    take: 1
  },
  category: {
    select: {
      id: true,
      name: true,
      slug: true
    }
  },
  vendor: {
    select: {
      id: true,
      storeName: true,
      storeSlug: true,
      storeLogo: true,
      storeDescription: true,
      rating: true,
      createdAt: true
    }
  }
};

class WishlistService {
  async getWishlist(userId) {
    const items = await prisma.wishlistItem.findMany({
      where: {
        userId,
        product: {
          status: 'ACTIVE',
          vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } }
        }
      },
      include: {
        product: {
          select: WISHLIST_PRODUCT_SELECT
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return items.map(item => item.product);
  }

  async addItem(userId, productId) {
    const product = await prisma.product.findFirst({
      where: {
        id: productId,
        status: 'ACTIVE',
        vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } }
      }
    });
    if (!product) {
      throw new AppError('Product not available or active.', 404);
    }

    try {
      await prisma.wishlistItem.upsert({
        where: {
          userId_productId: { userId, productId }
        },
        update: {},
        create: { userId, productId }
      });
    } catch (error) {
      if (error.code !== 'P2002') {
        throw error;
      }
    }

    return this.getWishlist(userId);
  }

  async removeItem(userId, productId) {
    try {
      await prisma.wishlistItem.delete({
        where: {
          userId_productId: { userId, productId }
        }
      });
    } catch (error) {
      if (error.code !== 'P2025') {
        throw error;
      }
    }

    return this.getWishlist(userId);
  }

  async syncWishlist(userId, productIds) {
    // 1. Validate incoming product IDs to make sure they are active/available
    const activeProducts = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE',
        vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } }
      },
      select: { id: true }
    });
    const validProductIds = activeProducts.map(p => p.id);

    // 2. Perform upserts for all valid product IDs
    await Promise.all(validProductIds.map(async (productId) => {
      try {
        await prisma.wishlistItem.upsert({
          where: {
            userId_productId: { userId, productId }
          },
          update: {},
          create: { userId, productId }
        });
      } catch (error) {
        if (error.code !== 'P2002') {
          throw error;
        }
      }
    }));

    return this.getWishlist(userId);
  }
}

module.exports = new WishlistService();
