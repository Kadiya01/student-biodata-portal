import { Router } from 'express';
import * as passwordResetController from '../controllers/passwordResetController';
import { validate } from '../middleware/validate';
import { forgotPasswordSchema, resetPasswordSchema } from '../validation/passwordReset';

const router = Router();

router.post('/forgot-password', validate({ body: forgotPasswordSchema }), passwordResetController.forgotPassword);
router.post('/reset-password', validate({ body: resetPasswordSchema }), passwordResetController.resetPassword);

export default router;
