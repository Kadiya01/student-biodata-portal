import { Router } from 'express';
import * as notificationController from '../controllers/notificationController';
import { requireAuth } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, notificationController.list);
router.put('/:id/read', requireAuth, notificationController.markRead);
router.put('/read-all', requireAuth, notificationController.markAllRead);

export default router;
