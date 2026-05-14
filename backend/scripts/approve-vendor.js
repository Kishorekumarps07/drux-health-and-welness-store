require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function approveVendor(email) {
  console.log(`\n🚀 Approving vendor: ${email}...`);

  const user = await prisma.user.findUnique({ 
    where: { email },
    include: { vendor: true }
  });

  if (!user) {
    console.error('❌ User not found.');
    return;
  }

  if (!user.vendor) {
    console.error('❌ No vendor profile found for this user.');
    return;
  }

  await prisma.vendor.update({
    where: { id: user.vendor.id },
    data: { approvalStatus: 'ACTIVE' }
  });

  console.log(`\n✅ Vendor ${email} is now ACTIVE!`);
}

const email = process.argv[2];
if (!email) {
  console.log('Usage: node approve-vendor.js <email>');
  process.exit(1);
}

approveVendor(email).catch(console.error).finally(() => prisma.$disconnect());
