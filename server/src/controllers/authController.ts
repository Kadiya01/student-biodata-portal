import { Request, Response } from 'express';
import * as authService from '../services/authService';
import * as auditService from '../services/auditService';

export async function register(req: Request, res: Response) {
  try {
    const { user, token, regNumber } = await authService.registerUser(req.body);
    // Audit log
    await auditService.log({ userId: user.id, action: 'register', entityType: 'User', entityId: user.id, details: { email: user.email, firstName: user.firstName, regNumber }, ipAddress: req.ip });
    res.json({ user, token, regNumber });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { user, token } = await authService.loginUser(req.body.email, req.body.password);
    // Audit log
    await auditService.log({ userId: user.id, action: 'login', entityType: 'Auth', entityId: user.id, details: { email: user.email }, ipAddress: req.ip });
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function me(req: Request, res: Response) {
  try {
    const payload: any = (req as any).user;
    if (!payload?.userId) return res.status(401).json({ error: 'Unauthorized' });
    const user = await authService.getUserById(payload.userId);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
