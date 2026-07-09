import { Request, Response } from 'express';
import * as studentService from '../services/studentService';
import * as auditService from '../services/auditService';
import * as notificationService from '../services/notificationService';
import { catchAsync, parsePagination } from '../middleware/catchAsync';

export const list = catchAsync(async (req: Request, res: Response) => {
  const { search, status } = req.query as any;
  const { limit, offset } = parsePagination(req.query);
  const result = await studentService.listStudents(search, status, limit, offset);
  res.json(result);
});

export const get = catchAsync(async (req: Request, res: Response) => {
  const student = await studentService.getStudentById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json({ student });
});

export const getByUser = catchAsync(async (req: Request, res: Response) => {
  const student = await studentService.getStudentByUserId(req.params.userId);
  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json({ student });
});

export const upsert = catchAsync(async (req: Request, res: Response) => {
  const data = req.body;
  const profile = await studentService.createOrUpdateStudent(data);
  await auditService.log({
    userId: (req as any).user?.userId || null,
    action: 'upsert_student_profile',
    entityType: 'StudentProfile',
    entityId: profile.id,
    details: { studentNumber: profile.studentNumber },
    ipAddress: req.ip
  });
  res.json({ profile });
});

export const remove = catchAsync(async (req: Request, res: Response) => {
  await studentService.deleteStudent(req.params.id);
  await auditService.log({
    userId: (req as any).user?.userId || null,
    action: 'delete_student_profile',
    entityType: 'StudentProfile',
    entityId: req.params.id,
    details: null,
    ipAddress: req.ip
  });
  res.json({ success: true });
});

export const approve = catchAsync(async (req: Request, res: Response) => {
  const { reviewerComments } = req.body;
  const reviewer = (req as any).user;
  const profile = await studentService.setStudentStatus(
    req.params.id, 'approved', reviewerComments, reviewer?.userId
  );
  await auditService.log({
    userId: reviewer?.userId || null,
    action: 'approve_student',
    entityType: 'StudentProfile',
    entityId: profile.id,
    details: { reviewerComments, studentNumber: profile.studentNumber },
    ipAddress: req.ip
  });
  if (profile.userId) {
    await notificationService.createNotification({
      userId: profile.userId,
      title: 'Submission Approved',
      message: `Your biodata submission has been approved.`
    });
  }
  res.json({ profile });
});

export const reject = catchAsync(async (req: Request, res: Response) => {
  const { reviewerComments } = req.body;
  const reviewer = (req as any).user;
  const profile = await studentService.setStudentStatus(
    req.params.id, 'rejected', reviewerComments || '', reviewer?.userId
  );
  await auditService.log({
    userId: reviewer?.userId || null,
    action: 'reject_student',
    entityType: 'StudentProfile',
    entityId: profile.id,
    details: { reviewerComments, studentNumber: profile.studentNumber },
    ipAddress: req.ip
  });
  if (profile.userId) {
    await notificationService.createNotification({
      userId: profile.userId,
      title: 'Submission Rejected',
      message: `Your biodata submission was rejected. Comment: ${reviewerComments || 'None'}`
    });
  }
  res.json({ profile });
});
