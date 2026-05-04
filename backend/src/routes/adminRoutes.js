import { Router } from 'express';
import { listUsers, stats, updateUserStatus } from '../controllers/adminController.js';
import { allowRoles, protect } from '../middleware/auth.js';

export const adminRoutes = Router();

adminRoutes.use(protect, allowRoles('ADMIN'));
adminRoutes.get('/stats', stats);
adminRoutes.get('/users', listUsers);
adminRoutes.patch('/users/:id/status', updateUserStatus);
