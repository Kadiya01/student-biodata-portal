import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding database...');

  // Clean existing data in dependency order
  await prisma.notification.deleteMany();
  await prisma.auditLog.deleteMany();
  await prisma.document.deleteMany();
  await prisma.nextOfKin.deleteMany();
  await prisma.studentProfile.deleteMany();
  await prisma.user.deleteMany();
  await prisma.programme.deleteMany();
  await prisma.department.deleteMany();
  await prisma.role.deleteMany();

  // ── Roles ──
  const roles = ['student', 'reviewer', 'super_admin'];
  const roleRecords: Record<string, any> = {};
  for (const name of roles) {
    roleRecords[name] = await prisma.role.create({
      data: { name, description: `${name} role` }
    });
  }
  console.log('Roles created:', roles.join(', '));

  // ── Departments & Programmes ──
  const nursing = await prisma.department.create({
    data: { name: 'Nursing', code: 'NURS' }
  });
  const publicHealth = await prisma.department.create({
    data: { name: 'Public Health', code: 'PUBH' }
  });
  const mls = await prisma.department.create({
    data: { name: 'Medical Laboratory Science', code: 'MLS' }
  });
  const chs = await prisma.department.create({
    data: { name: 'Community Health', code: 'CHS' }
  });

  const programmes = [
    { name: 'Nursing Diploma', code: 'NURS-DIP', departmentId: nursing.id, durationMonths: 36 },
    { name: 'Nursing Degree (B.NSc)', code: 'NURS-BSC', departmentId: nursing.id, durationMonths: 48 },
    { name: 'Public Health Diploma', code: 'PUBH-DIP', departmentId: publicHealth.id, durationMonths: 24 },
    { name: 'Community Health Extension Worker (CHEW)', code: 'CHS-CHEW', departmentId: chs.id, durationMonths: 36 },
    { name: 'Junior CHEW', code: 'CHS-JCHEW', departmentId: chs.id, durationMonths: 24 },
    { name: 'Medical Laboratory Technician (MLT)', code: 'MLS-MLT', departmentId: mls.id, durationMonths: 36 },
    { name: 'Pharmacy Technician', code: 'MLS-PHT', departmentId: mls.id, durationMonths: 24 },
  ];
  for (const p of programmes) {
    await prisma.programme.create({ data: p });
  }
  console.log(`${programmes.length} programmes created`);

  // ── Users ──
  const passwordHash = await bcrypt.hash('password123', 10);

  // Super Admin
  const admin = await prisma.user.create({
    data: {
      email: 'admin@college.edu.ng',
      passwordHash,
      firstName: 'Prof. Ibrahim',
      lastName: 'Adamu',
      roleId: roleRecords.super_admin.id,
      isActive: true,
    }
  });

  // Reviewer
  const reviewer = await prisma.user.create({
    data: {
      email: 'reviewer@college.edu.ng',
      passwordHash,
      firstName: 'Jamilu',
      lastName: 'Bello',
      roleId: roleRecords.reviewer.id,
      isActive: true,
    }
  });

  // Student
  const student = await prisma.user.create({
    data: {
      email: 'student@college.edu.ng',
      passwordHash,
      firstName: 'Amina',
      lastName: 'Yusuf',
      phone: '08031234567',
      roleId: roleRecords.student.id,
      isActive: true,
    }
  });

  console.log('Users created: admin, reviewer, student');

  // ── Student Profile ──
  const chewsProgramme = await prisma.programme.findUnique({ where: { code: 'CHS-CHEW' } });

  await prisma.studentProfile.create({
    data: {
      userId: student.id,
      studentNumber: 'RCHST-2026-00045',
      programmeId: chewsProgramme?.id || null,
      dob: new Date('2004-05-12'),
      gender: 'Female',
      address: 'No 12, Gwarimpa Estate, Abuja',
      contactPhone: '08031234567',
      status: 'submitted',
      bio: {
        fullName: 'Amina Yusuf',
        email: 'student@college.edu.ng',
        phone: '08031234567',
        primarySchool: 'Model Primary School, Zaria',
        secondarySchool: 'Government Girls Secondary School, Kaduna',
        ssceType: 'WAEC',
        ssceSubjects: [
          { subject: 'English Language', grade: 'B3' },
          { subject: 'Mathematics', grade: 'C4' },
          { subject: 'Biology', grade: 'B2' },
          { subject: 'Chemistry', grade: 'C5' },
          { subject: 'Physics', grade: 'C6' },
        ],
        creditsCount: 5,
        isEligible: true,
        guardianName: 'Yusuf Ibrahim',
        guardianAddress: 'No 12, Gwarimpa Estate, Abuja',
        guardianPhone: '08069876543',
        guardianRelationship: 'Father',
      }
    }
  });

  console.log('Student profile created');
  console.log('Seeding complete!');
  console.log('\n── Test Credentials ──');
  console.log('Student:    student@college.edu.ng / password123');
  console.log('Reviewer:   reviewer@college.edu.ng / password123');
  console.log('Super Admin: admin@college.edu.ng / password123');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
