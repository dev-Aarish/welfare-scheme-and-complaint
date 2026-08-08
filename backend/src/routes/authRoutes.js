import express from 'express';
import { adminLogin } from '../controllers/adminAuthController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { prisma } from '../config/prismaClient.js';

const router = express.Router();

// POST /api/auth/admin/login
router.post('/admin/login', adminLogin);

/**
 * GET /api/auth/session
 * Validates the bearer token and returns the synced local profile
 * (the frontend calls this right after a Supabase sign-in so the
 * local user row exists and family members can be linked).
 */
router.get('/session', requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      supabaseId: req.user.supabaseId,
      role: req.user.role,
      user: req.user.localUser,
    },
  });
});

/**
 * GET /api/auth/me — alias for /session, kept for convenience.
 */
router.get('/me', requireAuth, (req, res) => {
  return res.status(200).json({
    success: true,
    data: {
      supabaseId: req.user.supabaseId,
      role: req.user.role,
      user: req.user.localUser,
    },
  });
});

/**
 * PUT /api/auth/me
 * Update the local profile (name, state, income etc.) for the current user.
 */
router.put('/me', requireAuth, async (req, res) => {
  try {
    if (!req.user.localUser) {
      return res.status(404).json({
        success: false,
        error: 'No local user row exists for this session.',
      });
    }

    const allowed = [
      'fullName',
      'phone',
      'gender',
      'age',
      'state',
      'casteCategory',
      'annualIncome',
      'occupation',
      'incomeSource',
      'landAcres',
      'village',
      'block',
      'district',
    ];
    const patch = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    if (typeof patch.age === 'string') patch.age = patch.age ? Number(patch.age) : null;
    if (typeof patch.annualIncome === 'string') patch.annualIncome = patch.annualIncome ? Number(patch.annualIncome) : null;
    if (typeof patch.landAcres === 'string') patch.landAcres = patch.landAcres ? Number(patch.landAcres) : null;

    const user = await prisma.user.update({
      where: { id: req.user.localUser.id },
      data: patch,
    });

    return res.status(200).json({ success: true, data: user });
  } catch (error) {
    console.error('Error updating profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to update profile.',
    });
  }
});

/**
 * GET /api/auth/profile — returns the household profile (the user's own
 * profile data plus family members) for scheme matching on the overview.
 */
router.get('/profile', requireAuth, async (req, res) => {
  try {
    if (!req.user.localUser) {
      return res.status(404).json({
        success: false,
        error: 'No local user row exists for this session.',
      });
    }

    const [userProfile, familyMembers] = await Promise.all([
      prisma.user.findUnique({ where: { id: req.user.localUser.id } }),
      prisma.familyMember.findMany({
        where: { userId: req.user.localUser.id },
        orderBy: { createdAt: 'asc' },
      }),
    ]);

    return res.status(200).json({ success: true, data: userProfile, familyMembers });
  } catch (error) {
    console.error('Error fetching profile:', error);
    return res.status(500).json({
      success: false,
      error: 'Failed to fetch profile.',
    });
  }
});

export default router;
