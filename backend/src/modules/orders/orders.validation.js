const { z } = require('zod');

const placeOrderSchema = z.object({
  addressId: z.string().uuid(),
  paymentMethod: z.enum(['RAZORPAY', 'COD', 'UPI', 'CARD', 'NETBANKING']).optional().default('COD'),
  notes: z.string().optional(),
  couponCode: z.string().optional(),
});

module.exports = { placeOrderSchema };
