import { Router } from 'express';
import { register, login, me, refresh, logout, changePassword } from '../controllers/authController';
import { requireAuth, requireRole } from '../middleware/authMiddleware';
import { validate } from '../middleware/validate';
import { registerSchema, adminRegisterSchema, loginSchema, changePasswordSchema } from '../validation/auth';

const router = Router();
router.post('/register', validate({ body: registerSchema }), register);
router.post('/register-admin', requireAuth, requireRole('super_admin'), validate({ body: adminRegisterSchema }), register);
router.post('/login', validate({ body: loginSchema }), login);
router.post('/refresh', refresh);
router.post('/logout', logout);
router.get('/me', requireAuth, me);
router.post('/change-password', requireAuth, validate({ body: changePasswordSchema }), changePassword);

export default router;
