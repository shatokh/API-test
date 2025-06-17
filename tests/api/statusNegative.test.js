// tests/api/statusNegative.test.js
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../../server.js';
import User from '../../models/User.js';

describe('PATCH /api/auth/users/:id/status (negative)', () => {
  let userId;
  let adminToken;

  beforeEach(async () => {
    // создаём пользователя перед каждым тестом
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'statusneg@example.com', password: 'pass1234' });
    userId = reg.body.userId;

    // создаём админа перед каждым тестом
    const hash = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      email: 'adminStatus@test.com',
      password: hash,
      role: 'admin',
    });
    adminToken = jwt.sign(
      { userId: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
    );
  });

  it('401 без токена', async () => {
    const res = await request(app)
      .patch(`/api/auth/users/${userId}/status`)
      .send({ status: 'active' });
    expect(res.status).toBe(401);
  });

  it('401 при невалидном токене', async () => {
    const res = await request(app)
      .patch(`/api/auth/users/${userId}/status`)
      .set('Authorization', 'Bearer invalid')
      .send({ status: 'active' });
    expect(res.status).toBe(401);
  });

  it('403 при недостаточных правах (не админ)', async () => {
    const userLogin = await request(app)
      .post('/api/auth/login')
      .send({ email: 'statusneg@example.com', password: 'pass1234' });
    const userToken = userLogin.body.token;

    const res = await request(app)
      .patch(`/api/auth/users/${userId}/status`)
      .set('Authorization', `Bearer ${userToken}`)
      .send({ status: 'inactive' });
    expect(res.status).toBe(403);
  });

  it('400 при некорректном ID', async () => {
    const res = await request(app)
      .patch('/api/auth/users/bad-id/status')
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'active' });
    expect(res.status).toBe(400);
  });

  it('400 при некорректном теле (отсутствует статус)', async () => {
    const res = await request(app)
      .patch(`/api/auth/users/${userId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({});
    expect(res.status).toBe(400);
  });

  it('400 при недопустимом значении status', async () => {
    const res = await request(app)
      .patch(`/api/auth/users/${userId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'unknown' });
    expect(res.status).toBe(400);
  });
});
