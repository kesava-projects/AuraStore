import { Router } from 'express';
import { getCart, updateCart, mergeCart } from '../controllers/cartController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { updateCartSchema, mergeCartSchema } from '../validations/cartValidation.js';

const router = Router();

router.use(requireAuth);

router.get('/', getCart);
router.put('/', validate(updateCartSchema), updateCart);
router.post('/merge', validate(mergeCartSchema), mergeCart);

export default router;
