// server.js
import 'dotenv/config';
import express from 'express';
import authRoutes from './routes/auth.js';
import { swaggerUi, specs } from './swagger.js';
import { getAppConfig } from './utils/appConfig.js';
import { logger } from './utils/logger.js';
import {
  connectToMongo,
  disconnectFromMongo,
  registerMongoEventHandlers,
  registerTerminationHandlers,
} from './utils/mongoLifecycle.js';
import { swaggerUiOptions } from './utils/swaggerUiOptions.js';
import { requestIdMiddleware } from './middleware/requestId.js';
import { requestLogger } from './middleware/requestLogger.js';
import mongoose from 'mongoose';

const app = express();
let httpServer;

const configureMiddleware = (appInstance) => {
  // 🌐 Middleware
  appInstance.use(express.json());
  appInstance.use(requestIdMiddleware);
  appInstance.use(requestLogger);
};

const configureRoutes = (appInstance) => {
  // 🔐 Роуты авторизации
  appInstance.use('/api/auth', authRoutes);
};

const configureSwagger = (appInstance) => {
  // 📘 Swagger документация
  appInstance.use(
    '/api-docs',
    swaggerUi.serve,
    swaggerUi.setup(specs, swaggerUiOptions),
  );
};

const configureHealthcheck = (appInstance) => {
  // ✅ Liveness probe
  appInstance.get('/live', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });

  // ✅ Readiness probe
  appInstance.get('/ready', (req, res) => {
    const isReady = mongoose.connection.readyState === 1;
    res.status(isReady ? 200 : 503).json({
      status: isReady ? 'ready' : 'not_ready',
    });
  });
};

const shutdown = async (signal) => {
  logger.info('🛑 Получен сигнал завершения', { signal });

  if (httpServer) {
    await new Promise((resolve) => httpServer.close(resolve));
  }

  await disconnectFromMongo(`signal:${signal}`);
};

const startServer = async ({ MONGO_URI, PORT }) => {
  try {
    await connectToMongo(MONGO_URI);
    httpServer = app.listen(PORT, () => {
      logger.info(`🚀 Сервер запущен на http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('❌ Ошибка подключения к MongoDB', {
      error: err instanceof Error ? err.message : String(err),
    });
    throw err;
  }
};

configureMiddleware(app);
configureRoutes(app);
configureSwagger(app);
configureHealthcheck(app);
registerMongoEventHandlers();
registerTerminationHandlers(shutdown);

const appConfig = getAppConfig();

// 🔌 Подключаемся и запускаем только вне тестов
if (process.env.NODE_ENV !== 'test') {
  startServer(appConfig);
}

export default app;
