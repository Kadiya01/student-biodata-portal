import prisma from '../prismaClient';

export async function listProgrammes(departmentId?: string) {
  const where: any = {};
  if (departmentId) where.departmentId = departmentId;
  return prisma.programme.findMany({
    where,
    include: { department: true },
    orderBy: { name: 'asc' },
  });
}

export async function getProgramme(id: string) {
  return prisma.programme.findUnique({
    where: { id },
    include: { department: true },
  });
}

export async function createProgramme(data: { name: string; code: string; departmentId?: string; durationMonths?: number }) {
  return prisma.programme.create({ data, include: { department: true } });
}

export async function updateProgramme(id: string, data: Partial<{ name: string; code: string; departmentId: string; durationMonths: number }>) {
  return prisma.programme.update({ where: { id }, data, include: { department: true } });
}

export async function deleteProgramme(id: string) {
  return prisma.programme.delete({ where: { id } });
}

export async function listDepartments() {
  return prisma.department.findMany({ orderBy: { name: 'asc' } });
}
