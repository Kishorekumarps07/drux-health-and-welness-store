'use strict';

const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const Cache = require('../../lib/cache');

const CACHE_TTL = 30; // 30 seconds cache TTL

const clearVendorStatsCache = async (userId) => {
  try {
    if (userId) {
      await Cache.del(`vendor:stats:${userId}`);
    } else {
      await Cache.clearPattern('vendor:stats:*');
    }
  } catch (err) {
    // Suppress potential invalidation errors
  }
};

class VendorStatsService {
  /**
   * Helper to get the vendor context for a user
   */
  async getVendorId(userId) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor profile not found.', 404);
    return vendor.id;
  }

  /**
   * Aggregate statistics for the vendor dashboard
   */
  async getDashboardStats(userId) {
    const cached = await Cache.get(`vendor:stats:${userId}`);
    if (cached) {
      return cached;
    }

    const vendorId = await this.getVendorId(userId);

    // Aggregate statistics from OrderItems
    const stats = await prisma.orderItem.aggregate({
      where: { vendorId },
      _sum: {
        total: true, // price * quantity already stored as total
      },
      _count: {
        id: true,
      },
    });

    // Get order-level count (distinct orders this vendor has participated in)
    const distinctOrders = await prisma.orderItem.groupBy({
      by: ['orderId'],
      where: { vendorId },
    });

    // Get pending orders count
    const pendingOrderCount = await prisma.orderItem.count({
      where: { vendorId, status: 'PENDING' }
    });

    // Get product count
    const productCount = await prisma.product.count({
      where: { vendorId },
    });

    const result = {
      totalSales: parseFloat(stats._sum.total || 0).toFixed(2),
      orderItemCount: stats._count.id || 0,
      orderCount: distinctOrders.length || 0,
      pendingOrderCount,
      productCount,
    };

    await Cache.set(`vendor:stats:${userId}`, result, CACHE_TTL);

    return result;
  }

  /**
   * Performance metrics for the vendor analytics
   */
  async getSalesMetrics(userId) {
    const vendorId = await this.getVendorId(userId);

    // Group items by month for sales over time
    const monthlySales = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('month', created_at) as month, 
        SUM(total) as revenue,
        COUNT(id) as count
      FROM "order_items"
      WHERE vendor_id = ${vendorId}
      GROUP BY month
      ORDER BY month DESC
      LIMIT 12
    `;

    return monthlySales;
  }
}

const serviceInstance = new VendorStatsService();
serviceInstance.clearVendorStatsCache = clearVendorStatsCache;
module.exports = serviceInstance;
