const { z } = require('zod');

const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  icon: z.string().optional(),
  imageUrl: z.string().url().optional(),
  parentId: z.string().uuid().optional(),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

module.exports = { categorySchema };
