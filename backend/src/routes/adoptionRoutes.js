import { Router } from 'express';
import { applyToAdoption, createAdoption, listAdoptions, listApplications } from '../controllers/adoptionController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adoptionRules, applicationRules } from '../validators/schemas.js';

export const adoptionRoutes = Router();

adoptionRoutes.get('/', listAdoptions);
adoptionRoutes.post('/', protect, allowRoles('ADMIN', 'OWNER'), adoptionRules, validate, createAdoption);
adoptionRoutes.post('/:id/apply', protect, allowRoles('ADOPTANTE', 'ADMIN'), applicationRules, validate, applyToAdoption);
adoptionRoutes.get('/applications', protect, allowRoles('ADMIN', 'OWNER'), listApplications);
