import { z } from 'zod';
import { addressSchema } from './addressValidation.js';

export const createCheckoutSessionSchema = z.object({
  shippingAddress: addressSchema,
  couponCode: z.string().trim().optional().nullable(),
});

export const validateCouponSchema = z.object({
  code: z.string().trim().min(1, 'Coupon code is required'),
  subtotal: z.coerce.number().min(0, 'Subtotal must be positive'),
});
