const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

class ReviewsService {
  async create(userId, productId, data) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) throw new AppError('Product not found.', 404);

    const existing = await prisma.review.findUnique({ where: { userId_productId: { userId, productId } } });
    if (existing) throw new AppError('You have already reviewed this product.', 409);

    // Only allow reviews from customers who actually purchased & received the product
    const verifiedPurchase = await prisma.orderItem.findFirst({
      where: {
        productId,
        order: {
          userId,
          status: 'DELIVERED',
        },
      },
    });
    if (!verifiedPurchase) {
      throw new AppError('You can only review products you have purchased and received.', 403);
    }

    const review = await prisma.review.create({
      data: { ...data, userId, productId },
      include: { user: { select: { id: true, name: true, avatarUrl: true } } },
    });

    // Update product's average rating and count
    const stats = await prisma.review.aggregate({
      where: { productId },
      _avg: { rating: true },
      _count: { rating: true },
    });

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating: stats._avg.rating || 0,
        reviewCount: stats._count.rating,
      },
    });

    return review;
  }

  async listForProduct(productId, { page = 1, limit = 10 }) {
    const skip = (page - 1) * limit;
    const [reviews, total] = await Promise.all([
      prisma.review.findMany({
        where: { productId },
        skip, take: +limit,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { id: true, name: true, avatarUrl: true } } },
      }),
      prisma.review.count({ where: { productId } }),
    ]);
    return { reviews, total, page: +page, pages: Math.ceil(total / limit) };
  }
}

module.exports = new ReviewsService();
