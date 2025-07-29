// tests/setup.js
import fs from 'fs';
import mongoose from 'mongoose';
import { MongoMemoryServer } from 'mongodb-memory-server';
import dotenv from 'dotenv';

// Определяем файл окружения: .env.test для тестов или .env для локали
const envFile = fs.existsSync('.env.test') ? '.env.test' : '.env';
dotenv.config({ path: envFile });

let mongoServer;

beforeAll(async () => {
  // Увеличиваем таймаут для запуска in-memory MongoDB
}, 20000);

beforeAll(async () => {
  // Создаём и запускаем in-memory MongoDB только один раз
  mongoServer = await MongoMemoryServer.create();
  const uri = mongoServer.getUri();
  try {
    if (mongoose.connection.readyState === 0) {
      // Переназначаем MONGO_URI для сервера
      process.env.MONGO_URI = uri;
      // Подключаемся к MongoDB через Mongoose
      await mongoose.connect(uri, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      });
    }
  } catch (error) {
    console.error('Mongoose connection error:', error);
    throw error;
  }
});

afterEach(async () => {
  // Очищаем все коллекции между тестами параллельно
  const { collections } = mongoose.connection;
  await Promise.all(
    Object.values(collections).map((col) => col.deleteMany({})),
  );
});

afterAll(async () => {
  // Отключаем Mongoose и останавливаем in-memory сервер
  await mongoose.disconnect();
  if (mongoServer) {
    await mongoServer.stop();
  }
});
