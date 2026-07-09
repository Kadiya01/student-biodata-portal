import { Request, Response } from 'express';
import * as notificationService from '../services/notificationService';
import { catchAsync } from '../middleware/catchAsync';

export const list = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { limit = '50', offset = '0' } = req.query as any;
  const notifications = await notificationService.listNotifications(
    user?.userId, Number(limit), Number(offset)
  );
  res.json({ notifications });
});

export const markRead = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  const { id } = req.params;
  await notificationService.markAsRead(id, user?.userId);
  res.json({ success: true });
});

export const markAllRead = catchAsync(async (req: Request, res: Response) => {
  const user = (req as any).user;
  await notificationService.markAllAsRead(user?.userId);
  res.json({ success: true });
});
