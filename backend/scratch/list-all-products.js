const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all products in the database...");
  const products = await prisma.product.findMany({
    include: {
      vendor: {
        select: {
          storeName: true,
          approvalStatus: true,
          user: {
            select: {
              email: true
            }
          }
        }
      }
    }
  });
  console.log("All products:", JSON.stringify(products, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
