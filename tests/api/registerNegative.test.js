// tests/api/registerNegative.test.js
import app from '../../server.js';
import { registerUser } from '../helpers/authTestUtils.js';

describe('POST /api/auth/register (negative cases)', () => {
  it('возвращает 400 при пустом теле', async () => {
    const res = await registerUser(app, {});
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при некорректном email', async () => {
    const res = await registerUser(app, {
      email: 'not-an-email',
      password: 'password123',
    });
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при коротком пароле', async () => {
    const res = await registerUser(app, {
      email: 'len@example.com',
      password: '123',
    });
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при слишком длинном пароле', async () => {
    const longPwd = 'a'.repeat(101);
    const res = await registerUser(app, {
      email: 'len2@example.com',
      password: longPwd,
    });
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при дублировании email', async () => {
    await registerUser(app, {
      email: 'dup@example.com',
      password: 'password123',
    });

    const dup = await registerUser(app, {
      email: 'dup@example.com',
      password: 'password123',
    });
    expect(dup.status).toBe(400);
  });
});
