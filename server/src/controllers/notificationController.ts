import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';

export async function list(req: Request, res: Response) {
  const user = (req as any).user;
  const { limit = '50', offset = '0' } = req.query as any;
  const notifications = await notificationService.listNotifications(
    user?.userId,
    Number(limit),
    Number(offset)
  );
  res.json({ notifications });
}

export async function markRead(req: Request, res: Response) {
  const user = (req as any).user;
  const { id } = req.params;
  await notificationService.markAsRead(id, user?.userId);
  res.json({ success: true });
}

export async function markAllRead(req: Request, res: Response) {
  const user = (req as any).user;
  await notificationService.markAllAsRead(user?.userId);
  res.json({ success: true });
}
