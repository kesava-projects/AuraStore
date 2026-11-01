import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Product } from '../../src/models/Product.js';
import { Category } from '../../src/models/Category.js';
import { Order } from '../../src/models/Order.js';

describe('Stripe Webhook Integration Tests', () => {
  let product;
  let user;
  let order;

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});

    const cat = await Category.create({ name: 'Tech', slug: 'tech' });
    product = await Product.create({
      title: 'Laptop Pro',
      slug: 'laptop-pro',
      description: 'High performance laptop',
      price: 1000,
      stock: 8,
      sku: 'LP-1',
      categoryId: cat._id,
      isActive: true,
    });

    user = await User.create({
      name: 'Webhook Tester',
      email: 'webhook@example.com',
      passwordHash: 'dummyhash',
      role: 'customer',
    });

    order = await Order.create({
      userId: user._id,
      items: [
        {
          productId: product._id,
          title: product.title,
          price: product.price,
          quantity: 2,
        },
      ],
      shippingAddress: {
        fullName: 'Webhook Tester',
        street: '123 Fake St',
        city: 'Metropolis',
        state: 'NY',
        postalCode: '10001',
        country: 'USA',
        phone: '+1 555-9999',
      },
      subtotal: 2000,
      total: 2160,
      paymentStatus: 'pending',
      orderStatus: 'placed',
      stripeSessionId: 'cs_test_mock_webhook_session_123',
    });
  });

  it('should mark order as paid from checkout.session.completed event', async () => {
    const payload = {
      id: 'evt_test_1',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_mock_webhook_session_123',
          payment_intent: 'pi_test_mock_12345',
          metadata: {
            orderId: order._id.toString(),
          },
        },
      },
    };

    const res = await request(app).post('/api/webhooks/stripe').send(payload);

    expect(res.status).toBe(200);
    expect(res.body.received).toBe(true);

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.paymentStatus).toBe('paid');
    expect(updatedOrder.stripePaymentIntentId).toBe('pi_test_mock_12345');
    expect(updatedOrder.statusHistory.length).toBeGreaterThan(1);
  });

  it('should be idempotent: duplicate checkout.session.completed events do not cause errors or duplicate updates', async () => {
    const payload = {
      id: 'evt_test_duplicate',
      type: 'checkout.session.completed',
      data: {
        object: {
          id: 'cs_test_mock_webhook_session_123',
          payment_intent: 'pi_test_mock_12345',
          metadata: {
            orderId: order._id.toString(),
          },
        },
      },
    };

    // First call
    const res1 = await request(app).post('/api/webhooks/stripe').send(payload);
    expect(res1.status).toBe(200);

    const historyCountAfterFirst = (await Order.findById(order._id)).statusHistory.length;

    // Second call with duplicate payload
    const res2 = await request(app).post('/api/webhooks/stripe').send(payload);
    expect(res2.status).toBe(200);

    const historyCountAfterSecond = (await Order.findById(order._id)).statusHistory.length;
    expect(historyCountAfterSecond).toBe(historyCountAfterFirst);
  });

  it('should handle checkout.session.expired by releasing stock and marking order cancelled', async () => {
    const payload = {
      id: 'evt_test_expired',
      type: 'checkout.session.expired',
      data: {
        object: {
          id: 'cs_test_mock_webhook_session_123',
          metadata: {
            orderId: order._id.toString(),
          },
        },
      },
    };

    const initialStock = product.stock; // 8

    const res = await request(app).post('/api/webhooks/stripe').send(payload);
    expect(res.status).toBe(200);

    const updatedOrder = await Order.findById(order._id);
    expect(updatedOrder.paymentStatus).toBe('failed');
    expect(updatedOrder.orderStatus).toBe('cancelled');

    // Stock was released (8 + 2 = 10)
    const refreshedProduct = await Product.findById(product._id);
    expect(refreshedProduct.stock).toBe(initialStock + 2);
  });
});
