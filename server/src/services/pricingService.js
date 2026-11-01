/**
 * Pricing service - pure business calculation logic.
 * Recalculates all order totals on the server from validated product prices.
 */

export function round(value) {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function calculateOrderTotals({
  items,
  coupon = null,
  taxRate = 0.08,
  freeShippingThreshold = 100,
  standardShippingFee = 10,
}) {
  if (!items || items.length === 0) {
    throw new Error('Items cannot be empty');
  }

  // Calculate subtotal from validated item prices
  const subtotal = round(
    items.reduce((sum, item) => {
      const price = Number(item.price);
      const qty = Number(item.quantity);
      if (isNaN(price) || price < 0 || isNaN(qty) || qty < 1) {
        throw new Error(`Invalid price or quantity for item: ${item.title || item.productId}`);
      }
      return sum + price * qty;
    }, 0)
  );

  // Calculate discount if coupon is present and valid
  let discount = 0;
  if (coupon) {
    if (coupon.type === 'percent') {
      discount = round((subtotal * coupon.value) / 100);
    } else if (coupon.type === 'fixed') {
      discount = round(Math.min(coupon.value, subtotal));
    }
  }

  const discountedSubtotal = Math.max(0, subtotal - discount);

  // Shipping fee calculation: free if discounted subtotal >= threshold, else flat fee
  const shippingFee =
    discountedSubtotal >= freeShippingThreshold || discountedSubtotal === 0
      ? 0
      : standardShippingFee;

  // Tax calculation
  const tax = round(discountedSubtotal * taxRate);

  // Final total
  const total = round(discountedSubtotal + shippingFee + tax);

  return {
    subtotal,
    discount,
    shippingFee,
    tax,
    total,
  };
}
