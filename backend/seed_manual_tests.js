const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('Seeding manual test data...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // 1. Ensure Categories
  const category1 = await prisma.category.upsert({
    where: { slug: 'supplements' },
    update: {},
    create: { name: 'Supplements', slug: 'supplements', description: 'Health Supplements' }
  });
  
  const category2 = await prisma.category.upsert({
    where: { slug: 'fitness-equipment' },
    update: {},
    create: { name: 'Fitness Equipment', slug: 'fitness-equipment', description: 'Equipment' }
  });

  // 2. Ensure Users (Admin, Customer, Vendor 1, Vendor 2)
  const admin = await prisma.user.upsert({
    where: { email: 'test_admin@druxx.com' },
    update: { roles: ['ADMIN', 'CUSTOMER'] },
    create: { name: 'Test Admin', email: 'test_admin@druxx.com', passwordHash, roles: ['ADMIN', 'CUSTOMER'] }
  });

  const customer = await prisma.user.upsert({
    where: { email: 'test_customer@druxx.com' },
    update: { roles: ['CUSTOMER'] },
    create: { name: 'Test Customer', email: 'test_customer@druxx.com', passwordHash, roles: ['CUSTOMER'] }
  });

  const vendor1User = await prisma.user.upsert({
    where: { email: 'test_vendor@druxx.com' },
    update: { roles: ['VENDOR', 'CUSTOMER'] },
    create: { name: 'Test Vendor 1', email: 'test_vendor@druxx.com', passwordHash, roles: ['VENDOR', 'CUSTOMER'] }
  });

  const vendor2User = await prisma.user.upsert({
    where: { email: 'test_vendor2@druxx.com' },
    update: { roles: ['VENDOR', 'CUSTOMER'] },
    create: { name: 'Test Vendor 2', email: 'test_vendor2@druxx.com', passwordHash, roles: ['VENDOR', 'CUSTOMER'] }
  });

  // 3. Ensure Vendor Profiles
  const vendor1 = await prisma.vendor.upsert({
    where: { userId: vendor1User.id },
    update: { approvalStatus: 'ACTIVE' },
    create: {
      userId: vendor1User.id,
      storeName: 'Vendor 1 Store',
      storeSlug: 'vendor-1-store',
      approvalStatus: 'ACTIVE'
    }
  });

  const vendor2 = await prisma.vendor.upsert({
    where: { userId: vendor2User.id },
    update: { approvalStatus: 'ACTIVE' },
    create: {
      userId: vendor2User.id,
      storeName: 'Vendor 2 Store',
      storeSlug: 'vendor-2-store',
      approvalStatus: 'ACTIVE'
    }
  });

  // 4. Ensure Products
  // Vendor 1
  const v1p1 = await prisma.product.upsert({
    where: { sku: 'V1-PROD-1' },
    update: { stockQty: 100 },
    create: {
      vendorId: vendor1.id,
      categoryId: category1.id,
      title: 'Whey Protein Isolate',
      slug: 'whey-protein-isolate-v1',
      description: 'Premium quality whey protein.',
      price: 2999.99,
      stockQty: 100,
      sku: 'V1-PROD-1'
    }
  });

  const v1p2 = await prisma.product.upsert({
    where: { sku: 'V1-PROD-2' },
    update: { stockQty: 50 },
    create: {
      vendorId: vendor1.id,
      categoryId: category1.id,
      title: 'Creatine Monohydrate',
      slug: 'creatine-monohydrate-v1',
      description: 'Pure creatine monohydrate.',
      price: 999.99,
      stockQty: 50,
      sku: 'V1-PROD-2'
    }
  });

  // Vendor 2
  const v2p1 = await prisma.product.upsert({
    where: { sku: 'V2-PROD-1' },
    update: { stockQty: 20 },
    create: {
      vendorId: vendor2.id,
      categoryId: category2.id,
      title: 'Adjustable Dumbbells Set',
      slug: 'adjustable-dumbbells-v2',
      description: 'Space-saving dumbbells.',
      price: 5499.00,
      stockQty: 20,
      sku: 'V2-PROD-1'
    }
  });

  // 5. Ensure an Address for Customer
  const address = await prisma.address.findFirst({ where: { userId: customer.id } });
  let addressId;
  if (!address) {
    const newAddr = await prisma.address.create({
      data: {
        userId: customer.id,
        label: 'Home',
        fullName: 'Test Customer',
        phone: '1234567890',
        street: '456 Test Blvd',
        city: 'Mumbai',
        state: 'Maharashtra',
        pincode: '400001',
        country: 'India'
      }
    });
    addressId = newAddr.id;
  } else {
    addressId = address.id;
  }

  // 6. Create a multi-vendor Order (if one doesn't exist)
  const existingOrder = await prisma.order.findFirst({
    where: { userId: customer.id, status: 'PROCESSING' }
  });

  if (!existingOrder) {
    const order = await prisma.order.create({
      data: {
        userId: customer.id,
        addressId: addressId,
        status: 'PROCESSING',
        subtotal: 8498.99,
        shippingFee: 100,
        taxAmount: 0,
        total: 8598.99,
        items: {
          create: [
            {
              productId: v1p1.id,
              vendorId: vendor1.id,
              productName: v1p1.title,
              quantity: 1,
              priceAtPurchase: v1p1.price,
              status: 'PENDING'
            },
            {
              productId: v2p1.id,
              vendorId: vendor2.id,
              productName: v2p1.title,
              quantity: 1,
              priceAtPurchase: v2p1.price,
              status: 'PENDING'
            }
          ]
        }
      }
    });
    console.log(`Created multi-vendor order: ${order.id}`);
  }

  console.log('Test data seeded successfully.');
}

seed()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
