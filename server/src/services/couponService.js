import { Coupon } from '../models/Coupon.js';
import { round } from './pricingService.js';

export class CouponService {
  /**
   * Validate coupon code against subtotal
   */
  static async validateCoupon(code, subtotal) {
    if (!code || typeof code !== 'string') {
      const err = new Error('Coupon code is required');
      err.code = 'INVALID_COUPON';
      err.statusCode = 400;
      throw err;
    }

    const normalizedCode = code.trim().toUpperCase();
    const coupon = await Coupon.findOne({ code: normalizedCode });

    if (!coupon) {
      const err = new Error(`Coupon "${code}" does not exist`);
      err.code = 'COUPON_NOT_FOUND';
      err.statusCode = 404;
      throw err;
    }

    if (!coupon.isActive) {
      const err = new Error('This coupon is inactive');
      err.code = 'COUPON_INACTIVE';
      err.statusCode = 400;
      throw err;
    }

    const now = new Date();
    if (new Date(coupon.expiresAt) < now) {
      const err = new Error('This coupon has expired');
      err.code = 'COUPON_EXPIRED';
      err.statusCode = 400;
      throw err;
    }

    if (
      coupon.maxUses !== null &&
      coupon.maxUses !== undefined &&
      coupon.usedCount >= coupon.maxUses
    ) {
      const err = new Error('This coupon has reached its maximum usage limit');
      err.code = 'COUPON_MAX_USES_REACHED';
      err.statusCode = 400;
      throw err;
    }

    if (subtotal !== undefined && subtotal < coupon.minOrder) {
      const err = new Error(
        `Minimum order of $${coupon.minOrder.toFixed(2)} required for this coupon`
      );
      err.code = 'COUPON_MIN_ORDER_NOT_MET';
      err.statusCode = 400;
      throw err;
    }

    let discount = 0;
    if (subtotal !== undefined) {
      if (coupon.type === 'percent') {
        discount = round((subtotal * coupon.value) / 100);
      } else if (coupon.type === 'fixed') {
        discount = round(Math.min(coupon.value, subtotal));
      }
    }

    return {
      valid: true,
      coupon,
      discount,
    };
  }

  /**
   * Atomically increment coupon used count
   */
  static async incrementUsedCount(code) {
    if (!code) return;
    const normalizedCode = code.trim().toUpperCase();
    await Coupon.updateOne({ code: normalizedCode }, { $inc: { usedCount: 1 } });
  }

  /**
   * Decrement coupon used count (in case order is cancelled or rolled back)
   */
  static async decrementUsedCount(code) {
    if (!code) return;
    const normalizedCode = code.trim().toUpperCase();
    await Coupon.updateOne(
      { code: normalizedCode, usedCount: { $gt: 0 } },
      { $inc: { usedCount: -1 } }
    );
  }
}
