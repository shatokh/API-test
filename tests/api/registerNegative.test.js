// tests/api/registerNegative.test.js
import request from 'supertest';
import app from '../../server.js';

describe('POST /api/auth/register (negative cases)', () => {
  it('возвращает 400 при пустом теле', async () => {
    const res = await request(app).post('/api/auth/register').send({});
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при некорректном email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'not-an-email', password: 'password123' });
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при коротком пароле', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'len@example.com', password: '123' });
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при слишком длинном пароле', async () => {
    const longPwd = 'a'.repeat(101);
    const res = await request(app)
      .post('/api/auth/register')
      .send({ email: 'len2@example.com', password: longPwd });
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при дублировании email', async () => {
    await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password123' });

    const dup = await request(app)
      .post('/api/auth/register')
      .send({ email: 'dup@example.com', password: 'password123' });
    expect(dup.status).toBe(400);
  });
});
