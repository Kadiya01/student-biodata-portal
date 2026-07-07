import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { studentUpsertSchema } from '../validation/student';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), studentController.list);
router.post('/', requireAuth, validate({ body: studentUpsertSchema }), studentController.upsert);
router.get('/:id', requireAuth, studentController.get);
router.put('/:id', requireAuth, validate({ body: studentUpsertSchema }), studentController.upsert);
router.delete('/:id', requireAuth, requireRole('admin'), studentController.remove);
router.put('/approve/:id', requireAuth, requireRole('registrar'), studentController.approve);
router.put('/reject/:id', requireAuth, requireRole('registrar'), studentController.reject);

export default router;
