const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Fetching all users in DB with roles...");
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      roles: true
    }
  });
  console.log("Users:", JSON.stringify(users, null, 2));
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
