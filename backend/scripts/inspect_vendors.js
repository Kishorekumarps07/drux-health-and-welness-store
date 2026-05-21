const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const users = await prisma.user.findMany({
    include: { vendor: true }
  });
  console.log("=== USERS & VENDORS ===");
  users.forEach(u => {
    console.log(`Email: ${u.email}`);
    console.log(`Roles: ${JSON.stringify(u.roles)}`);
    console.log(`Vendor: ${u.vendor ? `${u.vendor.storeName} (${u.vendor.approvalStatus})` : 'None'}`);
    console.log('-----------------------------------');
  });
}

run().catch(console.error).finally(() => prisma.$disconnect());
