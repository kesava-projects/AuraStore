import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Product } from '../../src/models/Product.js';
import { Category } from '../../src/models/Category.js';
import { Order } from '../../src/models/Order.js';

describe('Permissions & Role-Based Access Control Tests', () => {
  let customer1Cookie;
  let customer2Cookie;
  let customer1;
  let order;

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Order.deleteMany({});

    const cat = await Category.create({ name: 'General', slug: 'general' });
    const prod = await Product.create({
      title: 'Item P',
      slug: 'item-p',
      description: 'Desc',
      price: 10,
      stock: 5,
      sku: 'SKU-P',
      categoryId: cat._id,
    });

    const c1 = await request(app).post('/api/auth/register').send({
      name: 'Customer One',
      email: 'c1@example.com',
      password: 'Password123!',
    });
    customer1Cookie = c1.headers['set-cookie'][0];
    customer1 = c1.body.user;

    const c2 = await request(app).post('/api/auth/register').send({
      name: 'Customer Two',
      email: 'c2@example.com',
      password: 'Password123!',
    });
    customer2Cookie = c2.headers['set-cookie'][0];

    order = await Order.create({
      userId: customer1._id,
      items: [
        {
          productId: prod._id,
          title: prod.title,
          price: prod.price,
          quantity: 1,
        },
      ],
      shippingAddress: {
        fullName: 'Customer One',
        street: '123 Fake',
        city: 'City',
        state: 'ST',
        postalCode: '11111',
        country: 'USA',
        phone: '555-1111',
      },
      subtotal: 10,
      total: 10.8,
      paymentStatus: 'paid',
      orderStatus: 'placed',
    });
  });

  it('should block non-admin customers from accessing admin routes with 403 Forbidden', async () => {
    const res = await request(app).get('/api/admin/reports/sales').set('Cookie', customer1Cookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });

  it('should block unauthenticated guests from accessing admin routes with 401 Unauthorized', async () => {
    const res = await request(app).get('/api/admin/products');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should block customer 2 from accessing customer 1 order with 403 Forbidden', async () => {
    const res = await request(app).get(`/api/orders/${order._id}`).set('Cookie', customer2Cookie);

    expect(res.status).toBe(403);
    expect(res.body.error.code).toBe('FORBIDDEN');
  });
});
