// tests/unit/roleMiddleware.test.js
import { describe, it, expect, vi } from 'vitest';
import roleMiddleware from '../../middleware/roleMiddleware.js';

describe('roleMiddleware', () => {
  it('разрешает доступ, если роль совпадает', () => {
    const req = { userRole: 'admin' };
    const res = {};
    const next = vi.fn();

    const middleware = roleMiddleware('admin');
    middleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  it('отклоняет доступ при несовпадающей роли', () => {
    const req = { userRole: 'user' };
    const res = { status: vi.fn(() => res), json: vi.fn() };
    const next = vi.fn();

    const middleware = roleMiddleware('admin');
    middleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith({ error: 'Access denied for this role' });
  });
});
