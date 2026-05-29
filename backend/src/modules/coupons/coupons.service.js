const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

class CouponsService {
  async list() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, title: true } },
        vendor: { select: { id: true, storeName: true } }
      }
    });
  }

  async getActiveCoupons() {
    return prisma.coupon.findMany({
      where: { isActive: true },
      orderBy: { discountPercent: 'desc' },
      include: {
        product: { select: { id: true, title: true } },
        vendor: { select: { id: true, storeName: true } }
      }
    });
  }

  async validateCoupon(code) {
    if (!code) throw new AppError('Coupon code is required.', 400);
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
      include: {
        product: { select: { id: true, title: true } },
        vendor: { select: { id: true, storeName: true } }
      }
    });
    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or expired coupon code.', 404);
    }

    // Check expiry
    if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
      throw new AppError('This coupon code has expired.', 400);
    }

    // Check usage limits
    if (coupon.usageLimit !== null && coupon.usageLimit !== undefined && coupon.usageCount >= coupon.usageLimit) {
      throw new AppError('This coupon code has reached its usage limit.', 400);
    }

    return coupon;
  }

  async create(data) {
    const code = data.code.toUpperCase().trim();
    const discountPercent = parseInt(data.discountPercent, 10);

    if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
      throw new AppError('Discount percentage must be between 1 and 100.', 400);
    }

    const exists = await prisma.coupon.findUnique({ where: { code } });
    if (exists) throw new AppError(`Coupon code "${code}" already exists.`, 409);

    return prisma.coupon.create({
      data: {
        code,
        discountPercent,
        isActive: data.isActive !== undefined ? !!data.isActive : true,
        productId: data.productId || null,
        vendorId: data.vendorId || null,
      },
    });
  }

  async update(id, data) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new AppError('Coupon not found.', 404);

    const updateData = {};
    if (data.code) {
      const code = data.code.toUpperCase().trim();
      if (code !== coupon.code) {
        const exists = await prisma.coupon.findUnique({ where: { code } });
        if (exists) throw new AppError(`Coupon code "${code}" already exists.`, 409);
        updateData.code = code;
      }
    }

    if (data.discountPercent !== undefined) {
      const discountPercent = parseInt(data.discountPercent, 10);
      if (isNaN(discountPercent) || discountPercent < 1 || discountPercent > 100) {
        throw new AppError('Discount percentage must be between 1 and 100.', 400);
      }
      updateData.discountPercent = discountPercent;
    }

    if (data.isActive !== undefined) {
      updateData.isActive = !!data.isActive;
    }

    if (data.productId !== undefined) {
      updateData.productId = data.productId || null;
    }
    if (data.vendorId !== undefined) {
      updateData.vendorId = data.vendorId || null;
    }

    return prisma.coupon.update({
      where: { id },
      data: updateData,
    });
  }

  async delete(id) {
    const coupon = await prisma.coupon.findUnique({ where: { id } });
    if (!coupon) throw new AppError('Coupon not found.', 404);
    await prisma.coupon.delete({ where: { id } });
  }
}

module.exports = new CouponsService();
