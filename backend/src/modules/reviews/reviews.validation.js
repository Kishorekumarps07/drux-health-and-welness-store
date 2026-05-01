const { z } = require('zod');

const reviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  title: z.string().optional(),
  comment: z.string().optional(),
});

module.exports = { reviewSchema };
