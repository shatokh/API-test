// scripts/initAdmin.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';
import { logger } from '../utils/logger.js';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'admin@test.com';
    const password = 'admin123';

    const exists = await User.findOne({ email });
    if (exists) {
      logger.info('✅ Админ уже существует:', email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    const admin = await User.create({
      email,
      password: hash,
      role: 'admin',
    });

    logger.info('🎉 Админ создан:', admin.email);
    process.exit(0);
  } catch (err) {
    logger.error('❌ Ошибка при создании админа:', err.message);
    process.exit(1);
  }
})();
