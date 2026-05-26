const slugify = require('slugify');
const prisma = require('../../lib/prisma');
const AppError = require('../../lib/AppError');

class CategoriesService {
  async list() {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: [{ sortOrder: 'asc' }, { name: 'asc' }],
      include: { 
        _count: {
          select: {
            products: {
              where: {
                status: 'ACTIVE',
                vendor: { 
                  approvalStatus: { in: ['APPROVED', 'ACTIVE'] } 
                }
              }
            }
          }
        },
        children: { where: { isActive: true }, orderBy: { sortOrder: 'asc' } } 
      },
    });
  }

  async getById(id) {
    const cat = await prisma.category.findUnique({
      where: { id },
      include: { children: true, parent: true },
    });
    if (!cat) throw new AppError('Category not found.', 404);
    return cat;
  }

  async create(data) {
    if (data.name) data.name = data.name.trim();
    const slug = slugify(data.name, { lower: true, strict: true });
    
    // Deduplicate case-insensitively per AGENTS.md conventions
    const exists = await prisma.category.findFirst({
      where: {
        OR: [
          { slug },
          { name: { equals: data.name, mode: 'insensitive' } }
        ]
      }
    });
    if (exists) throw new AppError(`Category "${data.name}" already exists.`, 409);
    return prisma.category.create({ data: { ...data, slug } });
  }

  async update(id, data) {
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) throw new AppError('Category not found.', 404);
    
    if (data.name) {
      data.name = data.name.trim();
      const slug = slugify(data.name, { lower: true, strict: true });
      const exists = await prisma.category.findFirst({
        where: {
          id: { not: id },
          OR: [
            { slug },
            { name: { equals: data.name, mode: 'insensitive' } }
          ]
        }
      });
      if (exists) throw new AppError(`Category "${data.name}" already exists.`, 409);
      data.slug = slug;
    }
    
    return prisma.category.update({ where: { id }, data });
  }

  async delete(id) {
    const cat = await prisma.category.findUnique({ where: { id } });
    if (!cat) throw new AppError('Category not found.', 404);
    const productCount = await prisma.product.count({ where: { categoryId: id } });
    if (productCount > 0) throw new AppError(`Cannot delete: category has ${productCount} products.`, 409);
    await prisma.category.delete({ where: { id } });
  }
}

module.exports = new CategoriesService();
