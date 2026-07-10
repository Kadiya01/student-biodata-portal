import bcrypt from 'bcrypt';
import prisma from '../prismaClient';
import { signToken } from '../utils/jwt';
import { generateStudentNumber } from '../utils/regNumber';
import * as refreshTokenService from './refreshTokenService';

export async function registerUser({ email, password, firstName, lastName, phone, role: roleName }: any) {
  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) throw new Error('Email already in use');

  const targetRole = roleName || 'student';
  let role = await prisma.role.findUnique({ where: { name: targetRole } });
  if (!role) {
    role = await prisma.role.create({ data: { name: targetRole, description: `${targetRole} role` } });
  }

  const passwordHash = await bcrypt.hash(password, 10);
  const user = await prisma.user.create({
    data: {
      email,
      passwordHash,
      firstName,
      lastName,
      phone,
      roleId: role.id,
    },
    include: { role: true }
  });

  let regNumber: string | undefined;
  if (targetRole === 'student') {
    regNumber = await generateStudentNumber();
    await prisma.studentProfile.create({
      data: {
        userId: user.id,
        studentNumber: regNumber,
        contactPhone: phone,
        bio: { fullName: `${firstName || ''} ${lastName || ''}`.trim(), email },
        status: 'draft',
      }
    });
  }

  const token = signToken({ userId: user.id, role: user.role.name, email: user.email });
  const refreshToken = await refreshTokenService.createRefreshToken(user.id);
  return { user: sanitizeUser(user), token, refreshToken, regNumber };
}

export async function loginUser(email: string, password: string) {
  const user = await prisma.user.findUnique({ where: { email }, include: { role: true } });
  if (!user) throw new Error('Invalid credentials');
  if (!user.isActive) throw new Error('Account deactivated');

  const ok = await bcrypt.compare(password, user.passwordHash);
  if (!ok) throw new Error('Invalid credentials');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });

  const token = signToken({ userId: user.id, role: user.role.name, email: user.email });
  const refreshToken = await refreshTokenService.createRefreshToken(user.id);
  return { user: sanitizeUser(user), token, refreshToken };
}

export async function refreshAccessToken(refreshToken: string) {
  const payload = await refreshTokenService.verifyRefreshToken(refreshToken);
  if (!payload) throw new Error('Invalid or expired refresh token');

  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: { role: true },
  });
  if (!user) throw new Error('User not found');
  if (!user.isActive) throw new Error('Account deactivated');

  const newAccessToken = signToken({ userId: user.id, role: user.role.name, email: user.email });
  return { token: newAccessToken, user: sanitizeUser(user) };
}

export async function logoutUser(refreshToken: string) {
  await refreshTokenService.revokeRefreshToken(refreshToken);
}

export async function getUserById(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { role: true, studentProfile: true }
  });
  if (!user) return null;
  return sanitizeUser(user);
}

function sanitizeUser(user: any) {
  const { passwordHash, role, ...rest } = user;
  const flatRole = role?.name || 'student';
  const studentNumber = rest.studentProfile?.studentNumber;
  const status = rest.studentProfile?.status;
  return { ...rest, role: flatRole, regNumber: studentNumber, status };
}
