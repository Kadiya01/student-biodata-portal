import { Router } from 'express';
import multer from 'multer';
import * as documentController from '../controllers/documentController';
import { requireAuth } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { documentUploadSchema } from '../validation/document';

const upload = multer({ dest: 'uploads/' });
const router = Router();

router.post('/upload', requireAuth, validate({ body: documentUploadSchema }), upload.single('file'), documentController.upload);
router.get('/:studentId', requireAuth, documentController.listByStudent);

export default router;
