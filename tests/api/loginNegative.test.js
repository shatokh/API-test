// tests/api/loginNegative.test.js
import app from '../../server.js';
import { loginUser, registerUser } from '../helpers/authTestUtils.js';

describe('POST /api/auth/login (negative)', () => {
  it('400 при пустом теле', async () => {
    const res = await loginUser(app, {});
    expect(res.status).toBe(400);
  });

  it('400 при некорректном email', async () => {
    const res = await loginUser(app, {
      email: 'bad-email',
      password: '123456',
    });
    expect(res.status).toBe(400);
  });

  it('401 при неверном пароле', async () => {
    await registerUser(app, {
      email: 'neg@example.com',
      password: 'secure123',
    });

    const res = await loginUser(app, {
      email: 'neg@example.com',
      password: 'wrongpwd',
    });
    expect(res.status).toBe(401);
  });
});
