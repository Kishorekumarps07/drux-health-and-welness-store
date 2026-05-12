const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { addRandomReviews } = require('../src/utils/reviewHelper');

async function main() {
  console.log("🚀 Starting review population for existing products...");
  
  const products = await prisma.product.findMany({
    select: { id: true, title: true, reviewCount: true }
  });

  console.log(`Found ${products.length} products.`);

  for (const product of products) {
    if (product.reviewCount < 5) {
      console.log(`Adding reviews for: ${product.title}...`);
      try {
        await addRandomReviews(product.id);
        console.log(`✅ Success for ${product.title}`);
      } catch (err) {
        console.error(`❌ Failed for ${product.title}:`, err.message);
      }
    } else {
      console.log(`⏩ Skipping ${product.title} (Already has ${product.reviewCount} reviews)`);
    }
  }

  console.log("🏁 Review population complete!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
