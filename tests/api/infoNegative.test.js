// tests/api/infoNegative.test.js
import request from 'supertest';
import app from '../../server.js';

describe('GET /api/auth/me (negative)', () => {
  it('401 без токена', async () => {
    const res = await request(app).get('/api/auth/me');
    expect(res.status).toBe(401);
  });

  it('401 при невалидном токене', async () => {
    const res = await request(app)
      .get('/api/auth/me')
      .set('Authorization', 'Bearer invalid');
    expect(res.status).toBe(401);
  });
});
