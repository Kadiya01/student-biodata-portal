import { Router } from 'express';
import * as programmeController from '../controllers/programmeController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';

const router = Router();

router.get('/departments', requireAuth, programmeController.listDepartments);
router.get('/', requireAuth, programmeController.listProgrammes);
router.get('/:id', requireAuth, programmeController.getProgramme);
router.post('/', requireAuth, requireRole('super_admin'), programmeController.createProgramme);
router.put('/:id', requireAuth, requireRole('super_admin'), programmeController.updateProgramme);
router.delete('/:id', requireAuth, requireRole('super_admin'), programmeController.deleteProgramme);

export default router;
