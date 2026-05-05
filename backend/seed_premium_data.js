const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function seed() {
  console.log('🚀 Seeding Premium Live Data...');

  const passwordHash = await bcrypt.hash('password123', 12);

  // 1. Categories
  const categories = [
    { name: 'Sports Nutrition', slug: 'sports-nutrition', description: 'Whey, Creatine, Pre-workouts' },
    { name: 'Vitamins & Wellness', slug: 'vitamins-wellness', description: 'Daily multivitamins and immunity' },
    { name: 'Fitness Equipment', slug: 'fitness-equipment', description: 'Dumbbells, Mats, Treadmills' },
    { name: 'Healthy Snacks', slug: 'healthy-snacks', description: 'Protein bars and organic nuts' }
  ];

  const dbCategories = {};
  for (const cat of categories) {
    dbCategories[cat.slug] = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: {},
      create: cat
    });
  }

  // 2. Vendors (Realistic Brands)
  const vendorUsers = [
    { name: 'Optimum Nutrition India', email: 'on@druxx.com', store: 'Optimum Nutrition', slug: 'optimum-nutrition' },
    { name: 'MuscleBlaze Official', email: 'mb@druxx.com', store: 'MuscleBlaze', slug: 'muscleblaze' },
    { name: 'YogaBar Store', email: 'yogabar@druxx.com', store: 'YogaBar', slug: 'yogabar' }
  ];

  const dbVendors = {};
  for (const v of vendorUsers) {
    const user = await prisma.user.upsert({
      where: { email: v.email },
      update: { roles: ['VENDOR', 'CUSTOMER'] },
      create: { name: v.name, email: v.email, passwordHash, roles: ['VENDOR', 'CUSTOMER'] }
    });

    dbVendors[v.slug] = await prisma.vendor.upsert({
      where: { userId: user.id },
      update: { 
        approvalStatus: 'ACTIVE',
        storeName: v.store,
        storeSlug: v.slug,
        rating: 4.8,
        storeDescription: `Official store for ${v.store} premium supplements.`,
        storeLogo: `https://api.dicebear.com/7.x/initials/svg?seed=${v.store}`,
        storeBanner: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2000"
      },
      create: {
        userId: user.id,
        storeName: v.store,
        storeSlug: v.slug,
        approvalStatus: 'ACTIVE',
        rating: 4.8,
        storeDescription: `Official store for ${v.store} premium supplements.`,
        storeLogo: `https://api.dicebear.com/7.x/initials/svg?seed=${v.store}`,
        storeBanner: "https://images.unsplash.com/photo-1593079831268-3381b0db4a77?q=80&w=2000"
      }
    });
  }

  // 4. Admin User (infopromptix@gmail.com)
  const adminPasswordHash = await bcrypt.hash('JafferMD@121225', 12);
  await prisma.user.upsert({
    where: { email: 'infopromptix@gmail.com' },
    update: { 
      passwordHash: adminPasswordHash,
      roles: ['ADMIN', 'CUSTOMER']
    },
    create: { 
      name: 'Super Admin', 
      email: 'infopromptix@gmail.com', 
      passwordHash: adminPasswordHash, 
      roles: ['ADMIN', 'CUSTOMER'],
      isVerified: true
    }
  });

  // 5. Products (Realistic Items)
  const products = [
    {
      vendorSlug: 'optimum-nutrition',
      catSlug: 'sports-nutrition',
      title: 'Gold Standard 100% Whey Protein',
      slug: 'gs-whey-protein-2kg',
      price: 6499,
      comparePrice: 7299,
      sku: 'ON-WHEY-GS-01',
      description: 'The world\'s best-selling whey protein powder. 24g of protein per serving.',
      images: ["https://images.unsplash.com/photo-1579722820308-d74e571900a9?q=80&w=800"]
    },
    {
      vendorSlug: 'muscleblaze',
      catSlug: 'sports-nutrition',
      title: 'MuscleBlaze Biozyme Performance Whey',
      slug: 'mb-biozyme-whey',
      price: 4999,
      comparePrice: 5499,
      sku: 'MB-WHEY-BZ-01',
      description: 'Clinically tested for Indian bodies. Enhanced absorption.',
      images: ["https://images.unsplash.com/photo-1546483875-ad9014c88eba?q=80&w=800"]
    },
    {
      vendorSlug: 'yogabar',
      catSlug: 'healthy-snacks',
      title: 'YogaBar Multigrain Energy Bars',
      slug: 'yogabar-energy-bars-pack',
      price: 450,
      comparePrice: 499,
      sku: 'YB-BAR-01',
      description: 'No preservatives, no artificial colors. Pure energy.',
      images: ["https://images.unsplash.com/photo-1590779033100-9f60705a013d?q=80&w=800"]
    },
    {
      vendorSlug: 'optimum-nutrition',
      catSlug: 'vitamins-wellness',
      title: 'Opti-Men Multivitamin',
      slug: 'opti-men-90-tabs',
      price: 1899,
      comparePrice: 2199,
      sku: 'ON-VIT-OM-01',
      description: '75+ ingredients for men\'s daily vitality.',
      images: ["https://images.unsplash.com/photo-1471864190281-ad5fe9bb0724?q=80&w=800"]
    }
  ];

  for (const p of products) {
    const product = await prisma.product.upsert({
      where: { sku: p.sku },
      update: {
        price: p.price,
        comparePrice: p.comparePrice,
        stockQty: 50,
        isFeatured: true,
        status: 'ACTIVE'
      },
      create: {
        vendorId: dbVendors[p.vendorSlug].id,
        categoryId: dbCategories[p.catSlug].id,
        title: p.title,
        slug: p.slug,
        description: p.description,
        price: p.price,
        comparePrice: p.comparePrice,
        sku: p.sku,
        stockQty: 50,
        isFeatured: true,
        isNew: true,
        status: 'ACTIVE'
      }
    });

    // Images - Delete old ones and re-insert to avoid ID issues
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    for (const imgUrl of p.images) {
      await prisma.productImage.create({
        data: {
          productId: product.id,
          url: imgUrl,
          isPrimary: true
        }
      });
    }
  }

  console.log('✅ Premium Live Data Seeded!');
}

seed()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
