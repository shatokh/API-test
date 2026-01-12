import request from 'supertest';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { randomBytes } from 'crypto';
import User from '../../models/User.js';

const buildPassword = (length = 12) => {
  const raw = randomBytes(Math.ceil(length / 2)).toString('hex');
  return raw.slice(0, length);
};

export const registerUser = (app, payload) =>
  request(app).post('/api/auth/register').send(payload);

export const loginUser = (app, payload) =>
  request(app).post('/api/auth/login').send(payload);

export const createPassword = (length) => buildPassword(length);

export const createShortPassword = () => buildPassword(3);

export const createLongPassword = () => buildPassword(101);

export const createAdminUser = async (
  overrides = { email: 'admin@test.com', password: buildPassword() },
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
