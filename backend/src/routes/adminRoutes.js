import { Router } from 'express';
import { listDeletionRequests, listUsers, resolveDeletionRequest, stats, updateUserStatus } from '../controllers/adminController.js';
import { allowRoles, protect } from '../middleware/auth.js';

export const adminRoutes = Router();

adminRoutes.use(protect, allowRoles('ADMIN'));
adminRoutes.get('/stats', stats);
adminRoutes.get('/users', listUsers);
adminRoutes.patch('/users/:id/status', updateUserStatus);
adminRoutes.get('/deletion-requests', listDeletionRequests);
adminRoutes.patch('/deletion-requests/:id/resolve', resolveDeletionRequest);
