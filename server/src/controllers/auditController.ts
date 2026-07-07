import { Request, Response } from 'express';
import * as auditService from '../services/auditService';

export async function list(req: Request, res: Response) {
  const { limit = '50', offset = '0', userId, action, entityType } = req.query as any;
  const logs = await auditService.listLogs({ limit: Number(limit), offset: Number(offset), userId, action, entityType });
  res.json({ logs });
}
