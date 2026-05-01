const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

class AdminService {
  // ── Vendor Management ──────────────────────────────────────────────────────

  async listVendors({ page = 1, limit = 20, status, search }) {
    const skip = (page - 1) * limit;
    const where = {
      ...(status && { approvalStatus: status }),
      ...(search && { storeName: { contains: search, mode: 'insensitive' } }),
    };

    const [vendors, total] = await prisma.$transaction([
      prisma.vendor.findMany({
        where, skip, take: +limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          _count: { select: { products: true, orderItems: true } },
        },
      }),
      prisma.vendor.count({ where }),
    ]);

    return { vendors, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async updateVendorStatus(vendorId, status, reason) {
    const vendor = await prisma.vendor.findUnique({ 
      where: { id: vendorId },
      include: { user: true }
    });
    if (!vendor) throw new AppError('Vendor not found.', 404);

    const updatedVendor = await prisma.vendor.update({
      where: { id: vendorId },
      data: { 
        approvalStatus: status,
        rejectionReason: status === 'REJECTED' ? reason : null
      },
      include: { user: { select: { id: true, name: true, email: true, roles: true } } },
    });

    // If status is APPROVED or ACTIVE, ensure VENDOR role is present
    if (['APPROVED', 'ACTIVE'].includes(status)) {
       const roles = Array.from(new Set([...updatedVendor.user.roles, 'VENDOR']));
       await prisma.user.update({
          where: { id: updatedVendor.user.id },
          data: { roles }
       });
    }

    return updatedVendor;
  }

  // ── Analytics ──────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const [
      totalUsers, totalVendors, totalProducts, totalOrders,
      pendingVendors, revenueData, 
      prevRevenueData, currentOrders, prevOrders,
      newUsers, prevUsers
    ] = await prisma.$transaction([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.vendor.count({ where: { approvalStatus: 'PENDING' } }),
      prisma.order.aggregate({ 
        _sum: { total: true }, 
        where: { paymentStatus: 'VERIFIED', createdAt: { gte: thirtyDaysAgo } } 
      }),
      prisma.order.aggregate({ 
        _sum: { total: true }, 
        where: { paymentStatus: 'VERIFIED', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } 
      }),
      prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } }),
      prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } }),
    ]);

    const calculateGrowth = (current, previous) => {
      if (!previous || previous === 0) return current > 0 ? `+${current}` : "0%";
      const growth = ((current - previous) / previous) * 100;
      return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    };

    const currentRevenue = Number(revenueData._sum.total || 0);
    const prevRevenue = Number(prevRevenueData._sum.total || 0);

    return {
      totalUsers,
      totalVendors,
      totalProducts,
      totalOrders,
      pendingVendors,
      totalRevenue: currentRevenue,
      growth: {
        revenue: calculateGrowth(currentRevenue, prevRevenue),
        orders: calculateGrowth(currentOrders, prevOrders),
        users: calculateGrowth(newUsers, prevUsers),
        vendors: `+${newUsers} total` // Showing velocity for vendors
      }
    };
  }

  async getRevenueAnalytics(range = '7d') {
    const days = range === '30d' ? 30 : 7;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - (days - 1));
    startDate.setHours(0, 0, 0, 0);

    const orders = await prisma.order.findMany({
      where: {
        createdAt: { gte: startDate },
        paymentStatus: 'VERIFIED'
      },
      select: { createdAt: true, total: true },
      orderBy: { createdAt: 'asc' }
    });

    // Simple grouping by date
    const data = {};
    for (let i = 0; i < days; i++) {
      const d = new Date(startDate);
      d.setDate(d.getDate() + i);
      const key = d.toISOString().split('T')[0];
      data[key] = { date: key, revenue: 0, orders: 0 };
    }

    orders.forEach(order => {
      const key = order.createdAt.toISOString().split('T')[0];
      if (data[key]) {
        data[key].revenue += Number(order.total);
        data[key].orders += 1;
      }
    });

    return Object.values(data);
  }

  async getTopPerformance() {
    const [topVendors, topProducts] = await prisma.$transaction([
      prisma.vendor.findMany({
        take: 5,
        orderBy: { totalSales: 'desc' },
        select: { storeName: true, totalSales: true, rating: true }
      }),
      prisma.product.findMany({
        take: 5,
        orderBy: { averageRating: 'desc' }, // Placeholder for 'sold count' if available
        select: { title: true, averageRating: true, price: true, vendor: { select: { storeName: true } } }
      })
    ]);

    return { topVendors, topProducts };
  }

  async getActivityFeed() {
    const [recentOrders, newUsers, newVendors] = await prisma.$transaction([
      prisma.order.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        include: { user: { select: { name: true } } }
      }),
      prisma.user.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { name: true, createdAt: true, roles: true }
      }),
      prisma.vendor.findMany({
        take: 5,
        orderBy: { createdAt: 'desc' },
        select: { storeName: true, createdAt: true, approvalStatus: true }
      })
    ]);

    const feed = [
      ...recentOrders.map(o => ({ type: 'ORDER', title: `New Order #${o.id.slice(0, 8)}`, user: o.user?.name, date: o.createdAt, amount: o.total })),
      ...newUsers.map(u => ({ type: 'USER', title: `New User Registered`, user: u.name, date: u.createdAt })),
      ...newVendors.map(v => ({ type: 'VENDOR', title: `New Vendor Application`, user: v.storeName, date: v.createdAt, status: v.approvalStatus }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    return feed.slice(0, 10);
  }

  // ── Orders (Admin view) ────────────────────────────────────────────────────

  async listAllOrders({ page = 1, limit = 20, status }) {
    const skip = (page - 1) * limit;
    const where = status ? { status } : {};
    const [orders, total] = await prisma.$transaction([
      prisma.order.findMany({
        where, skip, take: +limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { id: true, name: true, email: true } },
          items: { include: { product: { select: { id: true, title: true } } } },
        },
      }),
      prisma.order.count({ where }),
    ]);
    return { orders, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async updateOrderStatus(orderId, status) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found.', 404);
    return prisma.order.update({ where: { id: orderId }, data: { status } });
  }

  // ── User Management ────────────────────────────────────────────────────────

  async listUsers({ page = 1, limit = 20, role, search }) {
    const skip = (page - 1) * limit;
    const where = {
      ...(role && { roles: { has: role } }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } },
        ],
      }),
    };

    const [users, total] = await prisma.$transaction([
      prisma.user.findMany({
        where, skip, take: +limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          name: true,
          email: true,
          roles: true,
          isVerified: true,
          createdAt: true,
          vendor: { select: { id: true, storeName: true, approvalStatus: true } }
        }
      }),
      prisma.user.count({ where }),
    ]);

    return { users, total, page: +page, pages: Math.ceil(total / limit) };
  }

  // ── Inventory Management ───────────────────────────────────────────────────

  async listInventory({ search }) {
    const where = {
      ...(search && {
        OR: [
          { title: { contains: search, mode: 'insensitive' } },
          { sku: { contains: search, mode: 'insensitive' } },
          { vendor: { storeName: { contains: search, mode: 'insensitive' } } },
        ]
      })
    };

    const products = await prisma.product.findMany({
      where,
      orderBy: { stock: 'asc' },
      include: {
        vendor: { select: { storeName: true, id: true } }
      }
    });

    const stats = await prisma.product.aggregate({
      _sum: { stock: true },
      _count: { id: true },
      // total value = price * stock (prisma aggregate can't do this easily, we'll calc in service)
    });

    // Calculate total inventory value
    const allProducts = await prisma.product.findMany({ select: { price: true, stock: true } });
    const totalValue = allProducts.reduce((acc, curr) => acc + (Number(curr.price) * curr.stock), 0);

    return { 
      products, 
      stats: {
        totalSkus: stats._count.id,
        totalStock: stats._sum.stock || 0,
        totalValue,
        capacity: 72 // Placeholder or logic for storage
      }
    };
  }
}

module.exports = new AdminService();
