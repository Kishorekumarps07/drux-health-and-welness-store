const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching first 5 orders with their user relations...");
  const orders = await prisma.order.findMany({
    take: 5,
    include: {
      user: true,
    }
  });
  console.log("Orders:", JSON.stringify(orders.map(o => ({
    id: o.id,
    userId: o.userId,
    user: o.user ? { id: o.user.id, name: o.user.name, email: o.user.email } : null
  })), null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
