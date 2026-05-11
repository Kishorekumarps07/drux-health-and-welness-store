const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const prisma = new PrismaClient();

async function seed() {
  console.log('--- SEEDING TEST ACCOUNTS ---');

  const passwordHash = await bcrypt.hash('password123', 12);

  // 1. Create Admin
  const adminEmail = 'admin@druxx.com';
  const admin = await prisma.user.upsert({
    where: { email: adminEmail },
    update: { roles: ['ADMIN', 'CUSTOMER'], passwordHash },
    create: {
      name: 'Druxx Admin',
      email: adminEmail,
      passwordHash,
      roles: ['ADMIN', 'CUSTOMER'],
      isVerified: true
    }
  });
  console.log('✅ Admin created:', adminEmail);

  // 2. Create Vendor
  const vendorEmail = 'vendor@druxx.com';
  const vendorUser = await prisma.user.upsert({
    where: { email: vendorEmail },
    update: { roles: ['VENDOR', 'CUSTOMER'], passwordHash },
    create: {
      name: 'Druxx Vendor',
      email: vendorEmail,
      passwordHash,
      roles: ['VENDOR', 'CUSTOMER'],
      isVerified: true
    }
  });
  
  const vendor = await prisma.vendor.upsert({
    where: { userId: vendorUser.id },
    update: { approvalStatus: 'ACTIVE' },
    create: {
      userId: vendorUser.id,
      storeName: 'Test Wellness Store',
      storeSlug: 'test-wellness-store',
      storeDescription: 'A premium store for health and wellness products.',
      approvalStatus: 'ACTIVE'
    }
  });
  console.log('✅ Vendor created:', vendorEmail);

  // 3. Create Super Admin (from frontend check)
  const superAdminEmail = 'infopromptix@gmail.com';
  await prisma.user.upsert({
    where: { email: superAdminEmail },
    update: { roles: ['ADMIN', 'CUSTOMER'], passwordHash },
    create: {
      name: 'Super Admin',
      email: superAdminEmail,
      passwordHash,
      roles: ['ADMIN', 'CUSTOMER'],
      isVerified: true
    }
  });
  console.log('✅ Super Admin created:', superAdminEmail);

  console.log('--- SEEDING COMPLETE ---');
  console.log('Credentials: password123');
}

seed()
  .catch(e => console.error(e))
  .finally(() => prisma.$disconnect());
