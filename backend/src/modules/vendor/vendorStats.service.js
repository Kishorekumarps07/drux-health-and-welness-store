'use strict';

const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

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

    // Get product count
    const productCount = await prisma.product.count({
      where: { vendorId },
    });

    return {
      totalSales: parseFloat(stats._sum.total || 0).toFixed(2),
      orderItemCount: stats._count.id || 0,
      orderCount: distinctOrders.length || 0,
      productCount,
    };
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

module.exports = new VendorStatsService();
