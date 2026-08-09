import { Router } from 'express';
import {
  createComplaint,
  getMyComplaints,
  trackComplaintSecurely,
  replyToInquiry,
  confirmResolution
} from '../controllers/complaintController.js';
import { optionalAuth, requireAuth } from '../middleware/authMiddleware.js';

const router = Router();

// open endpoint: signed-in citizens and anonymous reporters can both file.
router.post('/', optionalAuth, createComplaint);

// signed-in citizen's own complaints (for the overview tracking list).
router.get('/', requireAuth, getMyComplaints);

// Secure anonymous & authenticated tracking endpoint (Requires Reference ID + Tracking PIN)
router.post('/track', optionalAuth, trackComplaintSecurely);

// Citizen reply to department inquiry
router.post('/:id/inquiries/:inquiryId/reply', optionalAuth, replyToInquiry);

// Citizen resolution confirmation (CLOSE or REOPEN)
router.post('/:id/resolution', optionalAuth, confirmResolution);

export default router;
