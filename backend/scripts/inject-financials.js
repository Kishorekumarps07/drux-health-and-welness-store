require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function injectFinancials(email) {
  console.log(`\n💸 Injecting financial data for: ${email}...`);

  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { vendor: true }
  });

  if (!user || !user.vendor) {
    console.error('❌ Vendor not found.');
    return;
  }

  const vendorId = user.vendor.id;

  // 1. Create a dummy product if none exist (needed for order items)
  let product = await prisma.product.findFirst({ where: { vendorId } });
  if (!product) {
    product = await prisma.product.create({
      data: {
        title: "Test Wellness Booster",
        price: 1500,
        stockQty: 100,
        categoryId: (await prisma.category.findFirst())?.id || "temp-cat",
        vendorId: vendorId,
        slug: `test-product-${Date.now()}`
      }
    });
  }

  // 2. Create some dummy OrderItems (Revenue)
  console.log('--- Generating Sales ---');
  const dummyOrder = await prisma.order.create({
    data: {
      userId: user.id,
      addressId: (await prisma.address.findFirst({ where: { userId: user.id } }))?.id || (await prisma.address.findFirst())?.id,
      subtotal: 4500,
      total: 4500,
      status: 'DELIVERED',
      paymentStatus: 'VERIFIED',
    }
  });

  await prisma.orderItem.createMany({
    data: [
      {
        orderId: dummyOrder.id,
        productId: product.id,
        vendorId: vendorId,
        title: product.title,
        price: 1500,
        quantity: 2,
        total: 3000,
        status: 'DELIVERED',
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
      },
      {
        orderId: dummyOrder.id,
        productId: product.id,
        vendorId: vendorId,
        title: product.title,
        price: 1500,
        quantity: 1,
        total: 1500,
        status: 'DELIVERED',
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000)
      }
    ]
  });

  // 3. Create a Payout
  console.log('--- Generating Payouts ---');
  await prisma.vendorPayout.create({
    data: {
      vendorId: vendorId,
      amount: 2000,
      periodStart: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000),
      periodEnd: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
      status: 'PROCESSED',
      processedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000)
    }
  });

  console.log(`\n✅ Financial injection complete!`);
  console.log(`Total Sales Created: ₹4500`);
  console.log(`Total Withdrawn: ₹2000`);
  console.log(`Expected Balance: ₹2500`);
}

injectFinancials('mrcoachofficial@gmail.com').catch(console.error).finally(() => prisma.$disconnect());
