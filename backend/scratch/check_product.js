const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function check() {
  try {
    const p = await prisma.product.findFirst({
      orderBy: { createdAt: 'desc' },
      include: { images: true }
    });
    console.log(JSON.stringify(p, null, 2));
  } catch (err) {
    console.error(err);
  } finally {
    await prisma.$disconnect();
  }
}

check();
