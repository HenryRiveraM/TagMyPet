import { Router } from 'express';
import { createPremiumRequest, decidePremiumRequest, getPremiumReceiptLink, listMyPremiumRequests, listPremiumRequests } from '../controllers/premiumController.js';
import { allowRoles, protect } from '../middleware/auth.js';
import { uploadReceipt } from '../middleware/upload.js';
import { validate } from '../middleware/validate.js';
import { premiumDecisionRules, premiumRequestRules } from '../validators/schemas.js';

export const premiumRoutes = Router();

premiumRoutes.use(protect);
premiumRoutes.get('/me', allowRoles('OWNER'), listMyPremiumRequests);
premiumRoutes.post('/', allowRoles('OWNER'), uploadReceipt.single('receipt'), premiumRequestRules, validate, createPremiumRequest);
premiumRoutes.get('/', allowRoles('ADMIN'), listPremiumRequests);
premiumRoutes.get('/:id/receipt', allowRoles('ADMIN'), getPremiumReceiptLink);
premiumRoutes.patch('/:id/status', allowRoles('ADMIN'), premiumDecisionRules, validate, decidePremiumRequest);
