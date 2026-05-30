const prisma = require('../src/lib/prisma');

async function run() {
  console.log("=== COMPARING FINDFIRST(OR) VS FINDUNIQUE ===");
  
  // Find a test user id and email
  const testUser = await prisma.user.findFirst();
  if (!testUser) {
    console.log("No users found to test.");
    return;
  }
  
  const userId = testUser.id;
  const email = testUser.email;
  console.log(`Testing with user: id=${userId}, email=${email}`);
  
  // Test findFirst with OR (original logic)
  const startFirst = Date.now();
  const u1 = await prisma.user.findFirst({
    where: { 
      OR: [
        { id: userId },
        { email: email }
      ]
    }
  });
  console.log(`[findFirst with OR] Completed in ${Date.now() - startFirst}ms (found: ${!!u1})`);
  
  // Test findUnique by ID
  const startUniqueId = Date.now();
  const u2 = await prisma.user.findUnique({
    where: { id: userId }
  });
  console.log(`[findUnique by ID] Completed in ${Date.now() - startUniqueId}ms (found: ${!!u2})`);
  
  // Test findUnique by Email
  const startUniqueEmail = Date.now();
  const u3 = await prisma.user.findUnique({
    where: { email: email }
  });
  console.log(`[findUnique by Email] Completed in ${Date.now() - startUniqueEmail}ms (found: ${!!u3})`);
}

run()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
