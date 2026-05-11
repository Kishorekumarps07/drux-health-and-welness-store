const { z } = require('zod');

const productSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  shortDesc: z.string().optional(),
  categoryId: z.string().uuid(),
  price: z.coerce.number().positive(),
  comparePrice: z.coerce.number().positive().optional(),
  stockQty: z.coerce.number().int().min(0).optional().default(0),
  sku: z.string().min(1).optional(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'OUT_OF_STOCK']).optional().default('ACTIVE'),
  isFeatured: z.coerce.boolean().optional().default(false),
  tags: z.array(z.string()).optional().default([]),
});

const updateProductSchema = productSchema.partial();

module.exports = { productSchema, updateProductSchema };
