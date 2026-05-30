const prisma = require('../src/lib/prisma');
async function main() {
  const users = await prisma.user.count();
  const products = await prisma.product.count();
  const vendors = await prisma.vendor.count();
  const orders = await prisma.order.count();
  console.log({ users, products, vendors, orders });
  await prisma.$disconnect();
}
main().catch(console.error);
