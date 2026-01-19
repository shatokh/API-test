import { logger } from './logger.js';

export const getAppConfig = () => {
  const PORT = process.env.PORT || 3000;
  const MONGO_URI = process.env.MONGO_URI;
  const JWT_SECRET = process.env.JWT_SECRET;

  if (!MONGO_URI) {
    logger.error('❌ Ошибка: переменная MONGO_URI не определена в .env');
    process.exit(1);
  }

  if (!JWT_SECRET) {
    logger.warn(
      '⚠️ Внимание: JWT_SECRET не определён. Не рекомендуется запускать сервер без секрета!',
    );
  }

  return { PORT, MONGO_URI, JWT_SECRET };
};
