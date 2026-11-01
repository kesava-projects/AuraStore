import { describe, it, expect, beforeEach } from '@jest/globals';
import request from 'supertest';
import app from '../../src/app.js';
import { User } from '../../src/models/User.js';

describe('Auth Integration Tests', () => {
  beforeEach(async () => {
    await User.deleteMany({});
  });

  it('should register a new user successfully and return httpOnly cookie', async () => {
    const res = await request(app).post('/api/auth/register').send({
      name: 'Jane Doe',
      email: 'jane@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(201);
    expect(res.body.user).toBeDefined();
    expect(res.body.user.name).toBe('Jane Doe');
    expect(res.body.user.email).toBe('jane@example.com');
    expect(res.body.user.role).toBe('customer');
    expect(res.body.user.passwordHash).toBeUndefined();

    // Verify cookie set
    const cookies = res.headers['set-cookie'];
    expect(cookies).toBeDefined();
    expect(cookies[0]).toContain('token=');
    expect(cookies[0]).toContain('HttpOnly');
  });

  it('should reject registration if email is already registered', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Existing User',
      email: 'existing@example.com',
      password: 'Password123!',
    });

    const res = await request(app).post('/api/auth/register').send({
      name: 'Duplicate User',
      email: 'existing@example.com',
      password: 'Password123!',
    });

    expect(res.status).toBe(409);
    expect(res.body.error.code).toBe('EMAIL_ALREADY_EXISTS');
  });

  it('should login an existing user with correct credentials and reject invalid credentials', async () => {
    await request(app).post('/api/auth/register').send({
      name: 'Login Tester',
      email: 'login@example.com',
      password: 'CorrectPassword123!',
    });

    // Valid login
    const validRes = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'CorrectPassword123!',
    });

    expect(validRes.status).toBe(200);
    expect(validRes.body.user.email).toBe('login@example.com');
    const cookies = validRes.headers['set-cookie'];
    expect(cookies[0]).toContain('token=');

    // Invalid password
    const invalidRes = await request(app).post('/api/auth/login').send({
      email: 'login@example.com',
      password: 'WrongPassword!',
    });

    expect(invalidRes.status).toBe(401);
    expect(invalidRes.body.error.code).toBe('INVALID_CREDENTIALS');
  });

  it('should retrieve current user via /api/auth/me when authenticated', async () => {
    const registerRes = await request(app).post('/api/auth/register').send({
      name: 'Me Tester',
      email: 'me@example.com',
      password: 'Password123!',
    });

    const cookie = registerRes.headers['set-cookie'][0];

    const meRes = await request(app).get('/api/auth/me').set('Cookie', cookie);

    expect(meRes.status).toBe(200);
    expect(meRes.body.user.email).toBe('me@example.com');
    expect(meRes.body.user.name).toBe('Me Tester');
  });

  it('should return 401 on /api/auth/me when unauthenticated', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
    expect(res.body.error.code).toBe('UNAUTHORIZED');
  });

  it('should logout user and clear token cookie', async () => {
    const res = await request(app).post('/api/auth/logout');
    expect(res.status).toBe(200);
    const cookies = res.headers['set-cookie'];
    expect(cookies[0]).toContain('token=;');
  });
});
