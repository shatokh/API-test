// server.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import { swaggerUi, specs } from './swagger.js';
import { getAppConfig } from './utils/appConfig.js';
import { logger } from './utils/logger.js';

const app = express();

const swaggerUiOptions = {
  customSiteTitle: 'Учебный Auth API',
  customCss: `
      .swagger-ui .topbar { background-color: #2c3e50; }
      .swagger-ui .topbar a { color: #ecf0f1; font-weight: bold; font-size: 1.5em; }
    `,
  swaggerOptions: {
    defaultModelsExpandDepth: -1,
    docExpansion: 'list',
    displayRequestDuration: true,
  },
};

const configureMiddleware = (appInstance) => {
  // 🌐 Middleware
  appInstance.use(express.json());
  appInstance.use(morgan('dev'));
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
  // ✅ Healthcheck endpoint for Docker health checks
  appInstance.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
  });
};

const registerMongoEventHandlers = () => {
  // 🧩 Debug Mongo
  mongoose.connection.on('error', (err) =>
    logger.error('❗ Ошибка MongoDB во время работы:', err.message),
  );
  mongoose.connection.on('disconnected', () =>
    logger.warn('⚠️ MongoDB отключена'),
  );
};

const registerSigintHandler = () => {
  // 🧹 Завершение процесса
  process.on('SIGINT', async () => {
    await mongoose.connection.close();
    logger.info('🧼 Соединение с MongoDB закрыто по SIGINT');
    process.exit(0);
  });
};

const startServer = async ({ MONGO_URI, PORT }) => {
  try {
    await mongoose.connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 });
    logger.info('✅ Подключение к MongoDB установлено');
    app.listen(PORT, () => {
      logger.info(`🚀 Сервер запущен на http://localhost:${PORT}`);
    });
  } catch (err) {
    logger.error('❌ Ошибка подключения к MongoDB:', err.message);
    process.exit(1);
  }
};

configureMiddleware(app);
configureRoutes(app);
configureSwagger(app);
configureHealthcheck(app);
registerMongoEventHandlers();
registerSigintHandler();

const appConfig = getAppConfig();

// 🔌 Подключаемся и запускаем только вне тестов
if (process.env.NODE_ENV !== 'test') {
  startServer(appConfig);
}

export default app;
