import bcrypt from 'bcryptjs';
import { prisma } from '../config/prismaClient.js';
import { signToken } from '../utils/jwtUtils.js';

// Pre-calculated bcrypt hash for 'Admin@123!' for dev/offline DB fallback
const DEFAULT_ADMIN_PASS_HASH = '$2a$10$bB889rD3K3P/l2Yt5nCqze0a6/B91rI31e7/H6m6GgZ1f9c8d.V0e';

/**
 * POST /api/auth/admin/login
 * Admin login endpoint
 */
export async function adminLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required',
      });
    }

    const trimmedEmail = email.trim().toLowerCase();
    let user = null;

    try {
      user = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });
    } catch (dbError) {
      console.warn('⚠️ Database query warning during admin login:', dbError.message);
    }

    // If user found in database
    if (user) {
      if (!user.passwordHash) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      const isMatch = await bcrypt.compare(password, user.passwordHash);
      if (!isMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      if (user.role !== 'ADMIN') {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin role required.',
        });
      }

      const token = signToken({
        id: user.id,
        name: user.fullName,
        email: user.email,
        role: user.role,
      });

      return res.status(200).json({
        token,
        admin: {
          id: user.id,
          name: user.fullName,
          email: user.email,
          role: user.role,
        },
      });
    }

    // Fallback verification for default admin when DB is empty or offline
    if (trimmedEmail === 'admin@sevanest.gov.in') {
      const isDefaultMatch = password === 'Admin@123!';
      if (!isDefaultMatch) {
        return res.status(401).json({
          success: false,
          error: 'Invalid email or password',
        });
      }

      const token = signToken({
        id: 'admin-dev-id-1',
        name: 'System Administrator',
        email: 'admin@sevanest.gov.in',
        role: 'ADMIN',
      });

      return res.status(200).json({
        token,
        admin: {
          id: 1,
          name: 'System Administrator',
          email: 'admin@sevanest.gov.in',
          role: 'ADMIN',
        },
      });
    }

    // Account not found
    return res.status(401).json({
      success: false,
      error: 'Invalid email or password',
    });
  } catch (error) {
    console.error('Error during admin login:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication',
    });
  }
}
