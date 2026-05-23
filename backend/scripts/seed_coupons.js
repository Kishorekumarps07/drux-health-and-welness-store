const prisma = require('../src/lib/prisma');

const DEFAULT_COUPONS = [
  { code: 'DRUXX10', discountPercent: 10 },
  { code: 'HEALTH20', discountPercent: 20 },
  { code: 'FIRST15', discountPercent: 15 },
  { code: 'ORGANIC25', discountPercent: 25 },
];

async function seed() {
  console.log('--- SEEDING DEFAULT COUPONS ---');
  for (const c of DEFAULT_COUPONS) {
    const exists = await prisma.coupon.findUnique({
      where: { code: c.code },
    });
    if (!exists) {
      await prisma.coupon.create({
        data: c,
      });
      console.log(`Created coupon: ${c.code} (${c.discountPercent}%)`);
    } else {
      console.log(`Coupon ${c.code} already exists.`);
    }
  }
  console.log('--- SEEDING COMPLETE ---');
  await prisma.$disconnect();
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
