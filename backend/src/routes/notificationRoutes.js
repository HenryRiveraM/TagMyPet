import { Router } from 'express';
import { listNotifications, readAllNotifications, readNotification, unreadNotifications } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

export const notificationRoutes = Router();

notificationRoutes.use(protect);
notificationRoutes.get('/', listNotifications);
notificationRoutes.get('/unread-count', unreadNotifications);
notificationRoutes.patch('/read-all', readAllNotifications);
notificationRoutes.patch('/:id/read', readNotification);
