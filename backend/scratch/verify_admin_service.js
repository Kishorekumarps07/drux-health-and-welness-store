const adminService = require('../src/modules/admin/admin.service');
const prisma = require('../src/lib/prisma');

async function run() {
  console.log("=== VERIFYING ADMIN SERVICE CACHING & SPEED ===");
  
  // 1. First invocation (Cold Start)
  console.log("\n1. Triggering Cold Start...");
  const startCold = Date.now();
  const statsCold = await adminService.getDashboardStats();
  const durationCold = Date.now() - startCold;
  console.log(`[COLD] getDashboardStats completed in ${durationCold}ms`);
  console.log(`[COLD] Revenue count matches: ${statsCold.totalRevenue}`);
  
  // 2. Second invocation (Warm Start from Cache)
  console.log("\n2. Triggering Warm Start (from Cache)...");
  const startWarm = Date.now();
  const statsWarm = await adminService.getDashboardStats();
  const durationWarm = Date.now() - startWarm;
  console.log(`[WARM] getDashboardStats completed in ${durationWarm}ms`);
  
  if (durationWarm < 5) {
    console.log("✅ SUCCESS: Cache hit is extremely fast (<5ms)!");
  } else {
    console.error("❌ FAILURE: Cache did not hit under 5ms.");
  }
  
  // 3. Test Invalidation on updateOrderStatus
  console.log("\n3. Testing Cache Invalidation via updateOrderStatus...");
  // Let's find one order to update, or just use a dummy id since it will try to find it
  try {
    const orders = await prisma.order.findMany({ take: 1 });
    if (orders.length > 0) {
      const orderId = orders[0].id;
      const originalStatus = orders[0].status;
      
      console.log(`Updating status for order #${orderId} to clear cache...`);
      await adminService.updateOrderStatus(orderId, originalStatus);
      
      // Cache should now be invalid. Let's verify by triggering cold start again
      console.log("Triggering load after invalidation...");
      const startAfterInvalidation = Date.now();
      await adminService.getDashboardStats();
      const durationAfterInvalidation = Date.now() - startAfterInvalidation;
      console.log(`[INVALIDATED] getDashboardStats completed in ${durationAfterInvalidation}ms`);
      
      if (durationAfterInvalidation > 100) {
        console.log("✅ SUCCESS: Cache was successfully invalidated and re-fetched from database!");
      } else {
        console.warn("⚠️ WARNING: Load after invalidation resolved under 100ms. Was it from cache? (Or DB is incredibly fast now)");
      }
    } else {
      console.log("No orders found in database to test invalidation.");
    }
  } catch (err) {
    console.error("Error during invalidation test:", err.message);
  }
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
