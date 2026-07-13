import prisma from './prismaClient';
import bcrypt from 'bcrypt';
import logger from './utils/logger';

const DEFAULT_ADMIN_EMAIL = 'admin@college.edu.ng';
const DEFAULT_ADMIN_PASSWORD = 'password123';
const DEFAULT_ADMIN_FIRST = 'Prof. Ibrahim';
const DEFAULT_ADMIN_LAST = 'Adamu';

export async function bootstrap() {
  logger.info('Running startup bootstrap...');

  // Ensure roles exist
  const roleNames = ['student', 'reviewer', 'super_admin'] as const;
  const roles: Record<string, { id: string }> = {};
  for (const name of roleNames) {
    roles[name] = await prisma.role.upsert({
      where: { name },
      update: {},
      create: { name, description: `${name} role` },
    });
  }
  logger.info('Roles verified', { roles: Object.keys(roles) });

  // Ensure at least one super_admin exists
  const adminEmail = process.env.ADMIN_EMAIL || DEFAULT_ADMIN_EMAIL;
  const adminPassword = process.env.ADMIN_PASSWORD || DEFAULT_ADMIN_PASSWORD;

  const superAdminCount = await prisma.user.count({
    where: {
      role: { name: 'super_admin' },
      isActive: true,
    },
  });

  if (superAdminCount === 0) {
    const existing = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (existing) {
      // Reactivate if somehow deactivated
      await prisma.user.update({
        where: { id: existing.id },
        data: { isActive: true, roleId: roles.super_admin.id },
      });
      logger.info('Reactivated existing super_admin', { email: adminEmail });
    } else {
      const passwordHash = await bcrypt.hash(adminPassword, 10);
      await prisma.user.create({
        data: {
          email: adminEmail,
          passwordHash,
          firstName: DEFAULT_ADMIN_FIRST,
          lastName: DEFAULT_ADMIN_LAST,
          roleId: roles.super_admin.id,
          isActive: true,
        },
      });
      logger.info('Created default super_admin', { email: adminEmail });
    }
  } else {
    logger.info(`Super admin accounts active: ${superAdminCount}`);
  }

  // Ensure programmes and departments exist (idempotent)
  const deptCount = await prisma.department.count();
  if (deptCount === 0) {
    const nursing = await prisma.department.create({ data: { name: 'Nursing', code: 'NURS' } });
    const publicHealth = await prisma.department.create({ data: { name: 'Public Health', code: 'PUBH' } });
    const mls = await prisma.department.create({ data: { name: 'Medical Laboratory Science', code: 'MLS' } });
    const chs = await prisma.department.create({ data: { name: 'Community Health', code: 'CHS' } });

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
    logger.info('Seeded departments and programmes');
  }

  logger.info('Bootstrap complete');
}
