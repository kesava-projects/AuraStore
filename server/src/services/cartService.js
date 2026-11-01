import { Cart } from '../models/Cart.js';
import { Product } from '../models/Product.js';

export class CartService {
  /**
   * Get user cart with populated product details and refreshed prices
   */
  static async getCart(userId) {
    let cart = await Cart.findOne({ userId }).populate('items.productId');

    if (!cart) {
      cart = await Cart.create({ userId, items: [] });
      return { items: [], subtotal: 0, totalItems: 0 };
    }

    // Filter out deleted or inactive products and sanitize items
    let hasChanges = false;
    const activeItems = [];

    for (const item of cart.items) {
      const prod = item.productId;
      if (!prod || !prod.isActive) {
        hasChanges = true;
        continue;
      }

      // If stock is less than quantity, cap it or keep note
      const cappedQty = Math.min(item.quantity, prod.stock > 0 ? prod.stock : 1);
      if (cappedQty !== item.quantity) {
        item.quantity = cappedQty;
        hasChanges = true;
      }

      // Update price snapshot if product price changed
      if (item.priceSnapshot !== prod.price) {
        item.priceSnapshot = prod.price;
        hasChanges = true;
      }

      activeItems.push({
        _id: item._id,
        productId: prod._id,
        title: prod.title,
        slug: prod.slug,
        price: prod.price,
        image: prod.images?.[0] || '',
        stock: prod.stock,
        quantity: item.quantity,
        priceSnapshot: prod.price,
      });
    }

    if (hasChanges) {
      cart.items = cart.items.filter((item) => {
        const prod = item.productId;
        return prod && prod.isActive;
      });
      await cart.save();
    }

    const subtotal = activeItems.reduce((acc, item) => acc + item.price * item.quantity, 0);
    const totalItems = activeItems.reduce((acc, item) => acc + item.quantity, 0);

    return {
      items: activeItems,
      subtotal: Math.round(subtotal * 100) / 100,
      totalItems,
    };
  }

  /**
   * Replace/update user cart items
   */
  static async updateCart(userId, items) {
    // Validate each product exists and is active
    const sanitizedItems = [];

    for (const item of items) {
      const prod = await Product.findById(item.productId);
      if (!prod || !prod.isActive) {
        continue; // skip invalid products
      }

      const qty = Math.max(1, Math.min(item.quantity, prod.stock > 0 ? prod.stock : 1));

      sanitizedItems.push({
        productId: prod._id,
        quantity: qty,
        priceSnapshot: prod.price,
      });
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: sanitizedItems });
    } else {
      cart.items = sanitizedItems;
    }

    await cart.save();
    return this.getCart(userId);
  }

  /**
   * Merge guest cart into user cart on login
   * @param {string|ObjectId} userId
   * @param {Array<{ productId: string, quantity: number }>} guestItems
   */
  static async mergeGuestCart(userId, guestItems) {
    if (!guestItems || !Array.isArray(guestItems) || guestItems.length === 0) {
      return this.getCart(userId);
    }

    let cart = await Cart.findOne({ userId });
    if (!cart) {
      cart = new Cart({ userId, items: [] });
    }

    const itemMap = new Map();
    for (const item of cart.items) {
      itemMap.set(item.productId.toString(), item);
    }

    for (const gItem of guestItems) {
      const pidStr = gItem.productId.toString();
      const product = await Product.findById(gItem.productId);
      if (!product || !product.isActive || product.stock <= 0) {
        continue;
      }

      if (itemMap.has(pidStr)) {
        const existing = itemMap.get(pidStr);
        const combinedQty = Math.min(existing.quantity + Number(gItem.quantity), product.stock);
        existing.quantity = combinedQty;
        existing.priceSnapshot = product.price;
      } else {
        const initialQty = Math.min(Number(gItem.quantity) || 1, product.stock);
        cart.items.push({
          productId: product._id,
          quantity: initialQty,
          priceSnapshot: product.price,
        });
      }
    }

    await cart.save();
    return this.getCart(userId);
  }

  /**
   * Clear user cart
   */
  static async clearCart(userId) {
    await Cart.findOneAndUpdate({ userId }, { $set: { items: [] } }, { upsert: true });
  }
}
