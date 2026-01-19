import { logger } from './logger.js';
import { validateEnv } from './env.js';

export const getAppConfig = () => {
  const env = validateEnv();

  if (!env.JWT_SECRET) {
    logger.warn(
      '⚠️ Внимание: JWT_SECRET не определён. Не рекомендуется запускать сервер без секрета!',
    );
  }

  return {
    PORT: env.PORT,
    MONGO_URI: env.MONGO_URI,
    JWT_SECRET: env.JWT_SECRET,
  };
};
