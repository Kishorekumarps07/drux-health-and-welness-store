const slugify = require('slugify');
const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');
const { deleteImageByUrl } = require('../../utils/cloudinary');

const PRODUCT_INCLUDE = {
  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
  vendor: { select: { id: true, storeName: true, storeSlug: true, rating: true } },
  category: { select: { id: true, name: true, slug: true } },
};

const { getPagination, getPagingData } = require('../../lib/pagination.util');

class ProductsService {
  async list(query) {
    const { skip, take, page, limit } = getPagination(query);
    let { search, categoryId, category, vendorId, minPrice, maxPrice, rating, status, sort = 'createdAt', order = 'desc', tags } = query;
    if (category) category = category.trim();

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
      ...(vendorId && { vendorId }),
      ...( (minPrice && parseFloat(minPrice) > 0) || (maxPrice && parseFloat(maxPrice) < 5000) ) && {
        price: { 
          gte: minPrice ? parseFloat(minPrice) : undefined, 
          lte: maxPrice ? parseFloat(maxPrice) : undefined 
        },
      },
      ...(rating && { averageRating: { gte: parseFloat(rating) } }),
      ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
    };


    let orderBy = { createdAt: 'desc' }; // Default
    if (sort === 'featured') orderBy = { isFeatured: 'desc' };
    else if (sort === 'price-low') orderBy = { price: 'asc' };
    else if (sort === 'price-high') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { averageRating: 'desc' };
    else if (sort === 'newest' || sort === 'new-arrival') orderBy = { createdAt: 'desc' };
    else if (sort === 'best-seller') orderBy = { isBestSeller: 'desc' };
    else orderBy = { [sort]: order };

    const [products, total] = await Promise.all([
      prisma.product.findMany({ where, skip, take, include: PRODUCT_INCLUDE, orderBy }),
      prisma.product.count({ where }),
    ]);

    return { products, ...getPagingData(total, page, limit) };
  }

  async getById(id) {
    const product = await prisma.product.findFirst({
      where: {
        id,
        status: 'ACTIVE',
        vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } }
      },
      include: {
        ...PRODUCT_INCLUDE,
        reviews: { include: { user: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!product) throw new AppError('Product not found.', 404);
    return product;
  }

  async getBySlug(slug) {
    const product = await prisma.product.findFirst({
      where: {
        slug,
        status: 'ACTIVE',
        vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } }
      },
      include: { ...PRODUCT_INCLUDE, reviews: { include: { user: { select: { id: true, name: true, avatarUrl: true } } }, take: 10 } },
    });
    if (!product) throw new AppError('Product not found.', 404);
    return product;
  }

  async create(userId, data) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('You must be an approved vendor to add products.', 403);
    if (!['APPROVED', 'ACTIVE'].includes(vendor.approvalStatus)) {
      throw new AppError('Your vendor account is not yet approved.', 403);
    }

    if (data.sku) {
      const skuExists = await prisma.product.findUnique({ where: { sku: data.sku } });
      if (skuExists) throw new AppError('A product with this SKU already exists.', 409);
    } else {
      data.sku = `DRX-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
    }

    const baseSlug = slugify(data.title, { lower: true, strict: true });
    let slug = baseSlug;
    let attempt = 0;
    while (await prisma.product.findUnique({ where: { slug } })) {
      attempt++;
      if (attempt > 50) {
        throw new AppError('Could not generate a unique slug for this product after 50 attempts.', 500);
      }
      slug = `${baseSlug}-${attempt}`;
    }

    const { images, ...productData } = data;

    const product = await prisma.product.create({
      data: { 
        ...productData, 
        vendorId: vendor.id, 
        slug
      }
    });

    if (images && images.length > 0) {
      await prisma.productImage.createMany({
        data: images.map(img => ({
          url: img.url,
          isPrimary: img.isPrimary || false,
          sortOrder: img.sortOrder || 0,
          productId: product.id
        }))
      });
    }

    return prisma.product.findUnique({
      where: { id: product.id },
      include: PRODUCT_INCLUDE
    });
  }

  async update(userId, productId, data) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor not found.', 404);

    const product = await prisma.product.findFirst({ where: { id: productId, vendorId: vendor.id } });
    if (!product) throw new AppError('Product not found or you do not own it.', 404);

    const { images, ...productData } = data;

    // If new images are provided, we'll replace existing ones
    if (images && images.length > 0) {
      const existingImages = await prisma.productImage.findMany({ where: { productId } });
      await prisma.productImage.deleteMany({ where: { productId } });
      
      await prisma.productImage.createMany({
        data: images.map(img => ({
          url: img.url,
          isPrimary: img.isPrimary || false,
          sortOrder: img.sortOrder || 0,
          productId
        }))
      });

      // Delete old images from Cloudinary in parallel after DB updates succeed
      Promise.all(existingImages.map(img => deleteImageByUrl(img.url).catch(() => {}))).catch(err => {
        console.error('Failed to delete some old images from Cloudinary:', err);
      });
    }

    return prisma.product.update({ 
      where: { id: productId }, 
      data: productData, 
      include: PRODUCT_INCLUDE 
    });
  }

  async delete(userId, productId) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor not found.', 404);

    const product = await prisma.product.findFirst({ where: { id: productId, vendorId: vendor.id } });
    if (!product) throw new AppError('Product not found or you do not own it.', 404);

    const productImages = await prisma.productImage.findMany({ where: { productId } });

    // Safely delete all associated records in a transaction to ensure data integrity
    await prisma.$transaction([
      prisma.orderItem.deleteMany({ where: { productId } }),
      prisma.productImage.deleteMany({ where: { productId } }),
      prisma.review.deleteMany({ where: { productId } }),
      prisma.cartItem.deleteMany({ where: { productId } }),
      prisma.product.delete({ where: { id: productId } })
    ]);

    // Delete images from Cloudinary in parallel after the DB transaction succeeds
    Promise.all(productImages.map(img => deleteImageByUrl(img.url).catch(() => {}))).catch(err => {
      console.error('Failed to delete product images from Cloudinary:', err);
    });
  }

  async getVendorProducts(userId, query) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor profile not found.', 404);

    const { skip, take, page, limit } = getPagination(query);
    
    const [products, total] = await Promise.all([
      prisma.product.findMany({ where: { vendorId: vendor.id }, skip, take, include: PRODUCT_INCLUDE, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where: { vendorId: vendor.id } }),
    ]);

    return { products, ...getPagingData(total, page, limit) };
  }

  /**
   * Get best-selling products ranked by real sales volume (quantity sold on DELIVERED orders).
   * Falls back to isBestSeller flag if no order data is available.
   */
  async getBestSellers(limit = 20) {
    // Aggregate total quantity sold per product from DELIVERED order items
    const salesData = await prisma.orderItem.groupBy({
      by: ['productId'],
      where: {
        order: { status: 'DELIVERED' }
      },
      _sum: { quantity: true },
      orderBy: { _sum: { quantity: 'desc' } },
      take: limit * 2, // Fetch extra to account for inactive products
    });

    if (salesData.length === 0) {
      // Fallback: no sales data yet — return by isBestSeller flag or latest products
      const products = await prisma.product.findMany({
        where: { status: 'ACTIVE', vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } } },
        include: PRODUCT_INCLUDE,
        orderBy: [{ isBestSeller: 'desc' }, { averageRating: 'desc' }],
        take: limit,
      });
      return { products, total: products.length, pages: 1 };
    }

    const productIds = salesData.map(s => s.productId);

    // Fetch the actual products in one query
    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        status: 'ACTIVE',
        vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } },
      },
      include: PRODUCT_INCLUDE,
    });

    // Map sales quantities for enrichment
    const salesMap = Object.fromEntries(salesData.map(s => [s.productId, s._sum.quantity || 0]));

    // Sort products by actual sales volume (matching the groupBy order)
    const sorted = products
      .map(p => ({ ...p, _salesQty: salesMap[p.id] || 0 }))
      .sort((a, b) => b._salesQty - a._salesQty)
      .slice(0, limit);

    // Background: update isBestSeller flag for top sellers (fire-and-forget)
    const topIds = new Set(sorted.slice(0, 10).map(p => p.id));
    prisma.$transaction([
      prisma.product.updateMany({ where: { id: { in: [...topIds] } }, data: { isBestSeller: true } }),
      prisma.product.updateMany({ where: { id: { notIn: [...topIds] }, isBestSeller: true }, data: { isBestSeller: false } }),
    ]).catch(() => {});

    return { products: sorted, total: sorted.length, pages: 1 };
  }

  async getPersonalizedProducts(userId, guestCategories, limit = 16) {
    let personalizedProducts = [];
    const purchasedProductIds = new Set();

    if (userId) {
      // 1. Fetch user's orders to identify purchased categories
      const orders = await prisma.order.findMany({
        where: { userId },
        include: { items: { include: { product: true } } }
      });
      const orderedCategoryIds = [];
      orders.forEach(o => {
        o.items.forEach(i => {
          if (i.product) {
            purchasedProductIds.add(i.product.id);
            if (i.product.categoryId) {
              orderedCategoryIds.push(i.product.categoryId);
            }
          }
        });
      });

      // 2. Fetch user's wishlist categories
      const wishlist = await prisma.wishlistItem.findMany({
        where: { userId },
        include: { product: true }
      });
      const wishlistedCategoryIds = [];
      wishlist.forEach(w => {
        if (w.product && w.product.categoryId) {
          wishlistedCategoryIds.push(w.product.categoryId);
        }
      });

      // 3. Fetch user's active cart categories
      const cart = await prisma.cart.findFirst({
        where: { userId },
        include: { items: { include: { product: true } } }
      });
      const cartCategoryIds = [];
      if (cart) {
        cart.items.forEach(cItem => {
          if (cItem.product && cItem.product.categoryId) {
            cartCategoryIds.push(cItem.product.categoryId);
          }
        });
      }

      // 4. Calculate category preference weights (Ordered: 3, Cart: 2, Wishlist: 1)
      const weights = {};
      orderedCategoryIds.forEach(cid => { weights[cid] = (weights[cid] || 0) + 3; });
      cartCategoryIds.forEach(cid => { weights[cid] = (weights[cid] || 0) + 2; });
      wishlistedCategoryIds.forEach(cid => { weights[cid] = (weights[cid] || 0) + 1; });

      const sortedCategoryIds = Object.keys(weights).sort((a, b) => weights[b] - weights[a]);

      if (sortedCategoryIds.length > 0) {
        personalizedProducts = await prisma.product.findMany({
          where: {
            categoryId: { in: sortedCategoryIds },
            status: 'ACTIVE',
            vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } },
            id: { notIn: Array.from(purchasedProductIds) } // Exclude already purchased products for variety
          },
          include: PRODUCT_INCLUDE,
          take: limit
        });

        // Sort by computed category weight descending
        personalizedProducts.sort((a, b) => {
          const wA = weights[a.categoryId] || 0;
          const wB = weights[b.categoryId] || 0;
          return wB - wA;
        });
      }
    } else if (guestCategories && guestCategories.length > 0) {
      // Guest recommendations based on viewed categories passed from frontend
      personalizedProducts = await prisma.product.findMany({
        where: {
          category: {
            slug: { in: guestCategories }
          },
          status: 'ACTIVE',
          vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } }
        },
        include: PRODUCT_INCLUDE,
        take: limit
      });
    }

    // 5. Fallback/padding to ensure catalog is never empty
    const currentCount = personalizedProducts.length;
    if (currentCount < limit) {
      const existingIds = new Set(personalizedProducts.map(p => p.id));
      const padLimit = limit - currentCount;

      const fallbackProducts = await prisma.product.findMany({
        where: {
          id: { notIn: [...Array.from(existingIds), ...Array.from(purchasedProductIds)] },
          status: 'ACTIVE',
          vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } }
        },
        include: PRODUCT_INCLUDE,
        orderBy: [{ isBestSeller: 'desc' }, { averageRating: 'desc' }],
        take: padLimit
      });

      personalizedProducts = [...personalizedProducts, ...fallbackProducts];
    }

    return { products: personalizedProducts.slice(0, limit), total: Math.min(limit, personalizedProducts.length), pages: 1 };
  }
}

module.exports = new ProductsService();
