import { Product } from '../models/Product.js';

export class StockService {
  /**
   * Atomically reserve stock for an array of items.
   * If any single item fails due to insufficient stock, roll back all reservations made in this call.
   * @param {Array<{ productId: string|ObjectId, quantity: number }>} items
   */
  static async reserveStock(items) {
    if (!items || items.length === 0) {
      return true;
    }

    const reserved = [];

    try {
      for (const item of items) {
        const qty = Number(item.quantity);
        if (qty <= 0) continue;

        const updated = await Product.findOneAndUpdate(
          {
            _id: item.productId,
            stock: { $gte: qty },
            isActive: true,
          },
          {
            $inc: { stock: -qty },
          },
          { new: true }
        );

        if (!updated) {
          const product = await Product.findById(item.productId).select('title stock');
          const productTitle = product ? product.title : item.productId;
          const available = product ? product.stock : 0;
          const err = new Error(
            `Insufficient stock for "${productTitle}". Requested ${qty}, but only ${available} available.`
          );
          err.code = 'INSUFFICIENT_STOCK';
          err.statusCode = 400;
          throw err;
        }

        reserved.push({
          productId: item.productId,
          quantity: qty,
        });
      }

      return true;
    } catch (error) {
      // Rollback any items reserved so far
      for (const res of reserved) {
        await Product.updateOne({ _id: res.productId }, { $inc: { stock: res.quantity } });
      }
      throw error;
    }
  }

  /**
   * Release reserved stock back into product inventory.
   * Used on payment failure, checkout session expiration, or order cancellation.
   * @param {Array<{ productId: string|ObjectId, quantity: number }>} items
   */
  static async releaseStock(items) {
    if (!items || items.length === 0) {
      return;
    }

    for (const item of items) {
      const qty = Number(item.quantity);
      if (qty <= 0) continue;

      await Product.updateOne({ _id: item.productId }, { $inc: { stock: qty } });
    }
  }
}
