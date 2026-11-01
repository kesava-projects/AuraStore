import { Cart } from '../models/Cart.js';
import { OrderService } from '../services/orderService.js';
import { CartService } from '../services/cartService.js';
import { CouponService } from '../services/couponService.js';
import { paymentService } from '../services/payment/index.js';
import { ENV } from '../config/env.js';

export async function createCheckoutSession(req, res, next) {
  try {
    const userId = req.user._id;
    const { shippingAddress, couponCode } = req.body;

    // Get user cart
    const cart = await Cart.findOne({ userId });
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({
        error: {
          code: 'CART_EMPTY',
          message: 'Your cart is empty. Please add items before checking out.',
        },
      });
    }

    // Create order with verified pricing and atomic stock reservation
    const order = await OrderService.createOrder({
      userId,
      items: cart.items,
      shippingAddress,
      couponCode,
    });

    // Create checkout session with payment adapter
    let session;
    try {
      session = await paymentService.createCheckoutSession({
        order,
        clientUrl: ENV.CLIENT_URL,
      });

      order.stripeSessionId = session.sessionId;
      await order.save();

      // Clear the user's cart now that order has been initialized and stock reserved
      await CartService.clearCart(userId);
    } catch (paymentErr) {
      // If session creation fails, rollback order and release stock
      await OrderService.cancelOrder(order._id, null, true);
      throw paymentErr;
    }

    res.status(201).json({
      sessionId: session.sessionId,
      url: session.sessionUrl,
      orderId: order._id,
    });
  } catch (err) {
    next(err);
  }
}

export async function validateCoupon(req, res, next) {
  try {
    const { code, subtotal } = req.body;
    const result = await CouponService.validateCoupon(code, subtotal);

    res.json({
      valid: true,
      coupon: {
        code: result.coupon.code,
        type: result.coupon.type,
        value: result.coupon.value,
        minOrder: result.coupon.minOrder,
      },
      discount: result.discount,
    });
  } catch (err) {
    next(err);
  }
}
