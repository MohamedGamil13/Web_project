import app from './app.js';
import { env } from './config/env.js';
import { connectDb, disconnectDb } from './config/db.js';

async function bootstrap() {
  try {
    await connectDb();
    console.log(`[db] connected to ${env.mongoUri}`);

    const server = app.listen(env.port, () => {
      console.log(`[server] listening on http://localhost:${env.port}`);
      console.log(`[server] api at http://localhost:${env.port}/api/v1`);
      console.log(`[server] docs at http://localhost:${env.port}/api/docs`);
    });

    const shutdown = async (signal) => {
      console.log(`\n[server] received ${signal}, shutting down`);
      server.close(async () => {
        await disconnectDb();
        process.exit(0);
      });
    };

    process.on('SIGINT', () => shutdown('SIGINT'));
    process.on('SIGTERM', () => shutdown('SIGTERM'));
  } catch (error) {
    console.error('[server] failed to start:', error.message);
    process.exit(1);
  }
}

bootstrap();
