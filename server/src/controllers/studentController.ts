import { Request, Response } from 'express';
import * as studentService from '../services/studentService';
import * as auditService from '../services/auditService';
import * as notificationService from '../services/notificationService';

export async function list(req: Request, res: Response) {
  try {
    const { search, status } = req.query as any;
    const students = await studentService.listStudents(search, status);
    res.json({ students });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function get(req: Request, res: Response) {
  try {
    const student = await studentService.getStudentById(req.params.id);
    if (!student) return res.status(404).json({ error: 'Not found' });
    res.json({ student });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function getByUser(req: Request, res: Response) {
  try {
    const student = await studentService.getStudentByUserId(req.params.userId);
    if (!student) return res.status(404).json({ error: 'Not found' });
    res.json({ student });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
}

export async function upsert(req: Request, res: Response) {
  try {
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
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function remove(req: Request, res: Response) {
  try {
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
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function approve(req: Request, res: Response) {
  try {
    const { reviewerComments } = req.body;
    const reviewer = (req as any).user;
    const profile = await studentService.setStudentStatus(
      req.params.id,
      'approved',
      reviewerComments,
      reviewer?.userId
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
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}

export async function reject(req: Request, res: Response) {
  try {
    const { reviewerComments } = req.body;
    const reviewer = (req as any).user;
    const profile = await studentService.setStudentStatus(
      req.params.id,
      'rejected',
      reviewerComments || '',
      reviewer?.userId
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
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
}
