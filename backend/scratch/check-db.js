const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching products and their vendors...");
  const products = await prisma.product.findMany({
    select: {
      id: true,
      title: true,
      sku: true,
      vendor: {
        select: {
          id: true,
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
  console.log("Products:", JSON.stringify(products, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
