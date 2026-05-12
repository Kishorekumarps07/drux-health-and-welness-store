const prisma = require('../lib/prisma');

const TAMIL_NAMES = [
  "Rajesh Kumar", "Anitha Devi", "Senthil Nathan", "Meena Lakshmi", 
  "Karthik Raja", "Priya Mani", "Vignesh Shivan", "Deepa Sundar",
  "Muthu Swamy", "Selvi Rani", "Balaji S", "Vijayalakshmi",
  "Arun Pandiyan", "Kavitha R", "Suresh G", "Ramya Krishnan",
  "Siva Prasad", "Nithya J", "Saravanan P", "Gayathri Devi"
];

const TAMIL_STYLE_REVIEWS = [
  { rating: 5, comment: "Super product! Worth every rupee. Packing was very neat and reached Chennai in 2 days. Highly recommended." },
  { rating: 5, comment: "Quality is top notch. I usually don't write reviews, but for this, I must say it's genuine. Romba nalla irukku!" },
  { rating: 4, comment: "Product is good, standard quality. Delivery took 3 days to Coimbatore, but worth the wait." },
  { rating: 5, comment: "Excellent results. Using it for 2 weeks now. Authentic brand partner. Happy with Druxx Health." },
  { rating: 5, comment: "Vera level quality! Best in the market. My family also started using it now." },
  { rating: 4, comment: "Good health product. Taste is natural and healthy. Will buy again next month." },
  { rating: 5, comment: "Direct from vendor, so no doubt about original product. Trustworthy store." },
  { rating: 4, comment: "Perfect for daily use. Value for money. Best wellness store in India." },
  { rating: 5, comment: "Simply superb. Standard and quality is 100%. Druxx Health is doing a great job." },
  { rating: 5, comment: "Excellent delivery speed. Product is as described. Nalla service!" }
];

async function addRandomReviews(productId, count = null) {
  if (!count) {
    count = Math.floor(Math.random() * (10 - 5 + 1)) + 5; // 5 to 10
  }

  const reviewsToAdd = [];
  
  // To avoid duplicate user names for the same product, we shuffle
  const names = [...TAMIL_NAMES].sort(() => 0.5 - Math.random());
  
  for (let i = 0; i < count; i++) {
    const name = names[i % names.length];
    const reviewData = TAMIL_STYLE_REVIEWS[Math.floor(Math.random() * TAMIL_STYLE_REVIEWS.length)];
    
    // We need a userId. Since these are fake reviews, we can use a "System User" 
    // or just find/create a few dummy users. For now, let's look for dummy users.
    let user = await prisma.user.findUnique({ where: { email: `dummy_${name.replace(/\s+/g, '_').toLowerCase()}@druxx.com` } });
    
    if (!user) {
      user = await prisma.user.create({
        data: {
          name: name,
          email: `dummy_${name.replace(/\s+/g, '_').toLowerCase()}@druxx.com`,
          passwordHash: "$2a$10$f/vL9Y3G9w7vX9zYvQv7vOe7Y7v7v7v7v7v7v7v7v7v7v7v7v7v7v", // Fake hash
          isVerified: true
        }
      });
    }

    // Check if this user already reviewed this product (Prisma has unique constraint)
    const existing = await prisma.review.findUnique({
      where: { userId_productId: { userId: user.id, productId } }
    });

    if (!existing) {
      reviewsToAdd.push({
        userId: user.id,
        productId,
        rating: reviewData.rating,
        comment: reviewData.comment,
        isVerified: true
      });
    }
  }

  if (reviewsToAdd.length > 0) {
    await prisma.review.createMany({ data: reviewsToAdd });
    
    // Update product average rating
    const allReviews = await prisma.review.findMany({ where: { productId }, select: { rating: true } });
    const totalRating = allReviews.reduce((acc, curr) => acc + curr.rating, 0);
    const averageRating = totalRating / (allReviews.length || 1);

    await prisma.product.update({
      where: { id: productId },
      data: {
        averageRating,
        reviewCount: allReviews.length
      }
    });
  }
}

module.exports = { addRandomReviews };
