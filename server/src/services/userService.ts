import prisma from '../prismaClient';

export async function listUsers(role?: string, limit = 50, offset = 0) {
  const where = role ? { role: { name: role } } : {};
  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      include: { role: true },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.user.count({ where }),
  ]);
  return {
    users: users.map(({ passwordHash, role, ...user }: { passwordHash?: string; role?: any; [key: string]: any }) => ({
      ...user,
      role: role?.name || 'student'
    })),
    total,
  };
}

export async function getUserById(id: string) {
  const user = await prisma.user.findUnique({
    where: { id },
    include: { role: true }
  });
  if (!user) return null;
  const { passwordHash, role, ...rest } = user as any;
  return { ...rest, role: role?.name || 'student' };
}

export async function updateUser(id: string, data: { firstName?: string; lastName?: string; email?: string }) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  if (data.email && data.email !== user.email) {
    const existing = await prisma.user.findUnique({ where: { email: data.email } });
    if (existing) throw new Error('Email already in use');
  }

  const updated = await prisma.user.update({
    where: { id },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.email !== undefined && { email: data.email }),
    },
    include: { role: true },
  });

  const { passwordHash, role, ...rest } = updated as any;
  return { ...rest, role: role?.name || 'student' };
}

export async function getUserByEmail(email: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });
  if (!user) return null;
  const { passwordHash, role, ...rest } = user as any;
  return { ...rest, role: role?.name || 'student' };
}

export async function toggleUserStatus(id: string) {
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return null;

  const updated = await prisma.user.update({
    where: { id },
    data: { isActive: !user.isActive },
    include: { role: true },
  });

  const { passwordHash, role, ...rest } = updated as any;
  return { ...rest, role: role?.name || 'student' };
}
