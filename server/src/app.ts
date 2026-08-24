import cors from 'cors';
import express from 'express';
import { environment } from './config/environment.js';
import { errorHandler } from './middleware/error-handler.js';
import { notFound } from './middleware/not-found.js';
import { apiRouter } from './routes/index.js';

export const createApp = () => {
  const app = express();

  app.disable('x-powered-by');
  app.use(
    cors({
      origin: environment.CLIENT_URL,
    }),
  );
  app.use(express.json({ limit: '100kb' }));

  app.use('/api', apiRouter);
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
