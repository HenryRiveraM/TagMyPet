import { Router } from 'express';
import { addVeterinarian, createClinic, decidePetAccess, listClinics, listPetAccessRequests, requestPetAccess, updateClinicStatus } from '../controllers/clinicController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { clinicRules, petAccessDecisionRules, petAccessRules } from '../validators/schemas.js';

export const clinicRoutes = Router();

clinicRoutes.use(protect);
clinicRoutes.get('/', allowRoles('ADMIN', 'OWNER', 'VETERINARIO'), listClinics);
clinicRoutes.post('/', allowRoles('ADMIN', 'VETERINARIO'), clinicRules, validate, createClinic);
clinicRoutes.patch('/:id/status', allowRoles('ADMIN'), updateClinicStatus);
clinicRoutes.post('/:id/veterinarians', allowRoles('ADMIN', 'VETERINARIO'), addVeterinarian);

clinicRoutes.get('/access/requests', allowRoles('ADMIN', 'OWNER', 'VETERINARIO'), listPetAccessRequests);
clinicRoutes.post('/access/requests', allowRoles('VETERINARIO'), petAccessRules, validate, requestPetAccess);
clinicRoutes.patch('/access/requests/:id', allowRoles('ADMIN', 'OWNER'), petAccessDecisionRules, validate, decidePetAccess);
