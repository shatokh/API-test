// tests/api/registerNegative.test.js
import app from '../../server.js';
import {
  createLongPassword,
  createPassword,
  createShortPassword,
  registerUser,
} from '../helpers/authTestUtils.js';

describe('POST /api/auth/register (negative cases)', () => {
  it('возвращает 400 при пустом теле', async () => {
    const res = await registerUser(app, {});
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при некорректном email', async () => {
    const res = await registerUser(app, {
      email: 'not-an-email',
      password: createPassword(),
    });
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при коротком пароле', async () => {
    const res = await registerUser(app, {
      email: 'len@example.com',
      password: createShortPassword(),
    });
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при слишком длинном пароле', async () => {
    const res = await registerUser(app, {
      email: 'len2@example.com',
      password: createLongPassword(),
    });
    expect(res.status).toBe(400);
  });

  it('возвращает 400 при дублировании email', async () => {
    const password = createPassword();
    await registerUser(app, {
      email: 'dup@example.com',
      password,
    });

    const dup = await registerUser(app, {
      email: 'dup@example.com',
      password,
    });
    expect(dup.status).toBe(400);
  });
});
