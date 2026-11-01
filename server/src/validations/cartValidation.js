import { z } from 'zod';

export const cartItemSchema = z.object({
  productId: z.string().min(1, 'Product ID is required'),
  quantity: z.coerce.number().int().min(1, 'Quantity must be at least 1'),
});

export const updateCartSchema = z.object({
  items: z.array(cartItemSchema),
});

export const mergeCartSchema = z.object({
  items: z.array(cartItemSchema),
});
