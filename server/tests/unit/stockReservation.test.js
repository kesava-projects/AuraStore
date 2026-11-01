import { describe, it, expect, beforeEach } from '@jest/globals';
import { Product } from '../../src/models/Product.js';
import { Category } from '../../src/models/Category.js';
import { StockService } from '../../src/services/stockService.js';

describe('Stock Reservation Service - Unit Tests', () => {
  let category;

  beforeEach(async () => {
    await Product.deleteMany({});
    await Category.deleteMany({});

    category = await Category.create({
      name: 'Test Category',
      slug: 'test-category',
    });
  });

  it('should successfully reserve stock atomically when available', async () => {
    const prod1 = await Product.create({
      title: 'Item A',
      slug: 'item-a',
      description: 'Desc A',
      price: 20,
      stock: 10,
      sku: 'SKU-A',
      categoryId: category._id,
      isActive: true,
    });

    const prod2 = await Product.create({
      title: 'Item B',
      slug: 'item-b',
      description: 'Desc B',
      price: 35,
      stock: 5,
      sku: 'SKU-B',
      categoryId: category._id,
      isActive: true,
    });

    await StockService.reserveStock([
      { productId: prod1._id, quantity: 3 },
      { productId: prod2._id, quantity: 2 },
    ]);

    const updated1 = await Product.findById(prod1._id);
    const updated2 = await Product.findById(prod2._id);

    expect(updated1.stock).toBe(7);
    expect(updated2.stock).toBe(3);
  });

  it('should rollback all prior reservations if a subsequent item has insufficient stock', async () => {
    const prod1 = await Product.create({
      title: 'Item A',
      slug: 'item-a',
      description: 'Desc A',
      price: 20,
      stock: 10,
      sku: 'SKU-A',
      categoryId: category._id,
      isActive: true,
    });

    const prod2 = await Product.create({
      title: 'Item B (Low Stock)',
      slug: 'item-b-low',
      description: 'Desc B',
      price: 35,
      stock: 1, // Only 1 in stock
      sku: 'SKU-B',
      categoryId: category._id,
      isActive: true,
    });

    // Attempt to reserve 5 of item A and 3 of item B (which fails)
    await expect(
      StockService.reserveStock([
        { productId: prod1._id, quantity: 5 },
        { productId: prod2._id, quantity: 3 },
      ])
    ).rejects.toMatchObject({
      code: 'INSUFFICIENT_STOCK',
      statusCode: 400,
    });

    // Verify prod1 was rolled back and still has original 10 stock!
    const refreshed1 = await Product.findById(prod1._id);
    const refreshed2 = await Product.findById(prod2._id);

    expect(refreshed1.stock).toBe(10);
    expect(refreshed2.stock).toBe(1);
  });

  it('should release stock properly', async () => {
    const prod = await Product.create({
      title: 'Item C',
      slug: 'item-c',
      description: 'Desc C',
      price: 15,
      stock: 4,
      sku: 'SKU-C',
      categoryId: category._id,
      isActive: true,
    });

    await StockService.releaseStock([{ productId: prod._id, quantity: 3 }]);

    const refreshed = await Product.findById(prod._id);
    expect(refreshed.stock).toBe(7);
  });
});
