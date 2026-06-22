import { Request, Response } from 'express';
import * as authService from '../services/authService';

export async function register(req: Request, res: Response) {
  try {
    const { user, token } = await authService.registerUser(req.body);
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { user, token } = await authService.loginUser(req.body.email, req.body.password);
    res.json({ user, token });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
