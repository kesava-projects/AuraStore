import { describe, it, expect, beforeEach } from '@jest/globals';
import { Coupon } from '../../src/models/Coupon.js';
import { CouponService } from '../../src/services/couponService.js';

describe('Coupon Rules Service - Unit Tests', () => {
  beforeEach(async () => {
    await Coupon.deleteMany({});
  });

  it('should validate an active and valid percentage coupon', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    await Coupon.create({
      code: 'PROMO10',
      type: 'percent',
      value: 10,
      minOrder: 40,
      maxUses: 100,
      usedCount: 5,
      expiresAt: futureDate,
      isActive: true,
    });

    const result = await CouponService.validateCoupon('promo10', 100);
    expect(result.valid).toBe(true);
    expect(result.coupon.code).toBe('PROMO10');
    expect(result.discount).toBe(10);
  });

  it('should reject non-existent coupon', async () => {
    await expect(CouponService.validateCoupon('NOTREAL', 100)).rejects.toMatchObject({
      code: 'COUPON_NOT_FOUND',
      statusCode: 404,
    });
  });

  it('should reject an inactive coupon', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    await Coupon.create({
      code: 'DISABLED20',
      type: 'fixed',
      value: 20,
      minOrder: 50,
      expiresAt: futureDate,
      isActive: false,
    });

    await expect(CouponService.validateCoupon('DISABLED20', 100)).rejects.toMatchObject({
      code: 'COUPON_INACTIVE',
      statusCode: 400,
    });
  });

  it('should reject an expired coupon', async () => {
    const pastDate = new Date();
    pastDate.setDate(pastDate.getDate() - 5);

    await Coupon.create({
      code: 'EXPIRED15',
      type: 'percent',
      value: 15,
      minOrder: 20,
      expiresAt: pastDate,
      isActive: true,
    });

    await expect(CouponService.validateCoupon('EXPIRED15', 50)).rejects.toMatchObject({
      code: 'COUPON_EXPIRED',
      statusCode: 400,
    });
  });

  it('should reject a coupon when max usage limit has been reached', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    await Coupon.create({
      code: 'LIMITED5',
      type: 'percent',
      value: 5,
      minOrder: 10,
      maxUses: 10,
      usedCount: 10,
      expiresAt: futureDate,
      isActive: true,
    });

    await expect(CouponService.validateCoupon('LIMITED5', 50)).rejects.toMatchObject({
      code: 'COUPON_MAX_USES_REACHED',
      statusCode: 400,
    });
  });

  it('should reject a coupon if order subtotal is below minOrder', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    await Coupon.create({
      code: 'BIGSAVER',
      type: 'fixed',
      value: 25,
      minOrder: 100,
      expiresAt: futureDate,
      isActive: true,
    });

    await expect(CouponService.validateCoupon('BIGSAVER', 75)).rejects.toMatchObject({
      code: 'COUPON_MIN_ORDER_NOT_MET',
      statusCode: 400,
    });
  });

  it('should increment and decrement usedCount correctly', async () => {
    const futureDate = new Date();
    futureDate.setMonth(futureDate.getMonth() + 1);

    const coupon = await Coupon.create({
      code: 'COUNTER',
      type: 'percent',
      value: 10,
      minOrder: 0,
      usedCount: 0,
      expiresAt: futureDate,
      isActive: true,
    });

    await CouponService.incrementUsedCount('COUNTER');
    let fetched = await Coupon.findById(coupon._id);
    expect(fetched.usedCount).toBe(1);

    await CouponService.decrementUsedCount('COUNTER');
    fetched = await Coupon.findById(coupon._id);
    expect(fetched.usedCount).toBe(0);
  });
});
