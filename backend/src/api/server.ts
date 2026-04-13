import express from 'express';
import cors from 'cors';
import { env } from '../config/env';
import { router } from './routes';

export function createApp() {
  const app = express();

  app.use(cors({ origin: env.CORS_ORIGIN }));
  app.use(express.json());

  app.use('/api', router);

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok' });
  });

  return app;
}
