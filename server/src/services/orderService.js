import { Order } from '../models/Order.js';
import { Product } from '../models/Product.js';
import { StockService } from './stockService.js';
import { CouponService } from './couponService.js';
import { calculateOrderTotals } from './pricingService.js';
import { paymentService } from './payment/index.js';

const STATUS_FLOW = {
  placed: ['packed', 'cancelled'],
  packed: ['shipped', 'cancelled'],
  shipped: ['delivered'],
  delivered: [],
  cancelled: [],
};

export class OrderService {
  /**
   * Create an order from items and address with atomic stock reservation and verified pricing
   */
  static async createOrder({ userId, items, shippingAddress, couponCode }) {
    if (!items || items.length === 0) {
      const err = new Error('Order items cannot be empty');
      err.code = 'EMPTY_ORDER';
      err.statusCode = 400;
      throw err;
    }

    // 1. Fetch products from DB to guarantee current prices and stock
    const validatedItems = [];
    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isActive) {
        const err = new Error(`Product "${item.title || item.productId}" is no longer available`);
        err.code = 'PRODUCT_UNAVAILABLE';
        err.statusCode = 400;
        throw err;
      }

      const qty = Number(item.quantity);
      if (qty <= 0) {
        const err = new Error(`Invalid quantity for product "${product.title}"`);
        err.code = 'INVALID_QUANTITY';
        err.statusCode = 400;
        throw err;
      }

      validatedItems.push({
        productId: product._id,
        title: product.title,
        price: product.price,
        quantity: qty,
        image: product.images?.[0] || '',
      });
    }

    // 2. Atomic stock reservation
    await StockService.reserveStock(validatedItems);

    try {
      // 3. Validate coupon if provided
      let couponData = null;
      let appliedCouponCode = null;

      const rawSubtotal = validatedItems.reduce((acc, it) => acc + it.price * it.quantity, 0);

      if (couponCode) {
        const validation = await CouponService.validateCoupon(couponCode, rawSubtotal);
        couponData = validation.coupon;
        appliedCouponCode = couponData.code;
      }

      // 4. Calculate final totals server-side
      const totals = calculateOrderTotals({
        items: validatedItems,
        coupon: couponData,
      });

      // 5. Create Order document in 'placed' status
      const order = await Order.create({
        userId,
        items: validatedItems,
        shippingAddress,
        subtotal: totals.subtotal,
        discount: totals.discount,
        shippingFee: totals.shippingFee,
        tax: totals.tax,
        total: totals.total,
        paymentStatus: 'pending',
        orderStatus: 'placed',
        couponCode: appliedCouponCode,
        statusHistory: [
          {
            status: 'placed',
            timestamp: new Date(),
            note: 'Order created, awaiting payment',
          },
        ],
      });

      return order;
    } catch (err) {
      // If order creation fails after stock reservation, release stock back
      await StockService.releaseStock(validatedItems);
      throw err;
    }
  }

  /**
   * Handle successful payment from Stripe webhook (Idempotent)
   */
  static async handlePaymentSuccess(orderId, { paymentIntentId, sessionId }) {
    const order = await Order.findById(orderId);
    if (!order) {
      const err = new Error(`Order ${orderId} not found`);
      err.code = 'ORDER_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    // Idempotency check: if already paid, do nothing
    if (order.paymentStatus === 'paid') {
      return order;
    }

    order.paymentStatus = 'paid';
    if (paymentIntentId) order.stripePaymentIntentId = paymentIntentId;
    if (sessionId) order.stripeSessionId = sessionId;

    order.statusHistory.push({
      status: order.orderStatus,
      timestamp: new Date(),
      note: `Payment confirmed via webhook (${paymentIntentId || sessionId})`,
    });

    await order.save();

    // Increment coupon usage count if coupon was used
    if (order.couponCode) {
      await CouponService.incrementUsedCount(order.couponCode);
    }

    return order;
  }

  /**
   * Handle payment failure or session expiration from webhook
   */
  static async handlePaymentFailure(orderId, reason = 'Payment failed') {
    const order = await Order.findById(orderId);
    if (!order) return null;

    if (order.paymentStatus === 'paid') {
      return order; // Cannot mark as failed if already paid
    }

    if (order.paymentStatus !== 'failed' && order.orderStatus !== 'cancelled') {
      order.paymentStatus = 'failed';
      order.orderStatus = 'cancelled';
      order.statusHistory.push({
        status: 'cancelled',
        timestamp: new Date(),
        note: `Payment failed: ${reason}. Stock released.`,
      });

      // Release reserved stock
      await StockService.releaseStock(order.items);
      await order.save();
    }

    return order;
  }

  /**
   * Cancel order: only before shipped, restores stock, triggers refund if paid
   */
  static async cancelOrder(orderId, userId = null, isAdmin = false) {
    const order = await Order.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.code = 'ORDER_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    // If userId provided and not admin, ensure order belongs to user
    if (!isAdmin && userId && order.userId.toString() !== userId.toString()) {
      const err = new Error('You are not authorized to cancel this order');
      err.code = 'FORBIDDEN';
      err.statusCode = 403;
      throw err;
    }

    // Check status: can only cancel before shipped (placed or packed)
    if (order.orderStatus === 'shipped' || order.orderStatus === 'delivered') {
      const err = new Error(
        `Order cannot be cancelled once it has reached "${order.orderStatus}" status`
      );
      err.code = 'CANNOT_CANCEL';
      err.statusCode = 400;
      throw err;
    }

    if (order.orderStatus === 'cancelled') {
      return order; // Already cancelled
    }

    // 1. Release reserved stock
    await StockService.releaseStock(order.items);

    // 2. Refund if paid
    if (order.paymentStatus === 'paid') {
      try {
        if (order.stripePaymentIntentId) {
          await paymentService.refundPayment({
            paymentIntentId: order.stripePaymentIntentId,
            amount: order.total,
          });
        }
        order.paymentStatus = 'refunded';
      } catch (refundError) {
        console.error('Refund processing error:', refundError);
        // Continue marking cancelled, but keep note
      }
    }

    // 3. Decrement coupon usage if coupon was applied and counted
    if (order.couponCode && order.paymentStatus === 'refunded') {
      await CouponService.decrementUsedCount(order.couponCode);
    }

    order.orderStatus = 'cancelled';
    order.statusHistory.push({
      status: 'cancelled',
      timestamp: new Date(),
      note: `Order cancelled by ${isAdmin ? 'admin' : 'customer'}. Stock returned.`,
    });

    await order.save();
    return order;
  }

  /**
   * Update order status forward only (admin workflow)
   */
  static async updateOrderStatus(orderId, newStatus, note = '') {
    const order = await Order.findById(orderId);
    if (!order) {
      const err = new Error('Order not found');
      err.code = 'ORDER_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    if (order.orderStatus === newStatus) {
      return order;
    }

    const allowedNextStatuses = STATUS_FLOW[order.orderStatus] || [];
    if (!allowedNextStatuses.includes(newStatus)) {
      const err = new Error(
        `Invalid status transition from "${order.orderStatus}" to "${newStatus}". Order status can only move forward.`
      );
      err.code = 'INVALID_STATUS_TRANSITION';
      err.statusCode = 400;
      throw err;
    }

    // If moving to cancelled, use cancelOrder to ensure stock release and refund
    if (newStatus === 'cancelled') {
      return this.cancelOrder(orderId, null, true);
    }

    order.orderStatus = newStatus;
    order.statusHistory.push({
      status: newStatus,
      timestamp: new Date(),
      note: note || `Status updated to ${newStatus}`,
    });

    await order.save();
    return order;
  }

  /**
   * Check if user is eligible to review a product (has delivered order containing it)
   */
  static async canUserReviewProduct(userId, productId) {
    const deliveredOrder = await Order.findOne({
      userId,
      orderStatus: 'delivered',
      'items.productId': productId,
    });
    return Boolean(deliveredOrder);
  }
}
