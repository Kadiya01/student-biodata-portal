import prisma from '../prismaClient';

export async function listStudents(search?: string, status?: string) {
  const where: any = {};
  if (status) where.status = status;
  if (search) {
    where.OR = [
      { studentNumber: { contains: search } },
      { user: { firstName: { contains: search } } },
      { user: { lastName: { contains: search } } },
    ];
  }
  return prisma.studentProfile.findMany({
    where,
    include: { user: { include: { role: true } }, programme: true, documents: true },
    orderBy: { updatedAt: 'desc' }
  });
}

export async function getStudentById(id: string) {
  return prisma.studentProfile.findUnique({
    where: { id },
    include: { user: { include: { role: true } }, programme: true, documents: true, nextOfKin: true }
  });
}

export async function getStudentByUserId(userId: string) {
  return prisma.studentProfile.findUnique({
    where: { userId },
    include: { user: { include: { role: true } }, programme: true, documents: true, nextOfKin: true }
  });
}

export async function createOrUpdateStudent(data: any) {
  const { userId, ...profile } = data;
  const mapped: any = {};

  if (profile.dob !== undefined) mapped.dob = profile.dob ? new Date(profile.dob) : null;
  if (profile.gender !== undefined) mapped.gender = profile.gender;
  if (profile.address !== undefined) mapped.address = profile.address;
  if (profile.contactPhone !== undefined) mapped.contactPhone = profile.contactPhone;
  if (profile.phone !== undefined) mapped.contactPhone = profile.phone;
  if (profile.programmeId !== undefined) mapped.programmeId = profile.programmeId;
  if (profile.status !== undefined) mapped.status = profile.status;
  if (profile.reviewerComments !== undefined) mapped.reviewerComments = profile.reviewerComments;

  const wizardFields: any = {};
  const wizardKeys = ['passportPhoto', 'fullName', 'primarySchool', 'secondarySchool', 'ssceType', 'ssceSubjects', 'creditsCount', 'isEligible', 'guardianName', 'guardianAddress', 'guardianPhone', 'guardianRelationship', 'email', 'lastUpdated'];
  for (const key of wizardKeys) {
    if (profile[key] !== undefined) wizardFields[key] = profile[key];
  }
  if (Object.keys(wizardFields).length > 0) {
    mapped.bio = wizardFields;
  }

  return prisma.studentProfile.upsert({
    where: { userId },
    update: mapped,
    create: { userId, ...mapped }
  });
}

export async function deleteStudent(id: string) {
  return prisma.studentProfile.delete({ where: { id } });
}

export async function setStudentStatus(id: string, status: string, reviewerComments?: string, reviewedBy?: string) {
  const data: any = { status: status as any };
  if (reviewerComments !== undefined) data.reviewerComments = reviewerComments;
  if (reviewedBy !== undefined) data.reviewedBy = reviewedBy;
  if (status === 'approved' || status === 'rejected') data.reviewedAt = new Date();
  return prisma.studentProfile.update({ where: { id }, data });
}
