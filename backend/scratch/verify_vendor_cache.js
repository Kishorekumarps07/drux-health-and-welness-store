const prisma = require('../src/lib/prisma');
const vendorStatsService = require('../src/modules/vendor/vendorStats.service');
const vendorProfileService = require('../src/modules/vendor/vendorProfile.service');
const vendorOrdersService = require('../src/modules/vendor/vendorOrders.service');

async function run() {
  console.log("=== VERIFYING VENDOR SERVICE CACHING & SPEED ===");
  
  // Find a test vendor
  const vendor = await prisma.vendor.findFirst();
  if (!vendor) {
    console.log("No vendors found to test.");
    return;
  }
  const userId = vendor.userId;
  console.log(`Testing with Vendor: ${vendor.storeName}, userId: ${userId}`);

  // 1. Cold Start
  console.log("\n1. Triggering Cold Start...");
  const startCold = Date.now();
  const statsCold = await vendorStatsService.getDashboardStats(userId);
  const durationCold = Date.now() - startCold;
  console.log(`[COLD] getDashboardStats completed in ${durationCold}ms`);
  
  // 2. Warm Start from Cache
  console.log("\n2. Triggering Warm Start (from Cache)...");
  const startWarm = Date.now();
  const statsWarm = await vendorStatsService.getDashboardStats(userId);
  const durationWarm = Date.now() - startWarm;
  console.log(`[WARM] getDashboardStats completed in ${durationWarm}ms`);
  
  if (durationWarm < 5) {
    console.log("✅ SUCCESS: Vendor Stats Cache hit is extremely fast (<5ms)!");
  } else {
    console.error("❌ FAILURE: Vendor Stats Cache did not hit.");
  }

  // 3. Trigger Analytics Cold/Warm Starts
  console.log("\n3. Triggering Analytics Cold and Warm Starts...");
  const startAnalCold = Date.now();
  await vendorProfileService.getAnalytics(userId);
  console.log(`[COLD] getAnalytics completed in ${Date.now() - startAnalCold}ms`);
  
  const startAnalWarm = Date.now();
  await vendorProfileService.getAnalytics(userId);
  console.log(`[WARM] getAnalytics completed in ${Date.now() - startAnalWarm}ms`);
  
  // 4. Test Invalidation via updateItemStatus
  console.log("\n4. Testing Cache Invalidation via updateItemStatus...");
  try {
    const orderItems = await prisma.orderItem.findMany({ where: { vendorId: vendor.id }, take: 1 });
    if (orderItems.length > 0) {
      const item = orderItems[0];
      console.log(`Updating status for orderItem #${item.id} to trigger invalidation...`);
      await vendorOrdersService.updateItemStatus(userId, item.id, item.status);
      
      // Verification: next load must be cold
      const startAfterInvalidation = Date.now();
      await vendorStatsService.getDashboardStats(userId);
      const durationAfterInvalidation = Date.now() - startAfterInvalidation;
      console.log(`[INVALIDATED] getDashboardStats completed in ${durationAfterInvalidation}ms`);
      
      if (durationAfterInvalidation > 20) {
        console.log("✅ SUCCESS: Vendor cache was successfully cleared and re-fetched!");
      } else {
        console.warn("⚠️ WARNING: Load after invalidation was extremely fast. Make sure database is not just fast.");
      }
    } else {
      console.log("No order items found to test invalidation.");
    }
  } catch (err) {
    console.error("Error during invalidation test:", err.message);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
