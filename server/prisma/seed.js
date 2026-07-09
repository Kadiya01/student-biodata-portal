require('dotenv').config({ path: require('path').join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const roles = ['admin', 'registrar', 'officer', 'student'];
  for (const name of roles) {
    await prisma.role.upsert({ where: { name }, update: {}, create: { name, description: `${name} role` } });
  }
  const depts = [
    { name: 'Nursing', code: 'NURS' },
    { name: 'Public Health', code: 'PUBH' },
    { name: 'Medical Laboratory Science', code: 'MLS' },
    { name: 'Community Health', code: 'CHS' },
  ];
  const deptRecords = {};
  for (const d of depts) {
    deptRecords[d.code] = await prisma.department.upsert({ where: { code: d.code }, update: {}, create: d });
  }
  const progData = [
    { code: 'NURS-DIP', name: 'Nursing Diploma', dept: 'NURS', months: 36 },
    { code: 'NURS-BSC', name: 'Nursing Degree', dept: 'NURS', months: 48 },
    { code: 'PUBH-DIP', name: 'Public Health Diploma', dept: 'PUBH', months: 24 },
    { code: 'MLS-DIP', name: 'Medical Laboratory Science', dept: 'MLS', months: 36 },
    { code: 'CHS-DIP', name: 'Community Health Diploma', dept: 'CHS', months: 24 },
  ];
  for (const p of progData) {
    await prisma.programme.upsert({ where: { code: p.code }, update: {}, create: { code: p.code, name: p.name, departmentId: deptRecords[p.dept].id, durationMonths: p.months } });
  }
  console.log('Seeded roles, departments, programmes');
}
main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
