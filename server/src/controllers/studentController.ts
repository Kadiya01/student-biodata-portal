import { Request, Response } from 'express';
import * as studentService from '../services/studentService';
import * as auditService from '../services/auditService';

export async function list(req: Request, res: Response) {
  const students = await studentService.listStudents();
  res.json({ students });
}

export async function get(req: Request, res: Response) {
  const student = await studentService.getStudentById(req.params.id);
  if (!student) return res.status(404).json({ error: 'Not found' });
  res.json({ student });
}

export async function upsert(req: Request, res: Response) {
  const data = req.body;
  const profile = await studentService.createOrUpdateStudent(data);
  // Audit
  await auditService.log({ userId: (req as any).user?.userId || null, action: 'upsert_student_profile', entityType: 'StudentProfile', entityId: profile.id, details: profile, ipAddress: req.ip });
  res.json({ profile });
}

export async function remove(req: Request, res: Response) {
  await studentService.deleteStudent(req.params.id);
  await auditService.log({ userId: (req as any).user?.userId || null, action: 'delete_student_profile', entityType: 'StudentProfile', entityId: req.params.id, details: null, ipAddress: req.ip });
  res.json({ success: true });
}

export async function approve(req: Request, res: Response) {
  const profile = await studentService.setStudentStatus(req.params.id, 'approved');
  await auditService.log({ userId: (req as any).user?.userId || null, action: 'approve_student', entityType: 'StudentProfile', entityId: profile.id, details: null, ipAddress: req.ip });
  res.json({ profile });
}

export async function reject(req: Request, res: Response) {
  const profile = await studentService.setStudentStatus(req.params.id, 'rejected');
  await auditService.log({ userId: (req as any).user?.userId || null, action: 'reject_student', entityType: 'StudentProfile', entityId: profile.id, details: null, ipAddress: req.ip });
  res.json({ profile });
}
