import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient';
import { sendPasswordResetEmail } from './emailService';
import logger from '../utils/logger';

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: 'If an account exists, a reset link has been sent to your email.' };

  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  // Send email directly (with SMTP fallback to log if not configured)
  sendPasswordResetEmail(user.email, token).catch((err) => {
    logger.error('Failed to send password reset email', {
      userId: user.id,
      email: user.email,
      error: err instanceof Error ? err.message : String(err),
    });
  });

  const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
  const resetLink = `${clientUrl}/reset-password?token=${token}`;

  // If SMTP is not configured, include the reset link in the response for dev/testing
  if (!process.env.SMTP_HOST) {
    return {
      message: 'If an account exists, a reset link has been sent to your email.',
      resetLink,
    };
  }

  return { message: 'If an account exists, a reset link has been sent to your email.' };
}

export async function resetPassword(token: string, newPassword: string) {
  const record = await prisma.passwordResetToken.findUnique({ where: { token } });
  if (!record) throw new Error('Invalid or expired token');
  if (record.used) throw new Error('Invalid or expired token');
  if (new Date() > record.expiresAt) throw new Error('Invalid or expired token');

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.$transaction([
    prisma.user.update({ where: { id: record.userId }, data: { passwordHash } }),
    prisma.passwordResetToken.update({ where: { id: record.id }, data: { used: true } }),
  ]);

  return { message: 'Password reset successful' };
}
