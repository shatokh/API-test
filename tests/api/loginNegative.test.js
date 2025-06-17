// tests/api/loginNegative.test.js
import request from 'supertest';
import app from '../../server.js';

describe('POST /api/auth/login (negative)', () => {
  it('возвращает 400 при пустом теле', async () => {
    const res = await request(app).post('/api/auth/login').send({});
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при некорректном email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'bad-email', password: '123456' });
    expect(res.status).toBe(400);
  });

  it('возвращает 401 при неверном пароле', async () => {
    // предварительно регистрируем пользователя
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'neg@example.com', password: 'secure123' });

    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'neg@example.com', password: 'wrongpwd' });
    expect(res.status).toBe(401);
    expect(res.body).toHaveProperty('error', 'Invalid credentials');
  });
});
