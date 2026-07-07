import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const roles = ['admin', 'registrar', 'officer', 'student'];
  for (const name of roles) {
    await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` }
    });
  }

  // Add sample departments and programmes if not present
  const nursing = await prisma.department.upsert({
    where: { code: 'NURS' },
    update: {},
    create: { name: 'Nursing', code: 'NURS' }
  });

  await prisma.programme.upsert({
    where: { code: 'NURS-DIP' },
    update: {},
    create: { code: 'NURS-DIP', name: 'Nursing Diploma', departmentId: nursing.id, durationMonths: 36 }
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
