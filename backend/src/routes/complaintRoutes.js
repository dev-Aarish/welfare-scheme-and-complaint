import { Router } from 'express';
import { createComplaint } from '../controllers/complaintController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/', requireAuth, createComplaint);

export default router;
