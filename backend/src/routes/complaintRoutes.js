import { Router } from 'express';
import { createComplaint, getMyComplaints } from '../controllers/complaintController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// open endpoint: signed-in citizens and anonymous reporters can both file.
router.post('/', optionalAuth, createComplaint);

// signed-in citizen's own complaints (for the overview tracking list).
router.get('/', requireAuth, getMyComplaints);

export default router;
