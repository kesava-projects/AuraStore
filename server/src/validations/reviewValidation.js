import { z } from 'zod';

export const reviewSchema = z.object({
  rating: z.coerce
    .number()
    .int()
    .min(1, 'Rating must be between 1 and 5')
    .max(5, 'Rating must be between 1 and 5'),
  comment: z.string().trim().min(3, 'Review comment must be at least 3 characters'),
});
