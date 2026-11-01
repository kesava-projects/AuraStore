import { Router } from 'express';
import { handleStripeWebhook } from '../controllers/webhookController.js';

const router = Router();

router.post('/stripe', handleStripeWebhook);

export default router;
