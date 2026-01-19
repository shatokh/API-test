// tests/api/statusNegative.test.js
import request from 'supertest';
import app from '../../server.js';
import {
  createAdminToken,
  createAdminUser,
  createPassword,
  loginUser,
  registerUser,
} from '../helpers/authTestUtils.js';

describe('PATCH /api/auth/users/:id/status (negative)', () => {
  let userId;
  let adminToken;
  let userPassword;

  beforeEach(async () => {
    // создаём пользователя перед каждым тестом
    userPassword = createPassword();
    const reg = await registerUser(app, {
      email: 'statusneg@example.com',
      password: userPassword,
    });
    userId = reg.body.userId;

    // создаём админа перед каждым тестом
    const { token } = await createAdminToken({
      email: 'adminStatus@test.com',
      password: createPassword(),
    });
    adminToken = token;
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
    const userLogin = await loginUser(app, {
      email: 'statusneg@example.com',
      password: userPassword,
    });
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

  it('403 при попытке менять статус админа', async () => {
    const targetAdmin = await createAdminUser({
      email: 'target-admin@test.com',
      password: createPassword(),
    });

    const res = await request(app)
      .patch(`/api/auth/users/${targetAdmin._id}/status`)
      .set('Authorization', `Bearer ${adminToken}`)
      .send({ status: 'inactive' });
    expect(res.status).toBe(403);
  });
});
