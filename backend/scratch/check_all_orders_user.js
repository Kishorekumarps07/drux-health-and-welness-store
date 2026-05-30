const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Checking all orders in database...");
  const orders = await prisma.order.findMany({
    include: {
      user: true
    }
  });
  console.log(`Total Orders: ${orders.length}`);
  const missingUser = orders.filter(o => !o.user);
  console.log(`Orders missing user relation: ${missingUser.length}`);
  if (missingUser.length > 0) {
    console.log("Missing User Orders IDs:", missingUser.map(o => o.id));
  } else {
    console.log("All orders have a valid user relation in the DB.");
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
