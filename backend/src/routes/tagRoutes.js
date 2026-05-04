import { Router } from 'express';
import { assignTag, createTag, createTagBatch, exportTagsCsv, listTags, updateTagStatus } from '../controllers/tagController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { validate } from '../middleware/validate.js';
import { tagBatchRules, tagRules } from '../validators/schemas.js';

export const tagRoutes = Router();

tagRoutes.use(protect);
tagRoutes.get('/', allowRoles('ADMIN', 'OWNER'), listTags);
tagRoutes.get('/export.csv', allowRoles('ADMIN'), exportTagsCsv);
tagRoutes.post('/', allowRoles('ADMIN'), tagRules, validate, createTag);
tagRoutes.post('/batch', allowRoles('ADMIN'), tagBatchRules, validate, createTagBatch);
tagRoutes.patch('/:code/assign', allowRoles('ADMIN', 'OWNER'), assignTag);
tagRoutes.patch('/:id/status', allowRoles('ADMIN'), updateTagStatus);
