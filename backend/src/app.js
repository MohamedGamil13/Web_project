import express from 'express';
import { applySecurity } from './middleware/security.js';
import { errorHandler } from './middleware/errorHandler.js';
import { notFound } from './middleware/notFound.js';
import { mountSwagger } from './docs/swagger.js';
import apiRouter from './routes/index.js';

const app = express();

applySecurity(app);
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

mountSwagger(app, '/api/docs');

app.use('/api', apiRouter);
app.use('/health', (_req, res) => res.redirect('/api/v1/health'));
app.use('/api/health', (_req, res) => res.redirect('/api/v1/health'));

app.use(notFound);
app.use(errorHandler);

export default app;
