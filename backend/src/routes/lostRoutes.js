import { Router } from 'express';
import { createLostReport, createSighting, listSightings, markFound, publicLostReports } from '../controllers/lostController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { lostRules, sightingRules } from '../validators/schemas.js';

export const lostRoutes = Router();

lostRoutes.get('/', publicLostReports);
lostRoutes.post('/:id/sightings', sightingRules, validate, createSighting);
lostRoutes.get('/:id/sightings', protect, allowRoles('ADMIN', 'OWNER'), listSightings);
lostRoutes.post('/', protect, allowRoles('ADMIN', 'OWNER'), lostRules, validate, createLostReport);
lostRoutes.patch('/:id/found', protect, allowRoles('ADMIN', 'OWNER'), markFound);
