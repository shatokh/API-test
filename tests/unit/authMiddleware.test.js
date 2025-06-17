// tests/unit/authMiddleware.test.js
import { describe, it, expect, vi, beforeAll } from 'vitest';

// мокируем jsonwebtoken до импорта
vi.mock('jsonwebtoken', () => ({
  default: {
    verify: vi.fn()
  }
}));

import jwt from 'jsonwebtoken';
import authMiddleware from '../../middleware/authMiddleware.js';

beforeAll(() => {
  process.env.JWT_SECRET = 'testsecret';
});

const createRes = () => {
  const res = {};
  res.status = vi.fn(() => res);
  res.json   = vi.fn();
  return res;
};

describe('authMiddleware', () => {
  it('ставит req.userId и req.userRole при валидном токене', () => {
    jwt.verify.mockReturnValue({ userId: '123', role: 'admin' });

    const req = { headers: { authorization: 'Bearer foo' } };
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(req.userId).toBe('123');
    expect(req.userRole).toBe('admin');
    expect(next).toHaveBeenCalled();
  });

  it('даёт 401, если нет заголовка Authorization', () => {
    const req = { headers: {} };
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Unauthorized' });
  });

  it('даёт 401 при некорректном токене', () => {
    jwt.verify.mockImplementation(() => { throw new Error(); });

    const req = { headers: { authorization: 'Bearer bad' } };
    const res = createRes();
    const next = vi.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Invalid token' });
  });
});