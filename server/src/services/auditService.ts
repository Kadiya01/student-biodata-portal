import prisma from '../prismaClient';
import logger from '../utils/logger';

export async function log({ userId, action, entityType, entityId, details, ipAddress }: any) {
  try {
    await prisma.auditLog.create({
      data: {
        userId: userId || null,
        action,
        entityType: entityType || null,
        entityId: entityId || null,
        details: details || undefined,
        ipAddress: ipAddress || null
      }
    });
  } catch (err) {
    logger.error('Failed to write audit log', { error: err });
  }
}

export async function listLogs({ limit = 50, offset = 0, userId, action, entityType }: any) {
  const where: any = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip: offset,
      take: limit,
      include: { user: true },
    }),
    prisma.auditLog.count({ where }),
  ]);
  return { logs, total, limit, offset };
}
