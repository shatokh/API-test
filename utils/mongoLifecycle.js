import mongoose from 'mongoose';
import { logger } from './logger.js';

export const connectToMongo = async (mongoUri) => {
  await mongoose.connect(mongoUri, { serverSelectionTimeoutMS: 5000 });
  logger.info('✅ Подключение к MongoDB установлено');
};

export const disconnectFromMongo = async (reason) => {
  if (mongoose.connection.readyState === 0) {
    return;
  }

  await mongoose.connection.close();
  logger.info('🧼 Соединение с MongoDB закрыто', { reason });
};

export const registerMongoEventHandlers = () => {
  mongoose.connection.on('error', (err) =>
    logger.error('❗ Ошибка MongoDB во время работы', { error: err.message }),
  );
  mongoose.connection.on('disconnected', () =>
    logger.warn('⚠️ MongoDB отключена'),
  );
};

export const registerTerminationHandlers = (shutdown) => {
  ['SIGINT', 'SIGTERM'].forEach((signal) => {
    process.on(signal, () => shutdown(signal));
  });
};
