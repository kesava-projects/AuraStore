import { Router } from 'express';
import { getProducts, getProductBySlug, getCategories } from '../controllers/catalogController.js';
import { addProductReview } from '../controllers/accountController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { queryProductsSchema } from '../validations/catalogValidation.js';
import { reviewSchema } from '../validations/reviewValidation.js';

const router = Router();

router.get('/products', validate(queryProductsSchema, 'query'), getProducts);
router.get('/products/:slug', getProductBySlug);
router.post('/products/:id/reviews', requireAuth, validate(reviewSchema), addProductReview);
router.get('/categories', getCategories);

export default router;
