import prisma from '../prismaClient';

const PREFIX = 'RCHST';

export async function generateStudentNumber(): Promise<string> {
  const year = new Date().getFullYear();
  const maxRetries = 5;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    const last = await prisma.studentProfile.findFirst({
      where: { studentNumber: { startsWith: `${PREFIX}-${year}-` } },
      orderBy: { studentNumber: 'desc' },
    });

    let nextNum = 1;
    if (last?.studentNumber) {
      const parts = last.studentNumber.split('-');
      const lastNum = parseInt(parts[2], 10);
      if (!isNaN(lastNum)) nextNum = lastNum + 1;
    }

    const candidate = `${PREFIX}-${year}-${String(nextNum).padStart(5, '0')}`;

    const exists = await prisma.studentProfile.findUnique({
      where: { studentNumber: candidate },
    });
    if (!exists) return candidate;
  }

  throw new Error('Failed to generate unique student number after retries');
}
