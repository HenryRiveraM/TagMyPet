import { Router } from 'express';
import { applyToAdoption, closeAdoption, completeFollowUp, createAdoption, decideApplication, listAdoptions, listApplications } from '../controllers/adoptionController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { adoptionDecisionRules, adoptionFollowUpRules, adoptionRules, applicationRules } from '../validators/schemas.js';

export const adoptionRoutes = Router();

adoptionRoutes.get('/', listAdoptions);
adoptionRoutes.post('/', protect, allowRoles('ADMIN', 'OWNER'), adoptionRules, validate, createAdoption);
adoptionRoutes.post('/:id/apply', protect, allowRoles('ADMIN', 'OWNER'), applicationRules, validate, applyToAdoption);
adoptionRoutes.get('/applications', protect, allowRoles('ADMIN', 'OWNER'), listApplications);
adoptionRoutes.patch('/applications/:id/status', protect, allowRoles('ADMIN', 'OWNER'), adoptionDecisionRules, validate, decideApplication);
adoptionRoutes.patch('/applications/:id/follow-ups/:days', protect, allowRoles('ADMIN', 'OWNER'), adoptionFollowUpRules, validate, completeFollowUp);
adoptionRoutes.patch('/:id/close', protect, allowRoles('ADMIN', 'OWNER'), closeAdoption);
