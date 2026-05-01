import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env, isProd, isTest } from '../config/env.js';

export function applySecurity(app) {
  app.use(
    helmet({
      // Swagger UI uses inline assets/scripts. Disable CSP in non-production
      // so /api/docs renders during local development.
      contentSecurityPolicy: isProd,
    })
  );
  const allowedOrigins = new Set([
    env.clientUrl,
    'http://localhost:5173',
    'http://127.0.0.1:5173',
    'http://localhost:4173',
    'http://127.0.0.1:4173',
  ]);

  app.use(
    cors({
      origin(origin, callback) {
        // Allow server-to-server and direct browser navigation with no Origin header.
        if (!origin) return callback(null, true);
        if (!isProd && allowedOrigins.has(origin)) return callback(null, true);
        if (isProd && origin === env.clientUrl) return callback(null, true);
        return callback(null, false);
      },
      credentials: true,
      optionsSuccessStatus: 200,
    })
  );
  if (!isTest) {
    app.use(morgan(isProd ? 'combined' : 'dev'));
  }
}
