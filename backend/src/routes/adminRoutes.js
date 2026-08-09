import express from 'express';
import { getDashboardStats } from '../controllers/adminDashboardController.js';
import {
  getComplaints,
  getComplaintById,
  assignComplaint,
  updateComplaintStatus,
  addComplaintRemark,
  createAdminInquiry,
  getWorkflowMeta,
  triggerManualEscalationCheck,
} from '../controllers/adminComplaintController.js';
import { authenticate, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// GET /api/admin/dashboard - Requires authentication and ADMIN role
router.get('/dashboard', authenticate, requireAdmin, getDashboardStats);

// GET /api/admin/complaints - Paginated, searchable, filterable complaint list
router.get('/complaints', authenticate, requireAdmin, getComplaints);

// GET /api/admin/workflow/meta - Workflow metadata for departments & officers
router.get('/workflow/meta', authenticate, requireAdmin, getWorkflowMeta);

// POST /api/admin/escalations/check - Manual trigger for overdue escalation check
router.post('/escalations/check', authenticate, requireAdmin, triggerManualEscalationCheck);

// GET /api/admin/complaints/:id - Single complaint detail view
router.get('/complaints/:id', authenticate, requireAdmin, getComplaintById);

// PATCH /api/admin/complaints/:id/assignment - Assign department/officer
router.patch('/complaints/:id/assignment', authenticate, requireAdmin, assignComplaint);

// PATCH /api/admin/complaints/:id/status - Update status with audit log
router.patch('/complaints/:id/status', authenticate, requireAdmin, updateComplaintStatus);

// POST /api/admin/complaints/:id/remarks - Add admin remark
router.post('/complaints/:id/remarks', authenticate, requireAdmin, addComplaintRemark);

// POST /api/admin/complaints/:id/inquiries - Ask citizen for more info
router.post('/complaints/:id/inquiries', authenticate, requireAdmin, createAdminInquiry);

export default router;
