const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

class CouponsService {
  async list() {
    return prisma.coupon.findMany({
      orderBy: { createdAt: 'desc' },
    });
  }

  async validateCoupon(code) {
    if (!code) throw new AppError('Coupon code is required.', 400);
    const coupon = await prisma.coupon.findUnique({
      where: { code: code.toUpperCase() },
    });
    if (!coupon || !coupon.isActive) {
      throw new AppError('Invalid or expired coupon code.', 404);
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
