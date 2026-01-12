// tests/api/registerLoginMe.test.js
import request from 'supertest';
import app from '../../server.js';
import {
  authHeader,
  createPassword,
  loginUser,
  registerUser,
} from '../helpers/authTestUtils.js';

describe('Полный happy path: регистрация -> логин -> профиль пользователя', () => {
  it('успешно регистрирует, логинится и получает профиль', async () => {
    // Шаг 1: регистрация
    const password = createPassword();

    const regRes = await registerUser(app, {
      email: 'happy@example.com',
      password,
    });
    expect(regRes.status).toBe(201);
    const userId = regRes.body.userId;

    // Шаг 2: логин
    const loginRes = await loginUser(app, {
      email: 'happy@example.com',
      password,
    });
    expect(loginRes.status).toBe(200);
    const token = loginRes.body.token;

    // Шаг 3: получение профиля
    const meRes = await request(app).get('/api/auth/me').set(authHeader(token));
    expect(meRes.status).toBe(200);
    expect(meRes.body).toMatchObject({
      email: 'happy@example.com',
      role: 'user',
      _id: userId,
    });
  });
});
