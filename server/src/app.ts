import cors from 'cors';
import express from 'express';
import rateLimit from 'express-rate-limit';
import helmet from 'helmet';
import { environment } from './config/environment.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { apiRouter } from './routes/index.js';

export const createApp = () => {
  const app = express();

  app.set('trust proxy', environment.TRUST_PROXY);
  app.disable('x-powered-by');
  app.use(helmet());
  app.use(
    cors({
      origin: environment.CLIENT_URL,
    }),
  );
  app.use(express.json({ limit: '1500kb' }));
  app.use(
    '/api',
    rateLimit({
      windowMs: 15 * 60 * 1000,
      limit: 100,
      standardHeaders: 'draft-8',
      legacyHeaders: false,
    }),
  );

  app.use('/api', apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
