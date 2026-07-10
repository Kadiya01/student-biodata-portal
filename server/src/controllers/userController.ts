import { Request, Response } from 'express';
import * as userService from '../services/userService';
import { catchAsync, parsePagination } from '../middleware/catchAsync';

export const list = catchAsync(async (req: Request, res: Response) => {
  const { role } = req.query;
  const { limit, offset } = parsePagination(req.query);
  const result = await userService.listUsers(role as string | undefined, limit, offset);
  res.json(result);
});

export const update = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  try {
    const user = await userService.updateUser(id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err: any) {
    if (err.message === 'Email already in use') {
      return res.status(409).json({ error: 'Email already in use' });
    }
    throw err;
  }
});

export const toggleStatus = catchAsync(async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await userService.toggleUserStatus(id);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});
