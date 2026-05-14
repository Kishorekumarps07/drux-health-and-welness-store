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

    // 3. Today's Revenue
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    const todayStats = await prisma.orderItem.aggregate({
      where: { vendorId, createdAt: { gte: startOfToday } },
      _sum: { total: true }
    });

    // 4. Calculate Growth (Simplified: Today vs Yesterday)
    const yesterday = new Date(startOfToday);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStats = await prisma.orderItem.aggregate({
      where: { 
        vendorId, 
        createdAt: { gte: yesterday, lt: startOfToday } 
      },
      _sum: { total: true }
    });

    const todayRev = parseFloat(todayStats._sum.total || 0);
    const yesterdayRev = parseFloat(yesterdayStats._sum.total || 0);
    let growth = 0;
    if (yesterdayRev > 0) {
      growth = ((todayRev - yesterdayRev) / yesterdayRev) * 100;
    } else if (todayRev > 0) {
      growth = 100;
    }

    return {
      todayRevenue: todayRev,
      revenueGrowth: `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`,
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

    // 1. Calculate Total Revenue from all fulfilling OrderItems
    const revenueStats = await prisma.orderItem.aggregate({
      where: { vendorId },
      _sum: { total: true }
    });

    const totalRevenue = parseFloat(revenueStats._sum.total || 0);

    // 2. Fetch recent payouts
    const payouts = await prisma.vendorPayout.findMany({
      where: { vendorId },
      orderBy: { createdAt: 'desc' },
      take: 20
    });

    // 3. Calculate Total Withdrawn (Completed Payouts)
    const totalPayouts = await prisma.vendorPayout.aggregate({
      where: { vendorId, status: 'PROCESSED' },
      _sum: { amount: true }
    });

    const totalWithdrawn = parseFloat(totalPayouts._sum.amount || 0);
    
    // 4. Calculate Current Balance
    const balance = totalRevenue - totalWithdrawn;

    return {
      balance: balance.toFixed(2),
      totalWithdrawn: totalWithdrawn.toFixed(2),
      bankInfo: {
        accountNumber: vendor.bankAccountNumber ? `**** **** ${vendor.bankAccountNumber.slice(-4)}` : null,
        bankName: "HDFC Bank Limited", // In a real app, this would be looked up by IFSC or stored
        isVerified: !!vendor.bankAccountNumber
      },
      payouts: payouts.map(p => ({
        id: p.id,
        amount: parseFloat(p.amount).toFixed(2),
        status: p.status,
        date: p.processedAt || p.createdAt,
        period: (p.periodStart && p.periodEnd) 
          ? `${p.periodStart.toLocaleDateString()} - ${p.periodEnd.toLocaleDateString()}`
          : 'N/A'
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
        // If empty string, set to null (deletion)
        updateData[field] = data[field] === "" ? null : data[field];
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
