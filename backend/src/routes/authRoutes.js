import { Router } from 'express';
import { changePassword, forgotPassword, login, me, register, requestAccountDeletion, resendVerification, resetPassword, updateProfile, verifyEmail } from '../controllers/authController.js';
import { protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { changePasswordRules, deletionRequestRules, forgotPasswordRules, loginRules, profileRules, registerRules, resetPasswordRules } from '../validators/schemas.js';

export const authRoutes = Router();

authRoutes.post('/register', registerRules, validate, register);
authRoutes.post('/login', loginRules, validate, login);
authRoutes.get('/me', protect, me);
authRoutes.put('/me', protect, upload.single('avatar'), profileRules, validate, updateProfile);
authRoutes.patch('/password', protect, changePasswordRules, validate, changePassword);
authRoutes.post('/deletion-request', protect, deletionRequestRules, validate, requestAccountDeletion);
authRoutes.post('/forgot-password', forgotPasswordRules, validate, forgotPassword);
authRoutes.post('/reset-password/:token', resetPasswordRules, validate, resetPassword);
authRoutes.get('/verify-email/:token', verifyEmail);
authRoutes.post('/resend-verification', protect, resendVerification);
