import { Router } from 'express';
import * as userController from '../controllers/userController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, requireRole('super_admin'), userController.list);
router.put('/:id', requireAuth, requireRole('super_admin'), userController.update);
router.put('/:id/toggle', requireAuth, requireRole('super_admin'), userController.toggleStatus);

export default router;
