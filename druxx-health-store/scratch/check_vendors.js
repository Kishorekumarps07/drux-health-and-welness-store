const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const vendors = await prisma.vendor.findMany({
    take: 10,
    select: {
      id: true,
      storeName: true,
      approvalStatus: true,
      rating: true
    }
  });
  console.log(JSON.stringify(vendors, null, 2));
}

main()
  .catch(e => console.error(e))
  .finally(async () => await prisma.$disconnect());
