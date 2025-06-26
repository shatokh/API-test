// server.js
import 'dotenv/config';
import express from 'express';
import mongoose from 'mongoose';
import morgan from 'morgan';
import authRoutes from './routes/auth.js';
import { swaggerUi, specs } from './swagger.js';
import { metricsMiddleware, metricsEndpoint } from './metrics/index.js';

const app = express();

// ─── Prometheus metrics & healthcheck ───────────────────────────────────────
app.use(metricsMiddleware);
app.get('/metrics', metricsEndpoint);
app.get('/health', (_req, res) => res.sendStatus(200));

// ─── Основные middleware ────────────────────────────────────────────────────
app.use(express.json());
app.use(morgan('dev'));

// ─── Роуты авторизации ───────────────────────────────────────────────────────
app.use('/api/auth', authRoutes);

// ─── Swagger документация ───────────────────────────────────────────────────
app.use(
  '/api-docs',
  swaggerUi.serve,
  swaggerUi.setup(specs, {
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
  }),
);

// ─── Конфигурация ───────────────────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
  console.error('❌ Ошибка: переменная MONGO_URI не определена в .env');
  process.exit(1);
}
if (!JWT_SECRET) {
  console.warn(
    '⚠️ Внимание: JWT_SECRET не определён. Не рекомендуется запускать сервер без секрета!',
  );
}

// ─── Debug MongoDB ──────────────────────────────────────────────────────────
mongoose.connection.on('error', (err) =>
  console.error('❗ Ошибка MongoDB во время работы:', err.message),
);
mongoose.connection.on('disconnected', () =>
  console.warn('⚠️ MongoDB отключена'),
);

// ─── Graceful shutdown ──────────────────────────────────────────────────────
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🧼 Соединение с MongoDB закрыто по SIGINT');
  process.exit(0);
});

// ─── Подключаемся и запускаем только вне тестов ───────────────────────────────
if (process.env.NODE_ENV !== 'test') {
  mongoose
    .connect(MONGO_URI, { serverSelectionTimeoutMS: 5000 })
    .then(() => {
      console.log('✅ Подключение к MongoDB установлено');
      app.listen(PORT, () => {
        console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
      });
    })
    .catch((err) => {
      console.error('❌ Ошибка подключения к MongoDB:', err.message);
      process.exit(1);
    });
}

export default app;
