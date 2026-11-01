import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Product } from '../../src/models/Product.js';
import { Category } from '../../src/models/Category.js';
import { Cart } from '../../src/models/Cart.js';

describe('Cart Integration Tests', () => {
  let authCookie;
  let prod1;
  let prod2;

  beforeEach(async () => {
    await User.deleteMany({});
    await Product.deleteMany({});
    await Category.deleteMany({});
    await Cart.deleteMany({});

    const cat = await Category.create({ name: 'Gadgets', slug: 'gadgets' });

    prod1 = await Product.create({
      title: 'Gadget One',
      slug: 'gadget-one',
      description: 'Gadget 1 desc',
      price: 50,
      stock: 10,
      sku: 'G1',
      categoryId: cat._id,
      isActive: true,
    });

    prod2 = await Product.create({
      title: 'Gadget Two',
      slug: 'gadget-two',
      description: 'Gadget 2 desc',
      price: 30,
      stock: 5,
      sku: 'G2',
      categoryId: cat._id,
      isActive: true,
    });

    const reg = await request(app).post('/api/auth/register').send({
      name: 'Cart Buyer',
      email: 'cartbuyer@example.com',
      password: 'Password123!',
    });
    authCookie = reg.headers['set-cookie'][0];
  });

  it('should reject unauthenticated cart access', async () => {
    const res = await request(app).get('/api/cart');
    expect(res.status).toBe(401);
  });

  it('should get empty cart initially and update cart items', async () => {
    const getRes = await request(app).get('/api/cart').set('Cookie', authCookie);
    expect(getRes.status).toBe(200);
    expect(getRes.body.items).toHaveLength(0);
    expect(getRes.body.subtotal).toBe(0);

    const updateRes = await request(app)
      .put('/api/cart')
      .set('Cookie', authCookie)
      .send({
        items: [
          { productId: prod1._id.toString(), quantity: 2 },
          { productId: prod2._id.toString(), quantity: 1 },
        ],
      });

    expect(updateRes.status).toBe(200);
    expect(updateRes.body.items).toHaveLength(2);
    expect(updateRes.body.subtotal).toBe(130); // 50*2 + 30*1
    expect(updateRes.body.totalItems).toBe(3);
  });

  it('should merge guest cart into user cart properly', async () => {
    // User already has prod1 x 1 in cart
    await request(app)
      .put('/api/cart')
      .set('Cookie', authCookie)
      .send({
        items: [{ productId: prod1._id.toString(), quantity: 1 }],
      });

    // Guest cart has prod1 x 2 and prod2 x 2
    const mergeRes = await request(app)
      .post('/api/cart/merge')
      .set('Cookie', authCookie)
      .send({
        items: [
          { productId: prod1._id.toString(), quantity: 2 },
          { productId: prod2._id.toString(), quantity: 2 },
        ],
      });

    expect(mergeRes.status).toBe(200);
    expect(mergeRes.body.items).toHaveLength(2);

    const p1Item = mergeRes.body.items.find((i) => i.productId === prod1._id.toString());
    const p2Item = mergeRes.body.items.find((i) => i.productId === prod2._id.toString());

    expect(p1Item.quantity).toBe(3); // 1 + 2
    expect(p2Item.quantity).toBe(2);
    expect(mergeRes.body.subtotal).toBe(210); // 50*3 + 30*2 = 210
  });
});
