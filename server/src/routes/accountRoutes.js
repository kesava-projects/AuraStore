import { Router } from 'express';
import {
  getAddresses,
  addAddress,
  updateAddress,
  deleteAddress,
  toggleWishlist,
} from '../controllers/accountController.js';
import { requireAuth } from '../middlewares/auth.js';
import { validate } from '../middlewares/validate.js';
import { addressSchema } from '../validations/addressValidation.js';

const router = Router();

router.use(requireAuth);

router.get('/addresses', getAddresses);
router.post('/addresses', validate(addressSchema), addAddress);
router.put('/addresses/:id', validate(addressSchema), updateAddress);
router.delete('/addresses/:id', deleteAddress);
router.post('/wishlist/:productId', toggleWishlist);

export default router;
