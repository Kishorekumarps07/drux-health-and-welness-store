const { z } = require('zod');

const phoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  phone: z.string().regex(phoneRegex, 'Invalid phone number format. Please provide a valid 10-digit Indian phone number.').optional(),
  role: z.union([
    z.enum(['CUSTOMER', 'VENDOR', 'ADMIN']),
    z.array(z.enum(['CUSTOMER', 'VENDOR', 'ADMIN']))
  ]).optional().default('CUSTOMER'),
});

const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, 'Refresh token is required'),
});

module.exports = { registerSchema, loginSchema, refreshSchema };
