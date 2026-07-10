import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient';
import { queueManager } from '../jobs/queueManager';

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: 'If an account exists, a reset link has been sent to your email.' };

  // Revoke any existing tokens for this user
  await prisma.passwordResetToken.updateMany({
    where: { userId: user.id, used: false },
    data: { used: true },
  });

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { userId: user.id, token, expiresAt },
  });

  // Enqueue email job
  const resetUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  await queueManager.addJob('email', 'send-password-reset', {
    to: user.email,
    subject: 'Password Reset - Student Bio-Data Portal',
    html: `<p>Click <a href="${resetUrl}">here</a> to reset your password. This link expires in 15 minutes.</p>`,
  }).catch(() => {});

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
