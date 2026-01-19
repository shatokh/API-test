// swagger.js
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const pkg = require('./package.json');

const API_VERSION = 'v1';

const options = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Auth API Demo',
      version: `${API_VERSION} (${pkg.version})`,
      description: 'Документация учебного проекта авторизации',
    },
    servers: [{ url: `http://localhost:${process.env.PORT || 3000}` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer' },
      },
    },
    security: [{ bearerAuth: [] }],
    tags: [
      {
        name: 'Auth',
        description: `Версия API: ${API_VERSION}`,
      },
    ],
  },
  apis: ['./routes/auth.js'],
};

const specs = swaggerJsdoc(options);
export { swaggerUi, specs };
