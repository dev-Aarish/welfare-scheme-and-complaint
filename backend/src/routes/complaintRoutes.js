import { Router } from 'express';
import { createComplaint } from '../controllers/complaintController.js';
import { optionalAuth } from '../middleware/authMiddleware.js';

const router = Router();

// open endpoint: signed-in citizens and anonymous reporters can both file.
router.post('/', optionalAuth, createComplaint);

export default router;
