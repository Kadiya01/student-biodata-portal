import prisma from '../prismaClient';

const PREFIX = 'RCHST';
const YEAR = new Date().getFullYear();

export async function generateStudentNumber(): Promise<string> {
  const last = await prisma.studentProfile.findFirst({
    where: { studentNumber: { startsWith: `${PREFIX}-${YEAR}-` } },
    orderBy: { studentNumber: 'desc' },
  });

  let nextNum = 1;
  if (last?.studentNumber) {
    const parts = last.studentNumber.split('-');
    const lastNum = parseInt(parts[2], 10);
    if (!isNaN(lastNum)) nextNum = lastNum + 1;
  }

  return `${PREFIX}-${YEAR}-${String(nextNum).padStart(5, '0')}`;
}
