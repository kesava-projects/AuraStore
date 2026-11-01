import { Router } from 'express';
import { validateCoupon } from '../controllers/checkoutController.js';
import { validate } from '../middlewares/validate.js';
import { validateCouponSchema } from '../validations/checkoutValidation.js';

const router = Router();

router.post('/validate', validate(validateCouponSchema), validateCoupon);

export default router;
