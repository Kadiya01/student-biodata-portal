import prisma from '../prismaClient';

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
    // Swallow errors to avoid interfering with main flow; logs can be inspected separately.
    // eslint-disable-next-line no-console
    console.error('Failed to write audit log', err);
  }
}

export async function listLogs({ limit = 50, offset = 0, userId, action, entityType }: any) {
  const where: any = {};
  if (userId) where.userId = userId;
  if (action) where.action = action;
  if (entityType) where.entityType = entityType;
  const logs = await prisma.auditLog.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    skip: offset,
    take: limit,
    include: { user: true }
  });
  return logs;
}
