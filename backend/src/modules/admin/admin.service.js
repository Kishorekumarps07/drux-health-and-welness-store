const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const Cache = require('../../lib/cache');

const CACHE_TTL = 30; // 30 seconds cache TTL

const clearAdminCache = async () => {
  try {
    await Cache.clearPattern('admin:*');
  } catch (err) {
    // Suppress potential Redis clear errors
  }

  try {
    const { clearAuthUserCache } = require('../../middleware/auth');
    clearAuthUserCache();
  } catch (err) {
    // Suppress potential require failures during startup
  }
};

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

    await clearAdminCache();

    // Clear product, vendor route caches, and vendor stats cache
    try {
      await Cache.clearPattern('cache:*products*');
      await Cache.clearPattern('cache:*vendors*');
      await Cache.clearPattern('vendor:*');
    } catch (err) {
      // Suppress potential clear errors
    }

    return updatedVendor;
  }

  // ── Analytics ──────────────────────────────────────────────────────────────

  async getDashboardStats() {
    const cached = await Cache.get('admin:stats');
    if (cached) {
      return cached;
    }

    const today = new Date();
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(today.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Run queries sequentially to prevent Supabase connection pooler starvation
    const totalUsers = await prisma.user.count();
    const totalVendors = await prisma.vendor.count();
    const totalProducts = await prisma.product.count({ where: { status: 'ACTIVE' } });
    const totalOrders = await prisma.order.count();
    const pendingVendors = await prisma.vendor.count({ where: { approvalStatus: 'PENDING' } });
    
    const revenueData = await prisma.order.aggregate({ 
      _sum: { total: true }, 
      where: { paymentStatus: 'VERIFIED', createdAt: { gte: thirtyDaysAgo } } 
    });
    
    const prevRevenueData = await prisma.order.aggregate({ 
      _sum: { total: true }, 
      where: { paymentStatus: 'VERIFIED', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } 
    });
    
    const currentOrders = await prisma.order.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
    const prevOrders = await prisma.order.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });
    const newUsers = await prisma.user.count({ where: { createdAt: { gte: thirtyDaysAgo } } });
    const prevUsers = await prisma.user.count({ where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } });

    const calculateGrowth = (current, previous) => {
      if (!previous || previous === 0) return current > 0 ? `+${current}` : "0%";
      const growth = ((current - previous) / previous) * 100;
      return `${growth >= 0 ? '+' : ''}${growth.toFixed(1)}%`;
    };

    const currentRevenue = Number(revenueData._sum.total || 0);
    const prevRevenue = Number(prevRevenueData._sum.total || 0);

    const result = {
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

    // Save to cache
    await Cache.set('admin:stats', result, CACHE_TTL);

    return result;
  }

  async getRevenueAnalytics(range = '7d') {
    const cached = await Cache.get(`admin:revenue:${range}`);
    if (cached) {
      return cached;
    }

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

    const result = Object.values(data);

    // Save to cache
    await Cache.set(`admin:revenue:${range}`, result, CACHE_TTL);

    return result;
  }

  async getTopPerformance() {
    const cached = await Cache.get('admin:performance');
    if (cached) {
      return cached;
    }

    // Run sequentially to reduce pool contention
    const topVendors = await prisma.vendor.findMany({
      take: 5,
      orderBy: { totalSales: 'desc' },
      select: { storeName: true, totalSales: true, rating: true }
    });

    const topProducts = await prisma.product.findMany({
      take: 5,
      orderBy: { averageRating: 'desc' }, // Placeholder for 'sold count' if available
      select: { title: true, averageRating: true, price: true, vendor: { select: { storeName: true } } }
    });

    const result = { topVendors, topProducts };

    // Save to cache
    await Cache.set('admin:performance', result, CACHE_TTL);

    return result;
  }

  async getActivityFeed() {
    const cached = await Cache.get('admin:feed');
    if (cached) {
      return cached;
    }

    // Run sequentially to reduce pool contention
    const recentOrders = await prisma.order.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      include: { user: { select: { name: true } } }
    });

    const newUsers = await prisma.user.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { name: true, createdAt: true, roles: true }
    });

    const newVendors = await prisma.vendor.findMany({
      take: 5,
      orderBy: { createdAt: 'desc' },
      select: { storeName: true, createdAt: true, approvalStatus: true }
    });

    const feed = [
      ...recentOrders.map(o => ({ type: 'ORDER', title: `New Order #${o.id.slice(0, 8)}`, user: o.user?.name, date: o.createdAt, amount: o.total })),
      ...newUsers.map(u => ({ type: 'USER', title: `New User Registered`, user: u.name, date: u.createdAt })),
      ...newVendors.map(v => ({ type: 'VENDOR', title: `New Vendor Application`, user: v.storeName, date: v.createdAt, status: v.approvalStatus }))
    ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    const result = feed.slice(0, 10);

    // Save to cache
    await Cache.set('admin:feed', result, CACHE_TTL);

    return result;
  }

  // ── Orders (Admin view) ────────────────────────────────────────────────────

  async listAllOrders({ page = 1, limit = 20, status, search }) {
    const skip = (page - 1) * limit;
    
    const where = {
      ...(status ? { status } : {}),
      ...(search ? {
        OR: [
          { id: { contains: search, mode: "insensitive" } },
          { user: { name: { contains: search, mode: "insensitive" } } },
          { user: { email: { contains: search, mode: "insensitive" } } },
        ]
      } : {})
    };

    // Run sequentially to prevent connection pooler starvation
    const orders = await prisma.order.findMany({
      where, skip, take: +limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { id: true, name: true, email: true } },
        address: true,
        items: { include: { product: { select: { id: true, title: true } } } },
      },
    });

    const total = await prisma.order.count({ where });

    return { orders, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async updateOrderStatus(orderId, status) {
    const order = await prisma.order.findUnique({ where: { id: orderId } });
    if (!order) throw new AppError('Order not found.', 404);
    
    const updatedOrder = await prisma.order.update({ where: { id: orderId }, data: { status } });
    await clearAdminCache();
    return updatedOrder;
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

    const [users, total] = await Promise.all([
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
      orderBy: { stockQty: 'asc' },
      include: {
        vendor: { select: { storeName: true, id: true } }
      }
    });

    const stats = await prisma.product.aggregate({
      _sum: { stockQty: true },
      _count: { id: true },
    });

    // Calculate total inventory value
    const allProducts = await prisma.product.findMany({ select: { price: true, stockQty: true } });
    const totalValue = allProducts.reduce((acc, curr) => acc + (Number(curr.price) * curr.stockQty), 0);

    return { 
      products, 
      stats: {
        totalSkus: stats._count.id,
        totalStock: stats._sum.stockQty || 0,
        totalValue,
        capacity: 72 // Placeholder or logic for storage
      }
    };
  }
  // ── Newsletter Subscriber Management ─────────────────────────────────────

  async listNewsletterSubscribers({ page = 1, limit = 50, search }) {
    const skip = (page - 1) * limit;
    const where = {
      ...(search && { email: { contains: search.toLowerCase().trim(), mode: 'insensitive' } }),
    };

    const [subscribers, total] = await Promise.all([
      prisma.newsletterSubscription.findMany({
        where, skip, take: +limit,
        orderBy: { createdAt: 'desc' },
      }),
      prisma.newsletterSubscription.count({ where }),
    ]);

    return { subscribers, total, page: +page, pages: Math.ceil(total / limit) };
  }

  async deleteNewsletterSubscriber(email) {
    const existing = await prisma.newsletterSubscription.findUnique({
      where: { email: email.toLowerCase().trim() }
    });
    if (!existing) throw new AppError('Subscriber not found.', 404);
    await prisma.newsletterSubscription.delete({ where: { email: email.toLowerCase().trim() } });
    return { success: true };
  }

  /**
   * Send a newsletter email blast to all subscribers.
   * Sends in batches of 50 to avoid SMTP rate limits.
   * @param {string} subject  - Email subject line
   * @param {string} body     - Admin-composed HTML/text body
   * @returns {Promise<{sent: number, failed: number}>}
   */
  async sendNewsletter(subject, body) {
    const { sendEmail } = require('../../lib/email');

    // Fetch ALL subscribers (no limit)
    const subscribers = await prisma.newsletterSubscription.findMany({
      select: { email: true },
      orderBy: { createdAt: 'asc' },
    });

    if (subscribers.length === 0) {
      return { sent: 0, failed: 0, total: 0 };
    }

    // Wrap body in a branded HTML shell
    const html = `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f4f4f4;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#f4f4f4;padding:32px 0;">
    <tr><td align="center">
      <table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:16px;overflow:hidden;max-width:600px;width:100%;">
        <!-- Header -->
        <tr>
          <td style="background:#1E1E1E;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-size:22px;font-weight:900;color:#A6D608;letter-spacing:-0.5px;">DRUX HEALTH STORE</p>
            <p style="margin:4px 0 0;font-size:11px;color:#9CA3AF;text-transform:uppercase;letter-spacing:2px;">Health &amp; Wellness</p>
          </td>
        </tr>
        <!-- Body -->
        <tr>
          <td style="padding:40px 40px 32px;">
            ${body}
          </td>
        </tr>
        <!-- Footer -->
        <tr>
          <td style="background:#F9FAFB;padding:24px 40px;border-top:1px solid #E5E7EB;text-align:center;">
            <p style="margin:0;font-size:12px;color:#9CA3AF;">
              You're receiving this because you subscribed to Drux Health Store newsletters.<br/>
              <a href="https://drux.in" style="color:#A6D608;text-decoration:none;">Visit our store</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

    const BATCH_SIZE = 50;
    let sent = 0;
    let failed = 0;

    for (let i = 0; i < subscribers.length; i += BATCH_SIZE) {
      const batch = subscribers.slice(i, i + BATCH_SIZE);
      await Promise.allSettled(
        batch.map(async (sub) => {
          try {
            await sendEmail({ to: sub.email, subject, html });
            sent++;
          } catch {
            failed++;
          }
        })
      );
      // Small delay between batches to be kind to SMTP server
      if (i + BATCH_SIZE < subscribers.length) {
        await new Promise(resolve => setTimeout(resolve, 500));
      }
    }

    console.log(`[NEWSLETTER] Blast sent: ${sent} delivered, ${failed} failed, ${subscribers.length} total`);
    return { sent, failed, total: subscribers.length };
  }
}

module.exports = new AdminService();
