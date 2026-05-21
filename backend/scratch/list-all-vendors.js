const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all vendors and their details...");
  const vendors = await prisma.vendor.findMany({
    select: {
      id: true,
      storeName: true,
      approvalStatus: true,
      userId: true,
      user: {
        select: {
          email: true,
          roles: true
        }
      },
      _count: {
        select: {
          products: true
        }
      }
    }
  });
  console.log("Vendors in DB:", JSON.stringify(vendors, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
