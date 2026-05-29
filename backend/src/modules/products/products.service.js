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
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        ...PRODUCT_INCLUDE,
        reviews: { include: { user: { select: { id: true, name: true, avatarUrl: true } } }, orderBy: { createdAt: 'desc' }, take: 10 },
      },
    });
    if (!product) throw new AppError('Product not found.', 404);
    return product;
  }

  async getBySlug(slug) {
    const product = await prisma.product.findUnique({
      where: { slug },
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
}

module.exports = new ProductsService();
