import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';
import config from '../config';
import { captureException } from '../config/sentry';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err?.message || 'Unhandled error', { stack: err?.stack });

  if (err && config.nodeEnv === 'production') {
    captureException(err, {
      url: _req.url,
      method: _req.method,
      ip: _req.ip,
    });
  }

  const status = err?.status || 500;
  const message = status === 500 && config.nodeEnv === 'production'
    ? 'Internal Server Error'
    : err?.message || 'Internal Server Error';
  res.status(status).json({ error: message });
}
