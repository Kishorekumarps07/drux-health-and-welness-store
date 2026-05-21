const slugify = require('slugify');
const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const { getPagination, getPagingData } = require('../../lib/pagination.util');

const VENDOR_SELECT = {
  id: true, storeName: true, storeSlug: true, storeDescription: true,
  storeLogo: true, storeBanner: true, approvalStatus: true, commissionRate: true,
  totalSales: true, rating: true, createdAt: true,
  user: { select: { id: true, name: true, email: true } },
};

class VendorsService {
  async apply(userId, data) {
    const existing = await prisma.vendor.findUnique({ where: { userId } });
    if (existing) throw new AppError('You have already applied as a vendor.', 409);

    const userRole = await prisma.user.findUnique({ where: { id: userId }, select: { roles: true } });
    if (userRole.roles.includes('ADMIN')) throw new AppError('Admins cannot register as vendors.', 403);

    const baseSlug = slugify(data.storeName, { lower: true, strict: true });
    let storeSlug = baseSlug;
    let attempt = 0;
    while (await prisma.vendor.findUnique({ where: { storeSlug } })) {
      storeSlug = `${baseSlug}-${++attempt}`;
    }

    const vendor = await prisma.vendor.create({
      data: { ...data, userId, storeSlug },
      select: VENDOR_SELECT,
    });

    return vendor;
  }

  async getMyStore(userId) {
    const vendor = await prisma.vendor.findUnique({
      where: { userId },
      select: { ...VENDOR_SELECT, products: { select: { id: true }, take: 1 } },
    });
    if (!vendor) throw new AppError('You do not have a vendor profile.', 404);
    if (!['APPROVED', 'ACTIVE'].includes(vendor.approvalStatus)) {
      throw new AppError('Your vendor profile has not been approved by an admin yet.', 403);
    }
    return vendor;
  }

  async updateMyStore(userId, data) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor profile not found.', 404);
    if (!['APPROVED', 'ACTIVE'].includes(vendor.approvalStatus)) {
      throw new AppError('Your vendor profile is not approved or is suspended.', 403);
    }

    return prisma.vendor.update({
      where: { userId },
      data,
      select: VENDOR_SELECT,
    });
  }

  async getMyAnalytics(userId) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor profile not found.', 404);
    if (!['APPROVED', 'ACTIVE'].includes(vendor.approvalStatus)) {
      throw new AppError('Your vendor profile is not approved or is suspended.', 403);
    }

    const [totalProducts, totalOrders, revenueData] = await Promise.all([
      prisma.product.count({ where: { vendorId: vendor.id } }),
      prisma.orderItem.count({ where: { vendorId: vendor.id } }),
      prisma.orderItem.aggregate({
        _sum: { total: true },
        where: { vendorId: vendor.id, order: { paymentStatus: 'PAID' } },
      }),
    ]);

    return {
      totalProducts,
      totalOrders,
      totalRevenue: revenueData._sum.total || 0,
      totalSales: vendor.totalSales,
      rating: vendor.rating,
      commissionRate: vendor.commissionRate
    };
  }

  async getPublicStore(storeSlug) {
    const vendor = await prisma.vendor.findUnique({
      where: { storeSlug },
      select: {
        ...VENDOR_SELECT,
        products: {
          where: { status: 'ACTIVE' },
          select: { id: true, title: true, slug: true, price: true, averageRating: true, images: { where: { isPrimary: true }, take: 1 } },
          take: 20,
        },
      },
    });
    if (!vendor || !['APPROVED', 'ACTIVE'].includes(vendor.approvalStatus)) {
      throw new AppError('Store not found.', 404);
    }
    return vendor;
  }

  async listVendors(query) {
    const { skip, take, page, limit } = getPagination(query);
    const { search } = query;

    const where = {
      approvalStatus: { in: ['APPROVED', 'ACTIVE'] },
      ...(search && { storeName: { contains: search, mode: 'insensitive' } }),
    };

    const orderBy = query.orderBy === 'latest' ? { createdAt: 'desc' } : { rating: 'desc' };

    const [vendors, total] = await Promise.all([
      prisma.vendor.findMany({ where, skip, take, select: VENDOR_SELECT, orderBy }),
      prisma.vendor.count({ where }),
    ]);

    return { vendors, ...getPagingData(total, page, limit) };
  }
}

module.exports = new VendorsService();
