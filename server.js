require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const morgan = require('morgan');
const authRoutes = require('./routes/auth');
const { swaggerUi, specs } = require('./swagger');

const app = express();
app.use(express.json());
app.use(morgan('dev'));
app.use('/api/auth', authRoutes);
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

mongoose.connect(process.env.MONGO_URI)
  .then(() => app.listen(process.env.PORT, () => console.log(`Server 🌐 on port ${process.env.PORT}`)))
  .catch(err => console.error('DB error:', err));
