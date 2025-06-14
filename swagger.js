const swaggerJsdoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const pkg = require('./package.json');

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth API Demo',
      version: pkg.version,
      description: 'Документация учебного проекта авторизации'
    },
    servers: [{ url: 'http://localhost:' + process.env.PORT }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer' }
      }
    },
    security: [{ bearerAuth: [] }]
  },
  apis: ['./routes/auth.js']
};

module.exports = {
  swaggerUi,
  specs: swaggerJsdoc(options)
};
