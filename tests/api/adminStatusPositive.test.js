// tests/api/adminStatusPositive.test.js
import request from 'supertest';
import app from '../../server.js';
import User from '../../models/User.js';
import {
  createAdminToken,
  createPassword,
  registerUser,
} from '../helpers/authTestUtils.js';

describe('PATCH /api/auth/users/:id/status (admin positive)', () => {
  let userId;
  let adminToken;

  beforeAll(async () => {
    // создаём тестового пользователя
    const password = createPassword();
    const reg = await registerUser(app, {
      email: 'tochange@example.com',
      password,
    });
    userId = reg.body.userId;

    // создаём админа вручную в БД
    const { token } = await createAdminToken({
      email: 'admin2@test.com',
      password: createPassword(),
    });
    adminToken = token;
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
