import { Router } from 'express';
import * as familyController from '../controllers/familyController.js';

const router = Router();

router.get('/', familyController.fetchFamilyMembers);
router.post('/', familyController.createFamilyMember);
router.put('/:id', familyController.updateFamilyMember);
router.delete('/:id', familyController.removeFamilyMember);

export default router;
