import Stripe from 'stripe';
import { PaymentAdapter } from './paymentAdapter.js';
import { ENV } from '../../config/env.js';

export class StripeAdapter extends PaymentAdapter {
  constructor(secretKey = ENV.STRIPE_SECRET_KEY, webhookSecret = ENV.STRIPE_WEBHOOK_SECRET) {
    super();
    this.secretKey = secretKey;
    this.webhookSecret = webhookSecret;
    this.stripe = new Stripe(secretKey, {
      apiVersion: '2024-12-18.acacia',
    });
  }

  isConfigured() {
    return Boolean(
      this.secretKey && !this.secretKey.includes('placeholder') && this.secretKey.startsWith('sk_')
    );
  }

  async createCheckoutSession({ order, clientUrl }) {
    if (!this.isConfigured()) {
      // In development or test mode without a real Stripe key, generate a simulated checkout session
      const mockSessionId = `cs_test_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      return {
        sessionId: mockSessionId,
        sessionUrl: `${clientUrl}/checkout/success?session_id=${mockSessionId}&order_id=${order._id}&simulated=true`,
      };
    }

    const lineItems = order.items.map((item) => ({
      price_data: {
        currency: 'usd',
        product_data: {
          name: item.title,
          images: item.image ? [item.image] : [],
        },
        unit_amount: Math.round(item.price * 100),
      },
      quantity: item.quantity,
    }));

    // Add shipping or discount adjustments if applicable
    if (order.shippingFee > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Shipping Fee',
          },
          unit_amount: Math.round(order.shippingFee * 100),
        },
        quantity: 1,
      });
    }

    if (order.tax > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: {
            name: 'Estimated Sales Tax',
          },
          unit_amount: Math.round(order.tax * 100),
        },
        quantity: 1,
      });
    }

    const sessionParams = {
      payment_method_types: ['card'],
      line_items: lineItems,
      mode: 'payment',
      success_url: `${clientUrl}/checkout/success?session_id={CHECKOUT_SESSION_ID}&order_id=${order._id}`,
      cancel_url: `${clientUrl}/checkout/cancel?order_id=${order._id}`,
      metadata: {
        orderId: order._id.toString(),
        userId: order.userId.toString(),
      },
      customer_email: order.shippingAddress?.email || undefined,
    };

    // If discount was applied, create a coupon discount
    if (order.discount > 0) {
      const stripeCoupon = await this.stripe.coupons.create({
        amount_off: Math.round(order.discount * 100),
        currency: 'usd',
        duration: 'once',
        name: order.couponCode ? `Coupon ${order.couponCode}` : 'Order Discount',
      });
      sessionParams.discounts = [{ coupon: stripeCoupon.id }];
    }

    const session = await this.stripe.checkout.sessions.create(sessionParams);

    return {
      sessionId: session.id,
      sessionUrl: session.url,
    };
  }

  verifyWebhookEvent({ rawBody, signature }) {
    if (!this.isConfigured() || !this.webhookSecret || this.webhookSecret.includes('placeholder')) {
      // In local dev/testing without webhook secret, parse raw payload
      try {
        const bodyStr = typeof rawBody === 'string' ? rawBody : rawBody.toString('utf8');
        return JSON.parse(bodyStr);
      } catch (err) {
        throw new Error('Invalid mock webhook payload: ' + err.message);
      }
    }

    return this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
  }

  async refundPayment({ paymentIntentId, amount }) {
    if (!this.isConfigured() || !paymentIntentId || paymentIntentId.startsWith('mock_')) {
      return {
        id: `re_mock_${Date.now()}`,
        status: 'succeeded',
        amount,
      };
    }

    const params = { payment_intent: paymentIntentId };
    if (amount) {
      params.amount = Math.round(amount * 100);
    }

    return await this.stripe.refunds.create(params);
  }
}
