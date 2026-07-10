import { Response } from 'express';
import * as notificationService from '../services/notificationService';
import { catchAsync } from '../middleware/catchAsync';
import { AuthenticatedRequest } from '../middleware/authMiddleware';

export const list = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { limit = '50', offset = '0' } = req.query as Record<string, string>;
  const notifications = await notificationService.listNotifications(
    req.user!.userId, Number(limit), Number(offset)
  );
  res.json({ notifications });
});

export const markRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const { id } = req.params;
  await notificationService.markAsRead(id, req.user!.userId);
  res.json({ success: true });
});

export const markAllRead = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  await notificationService.markAllAsRead(req.user!.userId);
  res.json({ success: true });
});
