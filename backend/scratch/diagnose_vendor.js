const prisma = require('../src/lib/prisma');
const vendorStatsService = require('../src/modules/vendor/vendorStats.service');
const vendorProfileService = require('../src/modules/vendor/vendorProfile.service');
const vendorOrdersService = require('../src/modules/vendor/vendorOrders.service');

async function testQuery(name, fn) {
  const start = Date.now();
  try {
    const res = await fn();
    const duration = Date.now() - start;
    console.log(`[PASS] ${name}: ${duration}ms`);
    return { name, duration, success: true };
  } catch (err) {
    const duration = Date.now() - start;
    console.error(`[FAIL] ${name} failed after ${duration}ms:`, err.message);
    return { name, duration, success: false, error: err.message };
  }
}

async function run() {
  console.log("Starting Vendor queries diagnostic test...");
  
  // Find a test vendor user
  const vendor = await prisma.vendor.findFirst({
    include: { user: true }
  });
  
  if (!vendor) {
    console.log("No vendors found in database.");
    return;
  }
  
  const userId = vendor.userId;
  console.log(`Testing with Vendor: ${vendor.storeName}, userId: ${userId}`);
  
  // Test sequential execution of the 3 dashboard endpoints
  console.log("\nTesting sequential dashboard fetching...");
  const startSeq = Date.now();
  await testQuery("vendorStatsService.getDashboardStats", () => vendorStatsService.getDashboardStats(userId));
  await testQuery("vendorOrdersService.getMyOrderItems", () => vendorOrdersService.getMyOrderItems(userId, { limit: 6, status: 'PENDING' }));
  await testQuery("vendorProfileService.getAnalytics", () => vendorProfileService.getAnalytics(userId));
  console.log(`[PASS] Sequential dashboard completed in ${Date.now() - startSeq}ms`);
  
  // Test Promise.all of the 3 dashboard endpoints
  console.log("\nTesting concurrent Promise.all dashboard fetching...");
  const startAll = Date.now();
  try {
    await Promise.all([
      vendorStatsService.getDashboardStats(userId),
      vendorOrdersService.getMyOrderItems(userId, { limit: 6, status: 'PENDING' }),
      vendorProfileService.getAnalytics(userId)
    ]);
    console.log(`[PASS] Promise.all of 3 dashboard endpoints completed in ${Date.now() - startAll}ms`);
  } catch (err) {
    console.error(`[FAIL] Promise.all failed after ${Date.now() - startAll}ms:`, err.message);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
