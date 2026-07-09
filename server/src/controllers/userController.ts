import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { catchAsync } from '../middleware/catchAsync';

export const list = catchAsync(async (req: Request, res: Response) => {
  const { role } = req.query;
  const users = await userService.listUsers(role as string | undefined);
  res.json({ users });
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.updateUser(id, req.body);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});

export const toggleStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.toggleUserStatus(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});
