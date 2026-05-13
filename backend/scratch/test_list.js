const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const query = { category: 'Supplements' };
  const { search, categoryId, category, vendorId, minPrice, maxPrice, rating, status, sort = 'createdAt', order = 'desc', tags } = query;

  const where = {
    status: status || 'ACTIVE',
    vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } },
    ...(search && { OR: [
      { title: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ]}),
    ...(categoryId && { categoryId }),
    ...(category && {
      category: {
        OR: [
          { name: { equals: category, mode: 'insensitive' } },
          { slug: { equals: category, mode: 'insensitive' } }
        ]
      }
    }),
  };

  const products = await prisma.product.findMany({ where });
  console.log('Count:', products.length);
  if (products.length > 0) console.log('First product:', products[0].title);
}

main().catch(console.error).finally(() => prisma.$disconnect());
