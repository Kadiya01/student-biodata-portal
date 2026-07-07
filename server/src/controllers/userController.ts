import { Request, Response } from 'express';
import * as userService from '../services/userService';

export async function list(req: Request, res: Response) {
  try {
    const { role } = req.query;
    const users = await userService.listUsers(role as string | undefined);
    res.json({ users });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function update(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await userService.updateUser(id, req.body);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function toggleStatus(req: Request, res: Response) {
  try {
    const { id } = req.params;
    const user = await userService.toggleUserStatus(id);
    if (!user) return res.status(404).json({ error: 'User not found' });
    res.json({ user });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
