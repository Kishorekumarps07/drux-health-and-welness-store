const prisma = require('../src/lib/prisma');
async function main() {
  const vendors = await prisma.vendor.findMany({
    include: {
      _count: { select: { products: true } },
      user: { select: { email: true } }
    }
  });
  console.log(vendors.map(v => ({ id: v.id, storeName: v.storeName, email: v.user?.email, productCount: v._count.products })));
  await prisma.$disconnect();
}
main().catch(console.error);
