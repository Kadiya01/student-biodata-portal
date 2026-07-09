import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import * as documentController from '../controllers/documentController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { documentUploadSchema } from '../validation/document';

const ALLOWED_TYPES = [
  'image/jpeg', 'image/png', 'image/webp',
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
];

const upload = multer({
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (_req: any, file: any, cb: any) => {
    if (ALLOWED_TYPES.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error(`File type ${file.mimetype} not allowed`));
    }
  },
});

const router = Router();

router.post('/upload', requireAuth, validate({ body: documentUploadSchema }), upload.single('file'), documentController.upload);
router.get('/:studentId', requireAuth, documentController.listByStudent);

export default router;
