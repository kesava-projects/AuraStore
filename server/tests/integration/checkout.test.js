import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Product } from '../../src/models/Product.js';
import { Category } from '../../src/models/Category.js';
import { Coupon } from '../../src/models/Coupon.js';
import { Cart } from '../../src/models/Cart.js';
import { Order } from '../../src/models/Order.js';

describe('Checkout Integration Tests', () => {
  let authCookie;
  let testUser;
  let product;

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Coupon.deleteMany({});
    await Cart.deleteMany({});
    await Order.deleteMany({});

    const cat = await Category.create({ name: 'Audio', slug: 'audio' });

    product = await Product.create({
      title: 'SoundBar 500',
      slug: 'soundbar-500',
      description: 'Soundbar with subwoofer',
      price: 150,
      stock: 5,
      sku: 'SB-500',
      categoryId: cat._id,
      isActive: true,
    });

    const futureDate = new Date();
    futureDate.setFullYear(futureDate.getFullYear() + 1);

    await Coupon.create({
      code: 'DISCOUNT10',
      type: 'percent',
      value: 10,
      minOrder: 50,
      expiresAt: futureDate,
      isActive: true,
    });

    const reg = await request(app).post('/api/auth/register').send({
      name: 'Checkout Tester',
      email: 'checkout@example.com',
      password: 'Password123!',
    });
    authCookie = reg.headers['set-cookie'][0];
    testUser = reg.body.user;
  });

  it('should validate a coupon via /api/coupons/validate', async () => {
    const res = await request(app).post('/api/coupons/validate').send({
      code: 'discount10',
      subtotal: 150,
    });

    expect(res.status).toBe(200);
    expect(res.body.valid).toBe(true);
    expect(res.body.discount).toBe(15);
  });

  it('should create a checkout session, reserve stock atomically, and clear user cart', async () => {
    // 1. Add item to user cart
    await request(app)
      .put('/api/cart')
      .set('Cookie', authCookie)
      .send({
        items: [{ productId: product._id.toString(), quantity: 2 }],
      });

    // 2. Create checkout session
    const res = await request(app)
      .post('/api/checkout/session')
      .set('Cookie', authCookie)
      .send({
        shippingAddress: {
          fullName: 'Checkout Tester',
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '90210',
          country: 'USA',
          phone: '+1 555-0199',
        },
        couponCode: 'DISCOUNT10',
      });

    expect(res.status).toBe(201);
    expect(res.body.sessionId).toBeDefined();
    expect(res.body.url).toBeDefined();
    expect(res.body.orderId).toBeDefined();

    // 3. Verify stock was atomically decremented: 5 - 2 = 3
    const refreshedProduct = await Product.findById(product._id);
    expect(refreshedProduct.stock).toBe(3);

    // 4. Verify user cart is cleared
    const cartRes = await request(app).get('/api/cart').set('Cookie', authCookie);
    expect(cartRes.body.items).toHaveLength(0);

    // 5. Verify created order has verified pricing and status 'placed'
    const order = await Order.findById(res.body.orderId);
    expect(order.orderStatus).toBe('placed');
    expect(order.paymentStatus).toBe('pending');
    expect(order.subtotal).toBe(300); // 150 * 2
    expect(order.discount).toBe(30); // 10% of 300
    expect(order.couponCode).toBe('DISCOUNT10');
  });

  it('should reject checkout session when stock is insufficient', async () => {
    // Add 10 items when only 5 exist
    await Cart.create({
      userId: testUser._id,
      items: [{ productId: product._id, quantity: 10, priceSnapshot: 150 }],
    });

    const res = await request(app)
      .post('/api/checkout/session')
      .set('Cookie', authCookie)
      .send({
        shippingAddress: {
          fullName: 'Checkout Tester',
          street: '123 Main St',
          city: 'Anytown',
          state: 'CA',
          postalCode: '90210',
          country: 'USA',
          phone: '+1 555-0199',
        },
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('INSUFFICIENT_STOCK');

    // Product stock should remain intact at 5
    const refreshedProduct = await Product.findById(product._id);
    expect(refreshedProduct.stock).toBe(5);
  });
});
