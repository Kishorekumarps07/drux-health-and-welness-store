const { z } = require('zod');

const applySchema = z.object({
  storeName: z.string().min(2, 'Store name must be at least 2 characters'),
  storeDescription: z.string().optional(),
  gstNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfscCode: z.string().optional(),
});

const updateStoreSchema = z.object({
  storeName: z.string().min(2).optional(),
  storeDescription: z.string().optional(),
  storeLogo: z.string().url().optional(),
  storeBanner: z.string().url().optional(),
  gstNumber: z.string().optional(),
  bankAccountNumber: z.string().optional(),
  bankIfscCode: z.string().optional(),
});

const statusSchema = z.object({
  status: z.enum(['APPROVED', 'ACTIVE', 'SUSPENDED', 'REJECTED']),
});

module.exports = { applySchema, updateStoreSchema, statusSchema };
