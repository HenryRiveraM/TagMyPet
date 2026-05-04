import { Router } from 'express';
import { createMedicalRecord, deleteMedicalRecord, listMedicalRecords } from '../controllers/medicalController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { medicalRules } from '../validators/schemas.js';

export const medicalRoutes = Router();

medicalRoutes.use(protect);
medicalRoutes.get('/pet/:petId', allowRoles('ADMIN', 'OWNER', 'VETERINARIO'), listMedicalRecords);
medicalRoutes.post('/', allowRoles('ADMIN', 'OWNER', 'VETERINARIO'), medicalRules, validate, createMedicalRecord);
medicalRoutes.delete('/:id', allowRoles('ADMIN', 'OWNER', 'VETERINARIO'), deleteMedicalRecord);
