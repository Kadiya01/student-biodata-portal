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

app.use(helmet({
  contentSecurityPolicy: process.env.NODE_ENV === 'production' ? {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "res.cloudinary.com"],
      connectSrc: ["'self'", process.env.CLIENT_URL || 'http://localhost:5173'],
      fontSrc: ["'self'"],
      objectSrc: ["'none'"],
      frameSrc: ["'none'"],
    },
  } : false,
}));

const allowedOrigins = [
  process.env.CLIENT_URL,
  'http://localhost:5173',
  'http://localhost:3000',
].filter(Boolean) as string[];

app.use(cors({
  origin: allowedOrigins.length > 0 ? allowedOrigins : (process.env.NODE_ENV === 'production' ? false : '*'),
  credentials: true,
}));
app.use(express.json({ limit: '10mb' }));
app.use(sanitize);
app.use(requestLogger);

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 200,
  message: { error: 'Too many requests, please try again later' },
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

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

// Initialize background job queues (graceful if Redis unavailable)
if (process.env.NODE_ENV !== 'test') {
  initializeJobQueues();
}

export default app;
