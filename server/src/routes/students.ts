import { Router } from 'express';
import * as studentController from '../controllers/studentController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { studentUpsertSchema } from '../validation/student';

const router = Router();

router.get('/', requireAuth, requireRole('reviewer', 'super_admin'), studentController.list);
router.post('/', requireAuth, validate({ body: studentUpsertSchema }), studentController.upsert);
router.get('/by-user/:userId', requireAuth, studentController.getByUser);
router.get('/:id', requireAuth, studentController.get);
router.put('/:id', requireAuth, validate({ body: studentUpsertSchema }), studentController.upsert);
router.delete('/:id', requireAuth, requireRole('super_admin'), studentController.remove);
router.put('/approve/:id', requireAuth, requireRole('reviewer', 'super_admin'), studentController.approve);
router.put('/reject/:id', requireAuth, requireRole('reviewer', 'super_admin'), studentController.reject);

export default router;
