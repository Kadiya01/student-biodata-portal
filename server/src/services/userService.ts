import prisma from '../prismaClient';

export async function listUsers(role?: string) {
  const where = role ? { role: { name: role } } : {};
  const users = await prisma.user.findMany({
    where,
    include: { role: true },
    orderBy: { createdAt: 'desc' },
  });
  return users.map(({ passwordHash, ...user }: { passwordHash?: string; [key: string]: any }) => user);
}

export async function updateUser(id: string, data: { firstName?: string; lastName?: string; email?: string }) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email }),
    },
    include: { role: true },
  });

  const { passwordHash, ...rest } = updated as any;
  return rest;
}

export async function toggleUserStatus(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    include: { role: true },
  });

  const { passwordHash, ...rest } = updated as any;
  return rest;
}
