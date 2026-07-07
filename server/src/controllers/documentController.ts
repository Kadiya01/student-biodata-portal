import { Request, Response } from 'express';
import prisma from '../prismaClient';
import * as auditService from '../services/auditService';

export async function upload(req: Request, res: Response) {
  // multer should have attached file to req.file
  const file = (req as any).file;
  const user = (req as any).user;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const { studentId } = req.body;
  const doc = await prisma.document.create({
    data: {
      studentId,
      uploadedBy: user?.userId || null,
      fileUrl: file.path || file.location || file.filename,
      fileName: file.originalname,
      fileType: file.mimetype,
      sizeBytes: file.size
    }
  });
  await auditService.log({ userId: user?.userId || null, action: 'upload_document', entityType: 'Document', entityId: doc.id, details: { fileName: doc.fileName, fileUrl: doc.fileUrl, sizeBytes: doc.sizeBytes }, ipAddress: req.ip });
  res.json({ doc });
}

export async function listByStudent(req: Request, res: Response) {
  const studentId = req.params.studentId;
  const docs = await prisma.document.findMany({ where: { studentId } });
  res.json({ docs });
}
