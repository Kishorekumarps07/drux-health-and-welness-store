'use strict';

const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

class VendorProfileService {
  /**
   * Helper to get the vendor context
   */
  async getVendor(userId) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor profile not found.', 404);
    return vendor;
  }

  /**
   * Get detailed analytics for the vendor
   */
  async getAnalytics(userId, range = '30d') {
    const vendor = await this.getVendor(userId);
    const vendorId = vendor.id;

    // Calculate time frame
    const days = parseInt(range) || 30;
    const timeFrame = new Date();
    timeFrame.setDate(timeFrame.getDate() - days);

    const salesOverTime = await prisma.$queryRaw`
      SELECT 
        DATE_TRUNC('day', created_at) as date, 
        SUM(total) as revenue,
        COUNT(id) as orders
      FROM "order_items"
      WHERE vendor_id = ${vendorId} AND created_at >= ${timeFrame}
      GROUP BY date
      ORDER BY date ASC
    `;

    // 2. Top Performing Products
    const topProducts = await prisma.orderItem.groupBy({
      by: ['productId', 'title'],
      where: { vendorId },
      _sum: {
        quantity: true,
        total: true
      },
      orderBy: {
        _sum: {
          total: 'desc'
        }
      },
      take: 5
    });

    return {
      salesTrend: salesOverTime.map(s => ({
        date: s.date,
        revenue: parseFloat(s.revenue || 0),
        orders: Number(s.orders || 0)
      })),
      topProducts: topProducts.map(p => ({
        id: p.productId,
        title: p.title,
        quantity: p._sum.quantity,
        revenue: parseFloat(p._sum.total || 0)
      }))
    };
  }

  /**
   * Get payment and payout info
   */
  async getPayments(userId) {
    const vendor = await this.getVendor(userId);
    const vendorId = vendor.id;

    const payouts = await prisma.vendorPayout.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    const totalPayouts = await prisma.vendorPayout.aggregate({
      where: { vendorId, status: 'COMPLETED' },
      _sum: { amount: true }
    });

    // Simple balance calculation: Total Sales (from Vendor record) - Total Payouts
    const totalWithdrawn = parseFloat(totalPayouts._sum.amount || 0);
    const totalSales = parseFloat(vendor.totalSales || 0);
    const balance = totalSales - totalWithdrawn;

    return {
      balance: balance.toFixed(2),
      totalWithdrawn: totalWithdrawn.toFixed(2),
      payouts: payouts.map(p => ({
        id: p.id,
        amount: parseFloat(p.amount).toFixed(2),
        status: p.status,
        date: p.processedAt || p.createdAt,
        period: `${p.periodStart.toLocaleDateString()} - ${p.periodEnd.toLocaleDateString()}`
      }))
    };
  }

  /**
   * Update vendor profile settings
   */
  async updateProfile(userId, data) {
    const vendor = await this.getVendor(userId);
    
    // Only allow specific fields to be updated
    const allowedFields = ['storeName', 'storeDescription', 'storeLogo', 'storeBanner', 'gstNumber'];
    const updateData = {};
    
    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    // If storeName changes, we might want to update the slug too (optional/risky)
    // For now, we'll keep the slug stable to avoid broken links unless explicitly requested.

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendor.id },
      data: updateData
    });

    return updatedVendor;
  }
}

module.exports = new VendorProfileService();
