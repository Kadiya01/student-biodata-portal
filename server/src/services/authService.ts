import bcrypt from 'bcrypt';
import prisma from '../prismaClient';
import { signToken } from '../utils/jwt';

export async function registerUser({ email, password, firstName, lastName, phone }: any) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  let role = await prisma.role.findUnique({ where: { name: 'student' } });
  if (!role) {
    role = await prisma.role.create({ data: { name: 'student', description: 'Student role' } });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      roleId: role.id
    },
    include: { role: true }
  });

  const token = signToken({ userId: user.id, role: user.role.name, email: user.email });
  return { user, token };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user) throw new Error('Invalid credentials');
  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');
  const token = signToken({ userId: user.id, role: user.role?.name || 'student', email: user.email });
  return { user, token };
}
