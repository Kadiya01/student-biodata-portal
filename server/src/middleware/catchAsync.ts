import { Request, Response, NextFunction } from 'express';

export function catchAsync(fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
}

export function parsePagination(query: any) {
  const limit = Math.min(Math.max(parseInt(query.limit) || 50, 1), 200);
  const offset = Math.max(parseInt(query.offset) || 0, 0);
  const sortBy = query.sortBy || 'createdAt';
  const sortOrder = query.sortOrder === 'asc' ? 'asc' : 'desc';
  return { limit, offset, sortBy, sortOrder };
}
