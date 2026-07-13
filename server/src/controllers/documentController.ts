import { Request, Response } from 'express';
import prisma from '../prismaClient';
import * as auditService from '../services/auditService';
import { catchAsync, parsePagination } from '../middleware/catchAsync';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { isCloudinaryConfigured, uploadToCloudinary } from '../config/cloudinary';
import logger from '../utils/logger';

export const upload = catchAsync(async (req: AuthenticatedRequest, res: Response) => {
  const file = (req as any).file;
  if (!file) return res.status(400).json({ error: 'No file uploaded' });
  const { studentId } = req.body;

  let fileUrl: string;

  if (isCloudinaryConfigured()) {
    try {
      const result = await uploadToCloudinary(file.buffer || file.path, {
        folder: `student-biodata/${studentId}`,
      });
      fileUrl = result.url;
    } catch (err) {
      logger.error('Cloudinary upload failed, falling back to local', { error: err });
      fileUrl = file.originalname;
    }
  } else {
    fileUrl = file.originalname;
  }

  const doc = await prisma.document.create({
    data: {
      studentId,
      uploadedBy: req.user?.userId || null,
      fileUrl,
      fileName: file.originalname,
      fileType: file.mimetype,
      sizeBytes: file.size,
    },
  });

  await auditService.log({
    userId: req.user?.userId || null,
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
  const { limit, offset } = parsePagination(req.query);
  const [docs, total] = await Promise.all([
    prisma.document.findMany({
      where: { studentId },
      take: limit,
      skip: offset,
      orderBy: { uploadedAt: 'desc' },
    }),
    prisma.document.count({ where: { studentId } }),
  ]);
  res.json({ docs, total, limit, offset });
});
