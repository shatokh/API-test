import { cleanEnv, port, str } from 'envalid';
import { logger } from './logger.js';

export const validateEnv = () => {
  try {
    return cleanEnv(
      process.env,
      {
        PORT: port({ default: 3000 }),
        MONGO_URI: str(),
        JWT_SECRET: str({ default: '' }),
      },
      { strict: false },
    );
  } catch (error) {
    logger.error('❌ Ошибка конфигурации окружения', {
      error: error instanceof Error ? error.message : String(error),
      details: error?.errors?.map((envError) => envError.message),
    });
    throw error;
  }
};
