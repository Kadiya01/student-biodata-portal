import prisma from '../prismaClient';
import { cacheGet, cacheSet, cacheDel } from '../config/cache';

export async function listProgrammes(departmentId?: string) {
  const cacheKey = `programmes:${departmentId || 'all'}`;
  const cached = await cacheGet<any[]>(cacheKey);
  if (cached) return cached;

  const where: any = {};
  if (departmentId) where.departmentId = departmentId;
  const data = await prisma.programme.findMany({
    where,
    include: { department: true },
    orderBy: { name: 'asc' },
  });

  await cacheSet(cacheKey, data, 300);
  return data;
}

export async function getProgramme(id: string) {
  return prisma.programme.findUnique({
    where: { id },
    include: { department: true },
  });
}

export async function createProgramme(data: { name: string; code: string; departmentId?: string; durationMonths?: number }) {
  const result = await prisma.programme.create({ data, include: { department: true } });
  await cacheDel('programmes:*');
  return result;
}

export async function updateProgramme(id: string, data: Partial<{ name: string; code: string; departmentId: string; durationMonths: number }>) {
  const result = await prisma.programme.update({ where: { id }, data, include: { department: true } });
  await cacheDel('programmes:*');
  return result;
}

export async function deleteProgramme(id: string) {
  const result = await prisma.programme.delete({ where: { id } });
  await cacheDel('programmes:*');
  return result;
}

export async function listDepartments() {
  const cacheKey = 'departments:all';
  const cached = await cacheGet<any[]>(cacheKey);
  if (cached) return cached;

  const data = await prisma.department.findMany({ orderBy: { name: 'asc' } });

  await cacheSet(cacheKey, data, 300);
  return data;
}
