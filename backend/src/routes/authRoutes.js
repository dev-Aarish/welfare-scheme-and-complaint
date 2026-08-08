import express from 'express';
import { adminLogin } from '../controllers/adminAuthController.js';

const router = express.Router();

// POST /api/auth/admin/login
router.post('/admin/login', adminLogin);

export default router;
