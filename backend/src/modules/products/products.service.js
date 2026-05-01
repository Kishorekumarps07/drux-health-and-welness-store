const slugify = require('slugify');
const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

const PRODUCT_INCLUDE = {
  images: { orderBy: [{ isPrimary: 'desc' }, { sortOrder: 'asc' }] },
  vendor: { select: { id: true, storeName: true, storeSlug: true, rating: true } },
  category: { select: { id: true, name: true, slug: true } },
};

const { getPagination, getPagingData } = require('../../lib/pagination.util');

class ProductsService {
  async list(query) {
    const { skip, take, page, limit } = getPagination(query);
    const { search, categoryId, vendorId, minPrice, maxPrice, rating, status, sort = 'createdAt', order = 'desc', tags } = query;

    const where = {
      status: status || 'ACTIVE',
      vendor: { approvalStatus: { in: ['APPROVED', 'ACTIVE'] } },
      ...(search && { OR: [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ]}),
      ...(categoryId && { categoryId }),
      ...(vendorId && { vendorId }),
      ...(minPrice !== undefined || maxPrice !== undefined) && {
        price: { gte: minPrice ? parseFloat(minPrice) : undefined, lte: maxPrice ? parseFloat(maxPrice) : undefined },
      },
      ...(rating && { averageRating: { gte: parseFloat(rating) } }),
      ...(tags && tags.length > 0 && { tags: { hasSome: tags } }),
    };

    let orderBy = { createdAt: 'desc' }; // Default
    if (sort === 'featured') orderBy = { isFeatured: 'desc' };
    else if (sort === 'price-low') orderBy = { price: 'asc' };
    else if (sort === 'price-high') orderBy = { price: 'desc' };
    else if (sort === 'rating') orderBy = { averageRating: 'desc' };
    else if (sort === 'newest') orderBy = { createdAt: 'desc' };
    else orderBy = { [sort]: order };

    const [products, total] = await prisma.$transaction([
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

    const skuExists = await prisma.product.findUnique({ where: { sku: data.sku } });
    if (skuExists) throw new AppError('A product with this SKU already exists.', 409);

    const baseSlug = slugify(data.title, { lower: true, strict: true });
    let slug = baseSlug;
    let attempt = 0;
    while (await prisma.product.findUnique({ where: { slug } })) {
      slug = `${baseSlug}-${++attempt}`;
    }

    return prisma.product.create({
      data: { ...data, vendorId: vendor.id, slug },
      include: PRODUCT_INCLUDE,
    });
  }

  async update(userId, productId, data) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor not found.', 404);

    const product = await prisma.product.findFirst({ where: { id: productId, vendorId: vendor.id } });
    if (!product) throw new AppError('Product not found or you do not own it.', 404);

    return prisma.product.update({ where: { id: productId }, data, include: PRODUCT_INCLUDE });
  }

  async delete(userId, productId) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor not found.', 404);

    const product = await prisma.product.findFirst({ where: { id: productId, vendorId: vendor.id } });
    if (!product) throw new AppError('Product not found or you do not own it.', 404);

    await prisma.product.delete({ where: { id: productId } });
  }

  async getVendorProducts(userId, query) {
    const vendor = await prisma.vendor.findUnique({ where: { userId } });
    if (!vendor) throw new AppError('Vendor profile not found.', 404);

    const { skip, take, page, limit } = getPagination(query);
    
    const [products, total] = await prisma.$transaction([
      prisma.product.findMany({ where: { vendorId: vendor.id }, skip, take, include: PRODUCT_INCLUDE, orderBy: { createdAt: 'desc' } }),
      prisma.product.count({ where: { vendorId: vendor.id } }),
    ]);

    return { products, ...getPagingData(total, page, limit) };
  }
}

module.exports = new ProductsService();
