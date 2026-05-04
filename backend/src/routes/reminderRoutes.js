import { Router } from 'express';
import { createReminder, listReminders, sendReminderNotifications, toggleReminder } from '../controllers/reminderController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { reminderRules } from '../validators/schemas.js';

export const reminderRoutes = Router();

reminderRoutes.use(protect);
reminderRoutes.get('/', allowRoles('ADMIN', 'OWNER'), listReminders);
reminderRoutes.post('/send-notifications', allowRoles('ADMIN'), sendReminderNotifications);
reminderRoutes.post('/', allowRoles('ADMIN', 'OWNER'), reminderRules, validate, createReminder);
reminderRoutes.patch('/:id/toggle', allowRoles('ADMIN', 'OWNER'), toggleReminder);
