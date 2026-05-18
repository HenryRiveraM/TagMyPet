import { Router } from 'express';
import { createPet, deletePet, getPet, listPets, publicNfcProfile, updatePet } from '../controllers/petController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { upload } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { petRules } from '../validators/schemas.js';

export const petRoutes = Router();

petRoutes.get('/public/:nfcCode', publicNfcProfile);
petRoutes.use(protect);
petRoutes.get('/', allowRoles('ADMIN', 'OWNER', 'VETERINARIO'), listPets);
petRoutes.post('/', allowRoles('ADMIN', 'OWNER'), upload.array('fotos', 5), petRules, validate, createPet);
petRoutes.get('/:id', getPet);
petRoutes.put('/:id', allowRoles('ADMIN', 'OWNER'), upload.array('fotos', 5), updatePet);
petRoutes.delete('/:id', allowRoles('ADMIN', 'OWNER'), deletePet);
