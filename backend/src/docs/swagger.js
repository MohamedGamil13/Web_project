import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import { env } from '../config/env.js';

const spec = swaggerJsdoc({
  definition: {
    openapi: '3.0.3',
    info: {
      title: 'Hotel Booking API',
      version: '1.0.0',
      description: 'Academic hotel booking project API. See /docs/API_PLAN.md for the contract.',
    },
    servers: [{ url: `http://localhost:${env.port}/api/v1` }],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
  },
  apis: ['src/routes/**/*.js', 'src/controllers/**/*.js'],
});

export function mountSwagger(app, basePath = '/api/docs') {
  app.use(basePath, swaggerUi.serve, swaggerUi.setup(spec));
  app.get(`${basePath}.json`, (_req, res) => res.json(spec));
}
