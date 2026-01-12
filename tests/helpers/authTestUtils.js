import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../../models/User.js';

export const registerUser = (app, payload) =>
  request(app).post('/api/auth/register').send(payload);

export const loginUser = (app, payload) =>
  request(app).post('/api/auth/login').send(payload);

export const createAdminUser = async (
  overrides = { email: 'admin@test.com', password: 'admin123' },
) => {
  const { email, password } = overrides;
  const hash = await bcrypt.hash(password, 10);
  return User.create({ email, password: hash, role: 'admin' });
};

export const createAdminToken = async (overrides) => {
  const admin = await createAdminUser(overrides);
  const token = jwt.sign(
    { userId: admin._id, role: 'admin' },
    process.env.JWT_SECRET,
  );
  return { admin, token };
};

export const authHeader = (token) => ({
  Authorization: `Bearer ${token}`,
});
