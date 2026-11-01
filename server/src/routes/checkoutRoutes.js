import { Router } from 'express';
import { createCheckoutSession, validateCoupon } from '../controllers/checkoutController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import {
  createCheckoutSessionSchema,
  validateCouponSchema,
} from '../validations/checkoutValidation.js';

const router = Router();

router.post('/session', requireAuth, validate(createCheckoutSessionSchema), createCheckoutSession);
router.post('/validate-coupon', validate(validateCouponSchema), validateCoupon);

export default router;
