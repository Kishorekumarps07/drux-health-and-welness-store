const { z } = require('zod');

const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

const updateProfileSchema = z.object({
  name: z.string().min(2).optional(),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format. Please provide a valid 10-digit Indian phone number.').optional(),
  avatarUrl: z.string().url().optional(),
});

const addressSchema = z.object({
  label: z.string().optional().default('Home'),
  fullName: z.string().min(2),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format. Please provide a valid 10-digit Indian phone number.'),
  street: z.string().min(3),
  city: z.string().min(2),
  state: z.string().min(2),
  pincode: z.string().length(6),
  country: z.string().optional().default('India'),
  isDefault: z.boolean().optional().default(false),
});

module.exports = { updateProfileSchema, addressSchema };
