import { Router } from 'express';
import health from './health';
import auth from './auth';

const router = Router();
router.use('/health', health);
router.use('/auth', auth);

export default router;
