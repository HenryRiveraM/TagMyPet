import { Router } from 'express';
import { forgotPassword, login, me, register, resendVerification, resetPassword, verifyEmail } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { forgotPasswordRules, loginRules, registerRules, resetPasswordRules } from '../validators/schemas.js';

export const authRoutes = Router();

authRoutes.post('/register', registerRules, validate, register);
authRoutes.post('/login', loginRules, validate, login);
authRoutes.get('/me', protect, me);
authRoutes.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
authRoutes.post('/reset-password/:token', resetPasswordRules, validate, resetPassword);
authRoutes.get('/verify-email/:token', verifyEmail);
authRoutes.post('/resend-verification', protect, resendVerification);
