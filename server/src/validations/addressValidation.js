import { z } from 'zod';

export const addressSchema = z.object({
  fullName: z.string().trim().min(2, 'Full name is required'),
  street: z.string().trim().min(3, 'Street address is required'),
  city: z.string().trim().min(2, 'City is required'),
  state: z.string().trim().min(2, 'State is required'),
  postalCode: z.string().trim().min(2, 'Postal code is required'),
  country: z.string().trim().default('USA'),
  phone: z.string().trim().min(7, 'Valid phone number is required'),
  isDefault: z.boolean().optional().default(false),
});
