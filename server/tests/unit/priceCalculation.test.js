import { describe, it, expect } from '@jest/globals';
import { calculateOrderTotals, round } from '../../src/services/pricingService.js';

describe('Pricing Service - Unit Tests', () => {
  it('should round numbers accurately to 2 decimal places', () => {
    expect(round(10.2345)).toBe(10.23);
    expect(round(10.2355)).toBe(10.24);
    expect(round(1.005)).toBe(1.01);
  });

  it('should correctly calculate subtotal, shipping, tax and total without coupon', () => {
    const items = [
      { productId: 'p1', price: 25.0, quantity: 2 }, // 50.00
      { productId: 'p2', price: 15.5, quantity: 1 }, // 15.50
    ];
    // Subtotal = 65.50 (< 100 threshold, so standard shipping $10 applies)
    // Discount = 0
    // Discounted subtotal = 65.50
    // Shipping = 10.00
    // Tax = 65.50 * 0.08 = 5.24
    // Total = 65.50 + 10.00 + 5.24 = 80.74

    const result = calculateOrderTotals({ items });

    expect(result.subtotal).toBe(65.5);
    expect(result.discount).toBe(0);
    expect(result.shippingFee).toBe(10.0);
    expect(result.tax).toBe(5.24);
    expect(result.total).toBe(80.74);
  });

  it('should grant free shipping when subtotal exceeds freeShippingThreshold ($100)', () => {
    const items = [{ productId: 'p1', price: 120.0, quantity: 1 }];
    // Subtotal = 120.00 (>= 100) -> Shipping = 0
    // Tax = 120 * 0.08 = 9.60
    // Total = 120 + 0 + 9.60 = 129.60

    const result = calculateOrderTotals({ items });

    expect(result.subtotal).toBe(120.0);
    expect(result.shippingFee).toBe(0);
    expect(result.tax).toBe(9.6);
    expect(result.total).toBe(129.6);
  });

  it('should calculate percentage coupon discount properly', () => {
    const items = [
      { productId: 'p1', price: 100.0, quantity: 2 }, // 200.00
    ];
    const coupon = { type: 'percent', value: 15 }; // 15% of 200 = 30.00
    // Discounted subtotal = 170.00
    // Shipping = 0 (170 >= 100)
    // Tax = 170 * 0.08 = 13.60
    // Total = 170 + 0 + 13.60 = 183.60

    const result = calculateOrderTotals({ items, coupon });

    expect(result.subtotal).toBe(200.0);
    expect(result.discount).toBe(30.0);
    expect(result.shippingFee).toBe(0);
    expect(result.tax).toBe(13.6);
    expect(result.total).toBe(183.6);
  });

  it('should calculate fixed coupon discount and cap at subtotal if coupon exceeds it', () => {
    const items = [{ productId: 'p1', price: 30.0, quantity: 1 }];
    const coupon = { type: 'fixed', value: 50.0 }; // Fixed $50 on $30 order

    const result = calculateOrderTotals({ items, coupon });

    expect(result.subtotal).toBe(30.0);
    expect(result.discount).toBe(30.0); // capped at subtotal
    expect(result.tax).toBe(0); // 0 discounted subtotal
    expect(result.shippingFee).toBe(0); // 0 subtotal
    expect(result.total).toBe(0);
  });

  it('should throw an error for empty items or negative price/quantity', () => {
    expect(() => calculateOrderTotals({ items: [] })).toThrow('Items cannot be empty');
    expect(() =>
      calculateOrderTotals({
        items: [{ productId: 'p1', price: -5, quantity: 1 }],
      })
    ).toThrow();
    expect(() =>
      calculateOrderTotals({
        items: [{ productId: 'p1', price: 10, quantity: 0 }],
      })
    ).toThrow();
  });
});
