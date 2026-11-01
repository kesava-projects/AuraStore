import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/User.js';
import { Category } from '../../src/models/Category.js';
import { Product } from '../../src/models/Product.js';

describe('Admin Products API Integration Tests', () => {
  let adminCookie;
  let category;

  beforeEach(async () => {
    await User.deleteMany({});
    await Category.deleteMany({});
    await Product.deleteMany({});

    // Register admin user
    const res = await request(app).post('/api/auth/register').send({
      name: 'Admin User',
      email: 'admin_products@example.com',
      password: 'AdminPassword123!',
    });
    adminCookie = res.headers['set-cookie'][0];
    await User.updateOne({ email: 'admin_products@example.com' }, { $set: { role: 'admin' } });

    category = await Category.create({
      name: 'Electronics',
      slug: 'electronics',
    });
  });

  it('should successfully create a product using JSON payload', async () => {
    const payload = {
      title: 'Gaming Keyboard',
      description: 'Mechanical keyboard with blue switches',
      price: 79.99,
      compareAtPrice: 99.99,
      categoryId: category._id.toString(),
      stock: 20,
      sku: 'KB-001',
      images: ['https://example.com/keyboard.jpg'],
      isActive: true,
    };

    const res = await request(app)
      .post('/api/admin/products')
      .set('Cookie', adminCookie)
      .send(payload);

    expect(res.status).toBe(201);
    expect(res.body.product).toBeDefined();
    expect(res.body.product.title).toBe('Gaming Keyboard');
    expect(res.body.product.price).toBe(79.99);
    expect(res.body.product.isActive).toBe(true);
    expect(res.body.product.images).toContain('https://example.com/keyboard.jpg');
  });

  it('should successfully create a product using multipart/form-data payload with string isActive and empty compareAtPrice', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Cookie', adminCookie)
      .field('title', 'Wireless Gaming Mouse')
      .field('description', 'High performance wireless mouse with optical sensor')
      .field('price', '49.99')
      .field('compareAtPrice', '')
      .field('categoryId', category._id.toString())
      .field('stock', '15')
      .field('sku', 'MOUSE-001')
      .field('isActive', 'true');

    expect(res.status).toBe(201);
    expect(res.body.product).toBeDefined();
    expect(res.body.product.title).toBe('Wireless Gaming Mouse');
    expect(res.body.product.price).toBe(49.99);
    expect(res.body.product.compareAtPrice).toBeNull();
    expect(res.body.product.isActive).toBe(true);
  });

  it('should successfully create a product using multipart/form-data with attached image file', async () => {
    const dummyImage = Buffer.from(
      'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==',
      'base64'
    );

    const res = await request(app)
      .post('/api/admin/products')
      .set('Cookie', adminCookie)
      .field('title', 'USB-C Cable')
      .field('description', 'Braided high-speed fast charging cable')
      .field('price', '12.99')
      .field('categoryId', category._id.toString())
      .field('stock', '50')
      .field('sku', 'CABLE-001')
      .field('isActive', 'true')
      .attach('image', dummyImage, 'cable.png');

    expect(res.status).toBe(201);
    expect(res.body.product).toBeDefined();
    expect(res.body.product.images.length).toBeGreaterThan(0);
    expect(res.body.product.isActive).toBe(true);
  });

  it('should return 400 validation error with descriptive message when required fields are missing', async () => {
    const res = await request(app)
      .post('/api/admin/products')
      .set('Cookie', adminCookie)
      .send({
        title: '',
        description: 'Short',
        price: -5,
      });

    expect(res.status).toBe(400);
    expect(res.body.error.code).toBe('VALIDATION_ERROR');
    expect(res.body.error.details.length).toBeGreaterThan(0);
  });

  it('should update a product successfully via PUT', async () => {
    const product = await Product.create({
      title: 'Original Title',
      slug: 'original-title',
      description: 'Original description here',
      price: 30,
      stock: 5,
      sku: 'ORIG-001',
      categoryId: category._id,
      isActive: true,
    });

    const res = await request(app)
      .put(`/api/admin/products/${product._id}`)
      .set('Cookie', adminCookie)
      .field('title', 'Updated Title')
      .field('isActive', 'false');

    expect(res.status).toBe(200);
    expect(res.body.product.title).toBe('Updated Title');
    expect(res.body.product.isActive).toBe(false);
  });
});
