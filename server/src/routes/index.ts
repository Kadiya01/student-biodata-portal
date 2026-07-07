import { Router } from 'express';
import health from './health';
import auth from './auth';
import students from './students';
import documents from './documents';
import audit from './audit';
import users from './users';

const router = Router();
router.use('/health', health);
router.use('/auth', auth);
router.use('/students', students);
router.use('/documents', documents);
router.use('/audit', audit);
router.use('/users', users);

export default router;
