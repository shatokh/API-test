// tests/api/userCannotChangeStatus.test.js
import request from 'supertest';
import app from '../../server.js';

describe('PATCH /api/auth/users/:id/status (user negative)', () => {
  it('возвращает 403 для обычного пользователя', async () => {
    // регистрируем пользователя и логинимся
    const reg = await request(app)
      .post('/api/auth/register')
      .send({ email: 'normal@example.com', password: 'pwd12345' });
    const login = await request(app)
      .post('/api/auth/login')
      .send({ email: 'normal@example.com', password: 'pwd12345' });
    const token = login.body.token;

    const res = await request(app)
      .patch(`/api/auth/users/${reg.body.userId}/status`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'active' });
    expect(res.status).toBe(403);
    expect(res.body).toHaveProperty('error', 'Access denied for this role');
  });
});