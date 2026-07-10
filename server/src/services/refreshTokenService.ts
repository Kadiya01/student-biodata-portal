import crypto from 'crypto';
import prisma from '../prismaClient';

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export async function createRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await prisma.refreshToken.create({
    data: { userId, token, expiresAt },
  });

  return token;
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  const record = await prisma.refreshToken.findUnique({ where: { token } });
  if (!record) return null;
  if (record.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: record.id } });
    return null;
  }
  if (record.revoked) return null;
  return { userId: record.userId };
}

export async function rotateRefreshToken(oldToken: string): Promise<{ userId: string; newToken: string } | null> {
  const record = await prisma.refreshToken.findUnique({ where: { token: oldToken } });
  if (!record) return null;
  if (record.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: record.id } });
    return null;
  }
  if (record.revoked) return null;

  const newToken = crypto.randomBytes(40).toString('hex');
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await prisma.$transaction([
    prisma.refreshToken.update({ where: { id: record.id }, data: { revoked: true } }),
    prisma.refreshToken.create({ data: { userId: record.userId, token: newToken, expiresAt } }),
  ]);

  return { userId: record.userId, newToken };
}

export async function revokeRefreshToken(token: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { token },
    data: { revoked: true },
  });
}

export async function revokeAllUserRefreshTokens(userId: string): Promise<void> {
  await prisma.refreshToken.updateMany({
    where: { userId, revoked: false },
    data: { revoked: true },
  });
}

export async function cleanupExpiredTokens(): Promise<number> {
  const result = await prisma.refreshToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  });
  return result.count;
}
