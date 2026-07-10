import { Request, Response } from 'express';
import prisma from '../prismaClient';
import * as auditService from '../services/auditService';
import { catchAsync } from '../middleware/catchAsync';
import { isCloudinaryConfigured, uploadToCloudinary } from '../config/cloudinary';
import logger from '../utils/logger';

export const upload = catchAsync(async (req: Request, res: Response) => {
  const file = (req as any).file;
  const user = (req as any).user;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const { studentId } = req.body;

  let fileUrl: string;
  let publicId: string | null = null;

  if (isCloudinaryConfigured()) {
    try {
      const result = await uploadToCloudinary(file.path, {
        folder: `student-biodata/${studentId}`,
      });
      fileUrl = result.url;
      publicId = result.publicId;
    } catch (err) {
      logger.error('Cloudinary upload failed, falling back to local', { error: err });
      fileUrl = file.path || file.filename;
    }
  } else {
    fileUrl = file.path || file.location || file.filename;
  }

  const doc = await prisma.document.create({
    data: {
      studentId,
      uploadedBy: user?.userId || null,
      fileUrl,
      fileName: file.originalname,
      fileType: file.mimetype,
      sizeBytes: file.size,
    },
  });

  await auditService.log({
    userId: user?.userId || null,
    action: 'upload_document',
    entityType: 'Document',
    entityId: doc.id,
    details: { fileName: doc.fileName, fileUrl: doc.fileUrl, sizeBytes: doc.sizeBytes },
    ipAddress: req.ip,
  });

  res.json({ doc });
});

export const listByStudent = catchAsync(async (req: Request, res: Response) => {
  const studentId = req.params.studentId;
  const docs = await prisma.document.findMany({ where: { studentId } });
  res.json({ docs });
});
