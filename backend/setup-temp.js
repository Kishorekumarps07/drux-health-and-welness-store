const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cat = await prisma.category.findFirst();
  console.log('\n--- YOUR CATEGORY ID ---');
  console.log(cat ? cat.id : 'No category found');
  console.log('------------------------\n');

  const vendor = await prisma.vendor.findFirst();
  if (vendor) {
    await prisma.vendor.update({
      where: { id: vendor.id },
      data: { approvalStatus: 'APPROVED' }
    });
    console.log('--- VENDOR APPROVED ---');
    console.log('Vendor successfully approved!');
    console.log('-----------------------\n');
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
