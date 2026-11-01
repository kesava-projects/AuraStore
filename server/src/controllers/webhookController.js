import { paymentService } from '../services/payment/index.js';
import { OrderService } from '../services/orderService.js';
import { Order } from '../models/Order.js';

export async function handleStripeWebhook(req, res, next) {
  const signature = req.headers['stripe-signature'];
  const rawBody = req.rawBody || req.body;

  let event;
  try {
    event = paymentService.verifyWebhookEvent({
      rawBody,
      signature,
    });
  } catch (err) {
    console.error('Webhook verification error:', err.message);
    return res.status(400).json({
      error: {
        code: 'WEBHOOK_SIGNATURE_VERIFICATION_FAILED',
        message: err.message,
      },
    });
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data?.object;
        let orderId = session?.metadata?.orderId;

        // If not in metadata, lookup order by stripeSessionId
        if (!orderId && session?.id) {
          const order = await Order.findOne({ stripeSessionId: session.id });
          if (order) orderId = order._id.toString();
        }

        if (orderId) {
          await OrderService.handlePaymentSuccess(orderId, {
            paymentIntentId: session.payment_intent,
            sessionId: session.id,
          });
        }
        break;
      }

      case 'payment_intent.payment_failed': {
        const intent = event.data?.object;
        const order = await Order.findOne({
          $or: [
            { stripePaymentIntentId: intent.id },
            { 'items.productId': { $exists: true }, stripeSessionId: intent.metadata?.sessionId },
          ],
        });

        if (order) {
          await OrderService.handlePaymentFailure(
            order._id,
            intent.last_payment_error?.message || 'Payment intent failed'
          );
        }
        break;
      }

      case 'checkout.session.expired': {
        const session = event.data?.object;
        let orderId = session?.metadata?.orderId;
        if (!orderId && session?.id) {
          const order = await Order.findOne({ stripeSessionId: session.id });
          if (order) orderId = order._id.toString();
        }

        if (orderId) {
          await OrderService.handlePaymentFailure(orderId, 'Checkout session expired');
        }
        break;
      }

      default:
        // Other events ignored
        break;
    }

    res.json({ received: true });
  } catch (err) {
    console.error('Error processing webhook event:', err);
    res.status(500).json({
      error: {
        code: 'WEBHOOK_PROCESSING_ERROR',
        message: err.message,
      },
    });
  }
}
