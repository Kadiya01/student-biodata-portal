import { Request, Response } from 'express';
import * as authService from '../services/authService';
import * as auditService from '../services/auditService';
import { catchAsync } from '../middleware/catchAsync';

export const register = catchAsync(async (req: Request, res: Response) => {
  const { user, token, regNumber } = await authService.registerUser(req.body);
  await auditService.log({
    userId: user.id, action: 'register', entityType: 'User', entityId: user.id,
    details: { email: user.email, firstName: user.firstName, regNumber }, ipAddress: req.ip
  });
  res.json({ user, token, regNumber });
});

export const login = catchAsync(async (req: Request, res: Response) => {
  try {
    const { user, token } = await authService.loginUser(req.body.email, req.body.password);
    await auditService.log({
      userId: user.id, action: 'login', entityType: 'Auth', entityId: user.id,
      details: { email: user.email }, ipAddress: req.ip
    });
    res.json({ user, token });
  } catch (err: any) {
    await auditService.log({
      userId: null, action: 'login_failed', entityType: 'Auth', entityId: null,
      details: { email: req.body.email, reason: err.message }, ipAddress: req.ip
    });
    res.status(400).json({ error: err.message });
  }
});

export const me = catchAsync(async (req: Request, res: Response) => {
  const payload: any = (req as any).user;
  if (!payload?.userId) return res.status(401).json({ error: 'Unauthorized' });
  const user = await authService.getUserById(payload.userId);
  if (!user) return res.status(404).json({ error: 'User not found' });
  res.json({ user });
});
