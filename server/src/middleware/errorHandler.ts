import { Request, Response, NextFunction } from 'express';
import logger from '../utils/logger';

export function notFound(req: Request, res: Response) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler(err: any, _req: Request, res: Response, _next: NextFunction) {
  logger.error(err?.message || 'Unhandled error', { stack: err?.stack });
  const status = err?.status || 500;
  res.status(status).json({ error: err?.message || 'Internal Server Error' });
}
