// scripts/initAdmin.js
import 'dotenv/config';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import User from '../models/User.js';

(async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const email = 'admin@test.com';
    const password = 'admin123';

    const exists = await User.findOne({ email });
    if (exists) {
      console.log('✅ Админ уже существует:', email);
      process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    const admin = await User.create({
      email,
      password: hash,
      role: 'admin'
    });

    console.log('🎉 Админ создан:', admin.email);
    process.exit(0);
  } catch (err) {
    console.error('❌ Ошибка при создании админа:', err.message);
    process.exit(1);
  }
})();