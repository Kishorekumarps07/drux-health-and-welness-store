require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('\n📦 Seeding sample products for vendor@druxx.com...\n');

  const vendor = await prisma.vendor.findFirst({ 
    where: { user: { email: 'vendor@druxx.com' } } 
  });

  if (!vendor) {
    console.error('❌ Vendor vendor@druxx.com not found. Run setup-test-auth.js first.');
    return;
  }

  const category = await prisma.category.findFirst();
  if (!category) {
    console.error('❌ No categories found. Please create a category first.');
    return;
  }

  const products = [
    {
      title: 'Premium Whey Protein',
      slug: 'premium-whey-protein-' + Date.now(),
      sku: 'PROT-' + Date.now(),
      description: 'High quality protein for muscle recovery.',
      price: 2499,
      stockQty: 50,
      categoryId: category.id,
      vendorId: vendor.id,
    },
    {
      title: 'Organic Multivitamin',
      slug: 'organic-multivitamin-' + (Date.now() + 1),
      sku: 'VITA-' + (Date.now() + 1),
      description: 'Daily essential vitamins from organic sources.',
      price: 899,
      stockQty: 100,
      categoryId: category.id,
      vendorId: vendor.id,
    },
    {
      title: 'Eco-Friendly Yoga Mat',
      slug: 'yoga-mat-eco-' + (Date.now() + 2),
      sku: 'YOGA-' + (Date.now() + 2),
      description: 'Non-slip, sustainable rubber mat.',
      price: 1599,
      stockQty: 30,
      categoryId: category.id,
      vendorId: vendor.id,
    }
  ];

  for (const p of products) {
    await prisma.product.create({ data: p });
    console.log(`  ✅ Added: ${p.title}`);
  }

  console.log('\n🎉 Products seeded successfully!');
}

main().catch(console.error).finally(() => prisma.$disconnect());
