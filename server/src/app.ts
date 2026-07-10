import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import dotenv from 'dotenv';
import routes from './routes';
import { notFound, errorHandler } from './middleware/errorHandler';
import { sanitize } from './middleware/sanitize';
import { requestLogger } from './middleware/requestLogger';
import { initializeJobQueues } from './jobs';
import { initSentry } from './config/sentry';
import logger from './utils/logger';

dotenv.config();

initSentry();

const app = express();

app.use(helmet());

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean);

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : '*',
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(sanitize);
app.use(requestLogger);

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  message: { error: 'Too many attempts, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});

const startTime = Date.now();
let requestCount = 0;

app.use((_req, _res, next) => {
  requestCount++;
  next();
});

app.get('/', (_req, res) => res.send('Student Bio-Data API'));

app.get('/metrics', (_req, res) => {
  res.json({
    uptime: Math.floor((Date.now() - startTime) / 1000),
    requests: requestCount,
    timestamp: new Date().toISOString(),
    memory: process.memoryUsage(),
  });
});

app.use('/api/v1/auth/login', authLimiter);
app.use('/api/v1/auth/register', authLimiter);
app.use('/api/v1', routes);

app.use(notFound);
app.use(errorHandler);

if (process.env.REDIS_HOST || process.env.NODE_ENV === 'production') {
  try {
    initializeJobQueues();
    logger.info('Background job queues started');
  } catch (err) {
    logger.error('Failed to initialize job queues', { error: err instanceof Error ? err.message : String(err) });
  }
}

export default app;
