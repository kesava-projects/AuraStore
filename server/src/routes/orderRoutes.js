import { Router } from 'express';
import { getUserOrders, getOrderById, cancelOrder } from '../controllers/orderController.js';
import { requireAuth } from '../middlewares/auth.js';

const router = Router();

router.use(requireAuth);

router.get('/', getUserOrders);
router.get('/:id', getOrderById);
router.patch('/:id/cancel', cancelOrder);

export default router;
