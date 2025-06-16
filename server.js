// server.js
require('dotenv').config(); // загружаем .env

const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const { swaggerUi, specs } = require('./swagger');

const app = express();

// 🌐 Middleware
app.use(express.json());
app.use(morgan('dev'));

// 🔐 Роуты авторизации
app.use('/api/auth', authRoutes);

// 📘 Swagger документация
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(specs, {
  customSiteTitle: 'Учебный Auth API',
  customCss: `
    .swagger-ui .topbar { background-color: #2c3e50; }
    .swagger-ui .topbar a { color: #ecf0f1; font-weight: bold; font-size: 1.5em; }
  `,
  swaggerOptions: {
    defaultModelsExpandDepth: -1,
    docExpansion: 'list',
    displayRequestDuration: true
  }
}));

// ⚙️ Конфигурация из .env
const PORT = process.env.PORT || 3000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;

if (!MONGO_URI) {
  console.error('❌ Ошибка: переменная MONGO_URI не определена в .env');
  process.exit(1);
}

if (!JWT_SECRET) {
  console.warn('⚠️ Внимание: JWT_SECRET не определён. Не рекомендуется запускать сервер без секрета!');
}

// 🔌 Подключение к MongoDB и запуск сервера
mongoose.connect(MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 5000,
})
  .then(() => {
    console.log('✅ Подключение к MongoDB установлено');
    app.listen(PORT, () => {
      console.log(`🚀 Сервер запущен на http://localhost:${PORT}`);
    });
  })
  .catch(err => {
    console.error('❌ Ошибка подключения к MongoDB:', err.message);
    process.exit(1);
  });

// 🧩 Runtime отладка
mongoose.connection.on('error', err => {
  console.error('❗ Ошибка MongoDB во время работы:', err.message);
});

mongoose.connection.on('disconnected', () => {
  console.warn('⚠️ MongoDB отключена');
});

// 🧹 Завершение процесса
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🧼 Соединение с MongoDB закрыто по SIGINT');
  process.exit(0);
});
