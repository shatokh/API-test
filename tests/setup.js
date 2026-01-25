// tests/setup.js
import fs from 'fs';
import dotenv from 'dotenv';
import User from '../models/User.js';

process.env.NODE_ENV = 'test';

// Определяем файл окружения: .env.test для тестов или .env для локали
const envFile = fs.existsSync('.env.test') ? '.env.test' : '.env';
dotenv.config({ path: envFile });

afterEach(async () => {
  await User.deleteMany({});
});
