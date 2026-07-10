import { Request, Response } from 'express';
import * as auditService from '../services/auditService';
import { catchAsync } from '../middleware/catchAsync';

export const list = catchAsync(async (req: Request, res: Response) => {
  const { limit = '50', offset = '0', userId, action, entityType } = req.query as any;
  const result = await auditService.listLogs({
    limit: Number(limit), offset: Number(offset), userId, action, entityType
  });
  res.json(result);
});
