import { Router } from 'express';
import { list } from '../controllers/auditController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/', requireAuth, requireRole('admin'), list);

export default router;
