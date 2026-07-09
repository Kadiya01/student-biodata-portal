import crypto from 'crypto';
import bcrypt from 'bcrypt';
import prisma from '../prismaClient';

const resetTokens = new Map<string, { userId: string; expiresAt: number }>();

export async function requestPasswordReset(email: string) {
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { message: 'If an account exists, a reset link has been generated.' };

  const token = crypto.randomBytes(32).toString('hex');
  resetTokens.set(token, { userId: user.id, expiresAt: Date.now() + 15 * 60 * 1000 });
  return { message: 'If an account exists, a reset link has been generated.', token };
}

export async function resetPassword(token: string, newPassword: string) {
  const entry = resetTokens.get(token);
  if (!entry) throw new Error('Invalid or expired token');
  if (Date.now() > entry.expiresAt) {
    resetTokens.delete(token);
    throw new Error('Invalid or expired token');
  }

  const passwordHash = await bcrypt.hash(newPassword, 10);
  await prisma.user.update({ where: { id: entry.userId }, data: { passwordHash } });
  resetTokens.delete(token);
  return { message: 'Password reset successful' };
}
