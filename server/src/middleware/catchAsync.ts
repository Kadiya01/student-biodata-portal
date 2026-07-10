import { Request, Response, NextFunction } from 'express';

export function catchAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export function parsePagination(query: Request['query']) {
  const limit = Math.min(Math.max(parseInt(query.limit as string, 10) || 50, 1), 200);
  const offset = Math.max(parseInt(query.offset as string, 10) || 0, 0);
  const sortBy = (query.sortBy as string) || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  return { limit, offset, sortBy, sortOrder };
}
