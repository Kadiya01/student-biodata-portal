import crypto from 'crypto';
import prisma from '../prismaClient';

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createRefreshToken(userId: string): Promise<string> {
  const token = crypto.randomBytes(40).toString('hex');
  const tokenHash = hashToken(token);
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await prisma.refreshToken.create({
    data: { userId, tokenHash, expiresAt },
  });

  return token;
}

export async function verifyRefreshToken(token: string): Promise<{ userId: string } | null> {
  const tokenHash = hashToken(token);
  const record = await prisma.refreshToken.findUnique({ where: { tokenHash } });
  if (!record) return null;
  if (record.expiresAt < new Date()) {
    await prisma.refreshToken.delete({ where: { id: record.id } });
    return null;
  }
  if (record.revoked) return null;
  return { userId: record.userId };
}

export async function rotateRefreshToken(oldToken: string): Promise<{ userId: string; newToken: string } | null> {
  const oldHash = hashToken(oldToken);

  const result = await prisma.$transaction(async (tx) => {
    const record = await tx.refreshToken.findUnique({ where: { tokenHash: oldHash } });
    if (!record) return null;
    if (record.expiresAt < new Date()) {
      await tx.refreshToken.delete({ where: { id: record.id } });
      return null;
    }
    if (record.revoked) return null;

    const newToken = crypto.randomBytes(40).toString('hex');
    const newHash = hashToken(newToken);
    const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

    const revoked = await tx.refreshToken.updateMany({
      where: { id: record.id, revoked: false },
      data: { revoked: true },
    });
    if (revoked.count === 0) return null;

    await tx.refreshToken.create({
      data: { userId: record.userId, tokenHash: newHash, expiresAt },
    });

    return { userId: record.userId, newToken };
  });

  return result;
}

export async function revokeRefreshToken(token: string): Promise<void> {
  const tokenHash = hashToken(token);
  await prisma.refreshToken.updateMany({
    where: { tokenHash },
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
