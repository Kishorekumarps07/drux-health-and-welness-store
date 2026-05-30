const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all order items...");
  const items = await prisma.orderItem.findMany();
  console.log(`Total OrderItems in DB: ${items.length}`);
  if (items.length > 0) {
    console.log("Unique Order IDs in OrderItems:", [...new Set(items.map(item => item.orderId))]);
    console.log("Sample OrderItem:", JSON.stringify(items[0], null, 2));
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
