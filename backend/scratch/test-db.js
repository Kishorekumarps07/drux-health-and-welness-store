const { PrismaClient } = require('@prisma/client');
const directUrl = "postgresql://postgres.uflcqzbqmnmmycvpzjud:JafferMD%40121225@aws-1-ap-southeast-1.pooler.supabase.com:5432/postgres";
console.log("Using DATABASE_URL:", directUrl);



async function main() {
  const prisma = new PrismaClient({
    datasources: { db: { url: directUrl } },
    log: ['query']
  });
  
  console.time("Prisma Connect and Count");
  try {
    const userCount = await prisma.user.count();
    console.log("User count:", userCount);
  } catch (err) {
    console.error("Error during count:", err);
  }
  console.timeEnd("Prisma Connect and Count");

  console.time("Prisma Parallel Queries");
  try {
    const start = Date.now();
    const results = await Promise.all([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.category.count()
    ]);
    console.log("Results:", results);
  } catch (err) {
    console.error("Error during parallel query:", err);
  }
  console.timeEnd("Prisma Parallel Queries");

  console.time("Prisma Transaction Queries");
  try {
    const results = await prisma.$transaction([
      prisma.user.count(),
      prisma.vendor.count(),
      prisma.product.count({ where: { status: 'ACTIVE' } }),
      prisma.order.count(),
      prisma.category.count()
    ]);
    console.log("Transaction Results:", results);
  } catch (err) {
    console.error("Error during transaction query:", err);
  }
  console.timeEnd("Prisma Transaction Queries");

  await prisma.$disconnect();
}

main();
