import prisma from '../prismaClient';

export async function listStudents() {
  return prisma.studentProfile.findMany({ include: { user: true, programme: true } });
}

export async function getStudentById(id: string) {
  return prisma.studentProfile.findUnique({ where: { id }, include: { user: true, programme: true, documents: true } });
}

export async function createOrUpdateStudent(data: any) {
  // data should contain userId and profile fields
  const { userId, ...profile } = data;
  return prisma.studentProfile.upsert({
    where: { userId },
    update: profile,
    create: { userId, ...profile }
  });
}

export async function deleteStudent(id: string) {
  return prisma.studentProfile.delete({ where: { id } });
}

export async function setStudentStatus(id: string, status: string) {
  return prisma.studentProfile.update({ where: { id }, data: { status } });
}
