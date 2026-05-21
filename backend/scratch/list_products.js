const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const products = await prisma.product.findMany({
    include: {
      vendor: {
        include: {
          user: true
        }
      }
    }
  });

  console.log("=== PRODUCTS ===");
  products.forEach(p => {
    console.log(`Product ID: ${p.id}`);
    console.log(`Title: ${p.title}`);
    console.log(`Price: ${p.price}`);
    console.log(`Status: ${p.status}`);
    console.log(`Vendor: ${p.vendor ? p.vendor.storeName : 'None'}`);
    console.log(`Vendor Email: ${p.vendor && p.vendor.user ? p.vendor.user.email : 'None'}`);
    console.log(`Vendor ID: ${p.vendorId}`);
    console.log('-----------------------------------');
  });
}

run().catch(console.error).finally(() => prisma.$disconnect());
