import { Router } from 'express';
import * as familyController from '../controllers/familyController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// Protected: family members belong to the authenticated user.
router.use(requireAuth);

router.get('/', familyController.fetchFamilyMembers);
router.post('/', familyController.createFamilyMember);
router.put('/:id', familyController.updateFamilyMember);
router.delete('/:id', familyController.removeFamilyMember);

export default router;
