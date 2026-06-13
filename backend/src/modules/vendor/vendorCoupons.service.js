'use strict';

const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

class VendorCouponsService {
  /**
   * Helper to resolve the vendor record using authenticated user's ID
   */
  async getVendorByUserId(userId) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) {
      throw new AppError('Vendor profile not found.', 404);
    }
    return vendor;
  }

  /**
   * List all coupons belonging to the logged-in vendor
   */
  async listCoupons(userId) {
    const vendor = await this.getVendorByUserId(userId);
    return prisma.coupon.findMany({
      where: { vendorId: vendor.id },
      orderBy: { createdAt: 'desc' },
      include: {
        product: { select: { id: true, title: true } }
      }
    });
  }

  /**
   * Create a new coupon scoped strictly to the logged-in vendor
   */
  async createCoupon(userId, data) {
    const vendor = await this.getVendorByUserId(userId);
    const code = data.code.toUpperCase().trim();
    const discountType = data.discountType || 'PERCENTAGE';
    if (discountType !== 'PERCENTAGE' && discountType !== 'FIXED') {
      throw new AppError('Discount type must be either PERCENTAGE or FIXED.', 400);
    }

    let discountValue = data.discountValue !== undefined ? parseInt(data.discountValue, 10) : undefined;
    let discountPercent = data.discountPercent !== undefined ? parseInt(data.discountPercent, 10) : undefined;

    if (discountValue === undefined && discountPercent !== undefined) {
      discountValue = discountPercent;
    }

    if (!code) {
      throw new AppError('Coupon code is required.', 400);
    }
    if (discountValue === undefined || isNaN(discountValue) || discountValue < 1) {
      throw new AppError('Discount value must be at least 1.', 400);
    }

    if (discountType === 'PERCENTAGE') {
      if (discountValue > 100) {
        throw new AppError('Discount percentage must be between 1 and 100.', 400);
      }
      discountPercent = discountValue;
    } else {
      discountPercent = 0;
    }

    // Check code uniqueness globally
    const exists = await prisma.coupon.findUnique({ where: { code } });
    if (exists) {
      throw new AppError(`Coupon code "${code}" already exists.`, 409);
    }

    // If restricted to a product, ensure the product belongs to this vendor
    if (data.productId) {
      const product = await prisma.product.findUnique({ where: { id: data.productId } });
      if (!product) {
        throw new AppError('Specified product not found.', 404);
      }
      if (product.vendorId !== vendor.id) {
        throw new AppError('You do not have permission to restrict coupons to this product.', 403);
      }
    }

    return prisma.coupon.create({
      data: {
        code,
        discountPercent,
        discountType,
        discountValue,
        isActive: data.isActive !== undefined ? !!data.isActive : true,
        productId: data.productId || null,
        vendorId: vendor.id, // Enforce vendor scoping
        expiresAt: data.expiresAt ? new Date(data.expiresAt) : null,
        usageLimit: data.usageLimit !== undefined ? parseInt(data.usageLimit, 10) : null
      },
      include: {
        product: { select: { id: true, title: true } }
      }
    });
  }

  /**
   * Update an existing coupon, checking ownership first
   */
  async updateCoupon(userId, id, data) {
    const vendor = await this.getVendorByUserId(userId);
    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new AppError('Coupon not found.', 404);
    }
    if (coupon.vendorId !== vendor.id) {
      throw new AppError('You do not have permission to update this coupon.', 403);
    }

    const updateData = {};

    if (data.code) {
      const code = data.code.toUpperCase().trim();
      if (code !== coupon.code) {
        const exists = await prisma.coupon.findUnique({ where: { code } });
        if (exists) {
          throw new AppError(`Coupon code "${code}" already exists.`, 409);
        }
        updateData.code = code;
      }
    }

    const discountType = data.discountType !== undefined ? data.discountType : coupon.discountType;
    if (discountType !== 'PERCENTAGE' && discountType !== 'FIXED') {
      throw new AppError('Discount type must be either PERCENTAGE or FIXED.', 400);
    }

    let discountValue = data.discountValue !== undefined ? parseInt(data.discountValue, 10) : undefined;
    let discountPercent = data.discountPercent !== undefined ? parseInt(data.discountPercent, 10) : undefined;

    if (data.discountType !== undefined || data.discountValue !== undefined || data.discountPercent !== undefined) {
      const type = discountType;
      let val = discountValue !== undefined ? discountValue : coupon.discountValue;

      if (data.discountPercent !== undefined && data.discountValue === undefined) {
        val = discountPercent;
      }

      if (isNaN(val) || val < 1) {
        throw new AppError('Discount value must be at least 1.', 400);
      }

      let pct = 0;
      if (type === 'PERCENTAGE') {
        if (val > 100) {
          throw new AppError('Discount percentage must be between 1 and 100.', 400);
        }
        pct = val;
      } else {
        pct = 0;
      }

      updateData.discountType = type;
      updateData.discountValue = val;
      updateData.discountPercent = pct;
    }

    if (data.isActive !== undefined) {
      updateData.isActive = !!data.isActive;
    }

    if (data.productId !== undefined) {
      if (data.productId) {
        const product = await prisma.product.findUnique({ where: { id: data.productId } });
        if (!product) {
          throw new AppError('Specified product not found.', 404);
        }
        if (product.vendorId !== vendor.id) {
          throw new AppError('You do not have permission to restrict coupons to this product.', 403);
        }
        updateData.productId = data.productId;
      } else {
        updateData.productId = null;
      }
    }

    if (data.expiresAt !== undefined) {
      updateData.expiresAt = data.expiresAt ? new Date(data.expiresAt) : null;
    }

    if (data.usageLimit !== undefined) {
      updateData.usageLimit = data.usageLimit !== null ? parseInt(data.usageLimit, 10) : null;
    }

    return prisma.coupon.update({
      where: { id },
      data: updateData,
      include: {
        product: { select: { id: true, title: true } }
      }
    });
  }

  /**
   * Delete an existing coupon, checking ownership first
   */
  async deleteCoupon(userId, id) {
    const vendor = await this.getVendorByUserId(userId);
    const coupon = await prisma.coupon.findUnique({ where: { id } });

    if (!coupon) {
      throw new AppError('Coupon not found.', 404);
    }
    if (coupon.vendorId !== vendor.id) {
      throw new AppError('You do not have permission to delete this coupon.', 403);
    }

    await prisma.coupon.delete({ where: { id } });
  }

  /**
   * Automatically generate a unique, beautifully styled coupon code for the vendor
   */
  async generateCouponCode(userId, discountPercent = 10) {
    const vendor = await this.getVendorByUserId(userId);
    
    // Create store prefix from storeName (uppercase, alphanumeric, max 6 chars)
    const prefix = vendor.storeName
      .toUpperCase()
      .replace(/[^A-Z0-9]/g, '')
      .substring(0, 6) || 'COUPON';

    const discount = parseInt(discountPercent, 10) || 10;
    
    let attempts = 0;
    let code = '';
    let exists = true;

    while (exists && attempts < 10) {
      attempts++;
      // Generate a random 4-character alphanumeric string
      const randomString = Math.random().toString(36).substring(2, 6).toUpperCase();
      code = `${prefix}${discount}-${randomString}`;
      
      const check = await prisma.coupon.findUnique({ where: { code } });
      if (!check) {
        exists = false;
      }
    }

    if (exists) {
      throw new AppError('Failed to generate a unique coupon code. Please try again.', 500);
    }

    return { code };
  }
}

module.exports = new VendorCouponsService();
