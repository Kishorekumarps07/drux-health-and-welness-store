const prisma = require('../src/lib/prisma');

async function run() {
  console.log("Starting sequential query execution test...");
  const startAll = Date.now();
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  try {
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

    console.log(`[PASS] Sequential execution of 11 queries: ${Date.now() - startAll}ms`);
    console.log({
      totalUsers, totalVendors, totalProducts, totalOrders, pendingVendors,
      currentRevenue: revenueData._sum.total,
      prevRevenue: prevRevenueData._sum.total,
      currentOrders, prevOrders, newUsers, prevUsers
    });
  } catch (err) {
    console.error(`[FAIL] Sequential execution failed after ${Date.now() - startAll}ms:`, err.message);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
