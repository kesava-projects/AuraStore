import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Product } from '../../src/models/Product.js';
import { Category } from '../../src/models/Category.js';
import { Order } from '../../src/models/Order.js';
import { paymentService } from '../../src/services/payment/index.js';

describe('Order Operations Integration Tests', () => {
  let customerCookie;
  let adminCookie;
  let customerUser;
  let product;
  let cat;

  beforeEach(async () => {
    jest.spyOn(paymentService, 'refundPayment').mockResolvedValue({
      id: 're_mock_test',
      status: 'succeeded',
    });
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});

    cat = await Category.create({ name: 'Home', slug: 'home' });
    product = await Product.create({
      title: 'Coffee Mug',
      slug: 'coffee-mug',
      description: 'Handmade mug',
      price: 20,
      stock: 10,
      sku: 'MUG-1',
      categoryId: cat._id,
      isActive: true,
    });

    // Customer
    const custRes = await request(app).post('/api/auth/register').send({
      name: 'Order Customer',
      email: 'customer@example.com',
      password: 'Password123!',
    });
    customerCookie = custRes.headers['set-cookie'][0];
    customerUser = custRes.body.user;

    // Admin
    await User.create({
      name: 'Super Admin',
      email: 'admin_orders@example.com',
      passwordHash: 'dummy',
      role: 'admin',
    });
    await User.updateOne({ _id: customerUser._id }, { $set: { role: 'customer' } });
    await User.updateOne(
      { email: 'admin_orders@example.com' },
      { $set: { passwordHash: (await User.findById(customerUser._id)).passwordHash } }
    );
    const adminRes = await request(app).post('/api/auth/login').send({
      email: 'admin_orders@example.com',
      password: 'Password123!',
    });
    adminCookie = adminRes.headers['set-cookie'][0];
  });

  it('should allow customer to cancel order when placed or packed, restoring stock', async () => {
    const order = await Order.create({
      userId: customerUser._id,
      items: [
        {
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity: 3,
        },
      ],
      shippingAddress: {
        fullName: 'Order Customer',
        street: '123 Fake St',
        city: 'Town',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        phone: '+1 555-9999',
      },
      subtotal: 60,
      total: 64.8,
      paymentStatus: 'paid',
      orderStatus: 'placed',
      stripePaymentIntentId: 'pi_mock_cancel_test',
    });

    const initialStock = product.stock; // 10

    const cancelRes = await request(app)
      .patch(`/api/orders/${order._id}/cancel`)
      .set('Cookie', customerCookie);

    expect(cancelRes.status).toBe(200);
    expect(cancelRes.body.order.orderStatus).toBe('cancelled');
    expect(cancelRes.body.order.paymentStatus).toBe('refunded');

    // Stock should be restored: 10 + 3 = 13
    const refreshedProduct = await Product.findById(product._id);
    expect(refreshedProduct.stock).toBe(initialStock + 3);
  });

  it('should prevent customer from cancelling an order that has already shipped', async () => {
    const order = await Order.create({
      userId: customerUser._id,
      items: [
        {
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: 'Order Customer',
        street: '123 Fake St',
        city: 'Town',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        phone: '+1 555-9999',
      },
      subtotal: 20,
      total: 21.6,
      paymentStatus: 'paid',
      orderStatus: 'shipped',
    });

    const cancelRes = await request(app)
      .patch(`/api/orders/${order._id}/cancel`)
      .set('Cookie', customerCookie);

    expect(cancelRes.status).toBe(400);
    expect(cancelRes.body.error.code).toBe('CANNOT_CANCEL');
  });

  it('should enforce forward-only transitions for order status (placed -> packed -> shipped -> delivered)', async () => {
    const order = await Order.create({
      userId: customerUser._id,
      items: [
        {
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: 'Order Customer',
        street: '123 Fake St',
        city: 'Town',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        phone: '+1 555-9999',
      },
      subtotal: 20,
      total: 21.6,
      paymentStatus: 'paid',
      orderStatus: 'placed',
    });

    // Valid forward transition: placed -> packed
    const res1 = await request(app)
      .patch(`/api/admin/orders/${order._id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'packed', note: 'Ready in box' });
    expect(res1.status).toBe(200);
    expect(res1.body.order.orderStatus).toBe('packed');

    // Invalid backwards transition: packed -> placed
    const res2 = await request(app)
      .patch(`/api/admin/orders/${order._id}/status`)
      .set('Cookie', adminCookie)
      .send({ status: 'placed' });
    expect(res2.status).toBe(400);
    expect(res2.body.error.code).toBe('INVALID_STATUS_TRANSITION');
  });
});
