const prisma = require('../src/lib/prisma');

async function testQuery(name, fn) {
  const start = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - start;
    console.log(`[PASS] ${name}: ${duration}ms (results count: ${Array.isArray(res) ? res.length : '1'})`);
    return { name, duration, success: true };
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[FAIL] ${name} failed after ${duration}ms:`, err.message);
    return { name, duration, success: false, error: err.message };
  }
}

async function run() {
  console.log("Starting query diagnostic test...");
  
  const now = new Date();
  const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

  const results = [];
  
  results.push(await testQuery("user.count", () => prisma.user.count()));
  results.push(await testQuery("vendor.count", () => prisma.vendor.count()));
  results.push(await testQuery("product.count (active)", () => prisma.product.count({ where: { status: 'ACTIVE' } })));
  results.push(await testQuery("order.count", () => prisma.order.count()));
  results.push(await testQuery("vendor.count (pending)", () => prisma.vendor.count({ where: { approvalStatus: 'PENDING' } })));
  results.push(await testQuery("order.aggregate (revenue 30d)", () => prisma.order.aggregate({ 
    _sum: { total: true }, 
    where: { paymentStatus: 'VERIFIED', createdAt: { gte: thirtyDaysAgo } } 
  })));
  results.push(await testQuery("order.aggregate (revenue 60d)", () => prisma.order.aggregate({ 
    _sum: { total: true }, 
    where: { paymentStatus: 'VERIFIED', createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } } 
  })));
  
  results.push(await testQuery("order.findMany (listAllOrders)", () => prisma.order.findMany({
    where: {},
    skip: 0,
    take: 10,
    orderBy: { createdAt: 'desc' },
    include: {
      user: { select: { id: true, name: true, email: true } },
      items: { include: { product: { select: { id: true, title: true } } } },
    },
  })));

  // Test running Promise.all (like getDashboardStats does)
  console.log("\nTesting Promise.all batch query execution...");
  const startAll = Date.now();
  try {
    await Promise.all([
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
    console.log(`[PASS] Promise.all of 11 queries: ${Date.now() - startAll}ms`);
  } catch (err) {
    console.error(`[FAIL] Promise.all of 11 queries failed after ${Date.now() - startAll}ms:`, err.message);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
