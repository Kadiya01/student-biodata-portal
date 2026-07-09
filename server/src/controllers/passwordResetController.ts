import { Request, Response } from 'express';
import * as passwordResetService from '../services/passwordResetService';
import { catchAsync } from '../middleware/catchAsync';

export const forgotPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await passwordResetService.requestPasswordReset(req.body.email);
  res.json(result);
});

export const resetPassword = catchAsync(async (req: Request, res: Response) => {
  const result = await passwordResetService.resetPassword(req.body.token, req.body.password);
  res.json(result);
});
