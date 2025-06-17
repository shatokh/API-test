// tests/api/adminStatusPositive.test.js
import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import app from '../../server.js';
import User from '../../models/User.js';

describe('PATCH /api/auth/users/:id/status (admin positive)', () => {
  let userId;
  let adminToken;

  beforeAll(async () => {
    // создаём тестового пользователя
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'tochange@example.com', password: 'pass1234' });
    userId = reg.body.userId;

    // создаём админа вручную в БД
    const hash = await bcrypt.hash('adminpass', 10);
    const admin = await User.create({
      email: 'admin2@test.com',
      password: hash,
      role: 'admin',
    });
    adminToken = jwt.sign(
      { userId: admin._id, role: 'admin' },
      process.env.JWT_SECRET,
    );
  });

  it('админ успешно меняет статус пользователя', async () => {
    const res = await request(app)
      .patch(`/api/auth/users/${userId}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' });
    expect(res.status).toBe(204);

    const updated = await User.findById(userId);
    expect(updated.status).toBe('inactive');
  });
});
