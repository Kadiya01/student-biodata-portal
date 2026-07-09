import prisma from '../prismaClient';

export async function createNotification(data: {
  userId?: string;
  studentId?: string;
  title: string;
  message: string;
}) {
  return prisma.notification.create({ data });
}

export async function listNotifications(userId?: string, limit = 50, offset = 0) {
  const where: any = {};
  if (userId) where.userId = userId;
  return prisma.notification.findMany({
    where,
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
}

export async function markAsRead(id: string, userId: string) {
  return prisma.notification.updateMany({
    where: { id, userId },
    data: { read: true },
  });
}

export async function markAllAsRead(userId: string) {
  return prisma.notification.updateMany({
    where: { userId, read: false },
    data: { read: true },
  });
}
