import bcrypt from 'bcryptjs';
import { prisma } from '../config/prismaClient.js';
import { signToken } from '../utils/jwtUtils.js';
import { ensureAdminUser } from '../seeders/adminSeeder.js';

// Default admin bootstrap credentials. Used for the dev/offline fallback AND
// to self-heal an admin row whose password hash is missing or malformed —
// previously such a row short-circuited login to a permanent
// "Invalid email or password" (the fallback was never reached).
const DEFAULT_ADMIN_EMAIL = 'admin@sevanest.gov.in';
const DEFAULT_ADMIN_PASSWORD = 'Admin@123!';

function isDefaultAdminCredentials(email, password) {
  return email === DEFAULT_ADMIN_EMAIL && password === DEFAULT_ADMIN_PASSWORD;
}

/** A well-formed bcrypt hash is `$2a|2b|2y$<cost>$<53 chars>`. Anything else
 *  (e.g. a NULL, truncated, or hand-typed value) is unusable and must be
 *  repaired before it can silently lock the admin out. */
function isValidBcryptHash(hash) {
  return typeof hash === 'string' && /^\$2[aby]\$\d{2}\$/.test(hash) && hash.length === 60;
}

/** bcrypt.compare never throws for well-formed hashes, but a malformed stored
 *  value could throw — never let that surface as a 500. */
async function safeCompare(password, hash) {
  try {
    return await bcrypt.compare(password, hash);
  } catch {
    return false;
  }
}

/**
 * POST /api/auth/admin/login
 * Admin login endpoint.
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
    const isDefault = isDefaultAdminCredentials(trimmedEmail, password);

    let user = null;
    try {
      user = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });
    } catch (dbError) {
      console.warn('⚠️ Database query warning during admin login:', dbError.message);
    }

    const hashUsable = user && isValidBcryptHash(user.passwordHash);
    const hashMatches = hashUsable && (await safeCompare(password, user.passwordHash));

    // 1) Normal DB path — a row exists with a usable hash that matches.
    if (hashMatches) {
      if (user.role === 'ADMIN') {
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

      // Default admin email present with a non-admin role → repair below.
      if (!isDefault) {
        return res.status(403).json({
          success: false,
          error: 'Access denied. Admin role required.',
        });
      }
    }

    // 2) Self-healing default-admin path — only when the row is missing or its
    //    stored hash is missing/malformed (never when a *valid* hash simply
    //    differs, which would mean the password was intentionally changed).
    if (isDefault && (!user || !hashUsable)) {
      await ensureAdminUser();

      let adminUser = null;
      try {
        adminUser = await prisma.user.findUnique({
          where: { email: trimmedEmail },
        });
      } catch (dbError) {
        console.warn('⚠️ Re-query after self-heal failed:', dbError.message);
      }

      // If the database is unreachable, still allow the dev/offline fallback.
      const fallbackAdmin = adminUser ?? {
        id: 'admin-dev-id-1',
        fullName: 'System Administrator',
        email: DEFAULT_ADMIN_EMAIL,
        role: 'ADMIN',
      };

      const token = signToken({
        id: fallbackAdmin.id,
        name: fallbackAdmin.fullName,
        email: fallbackAdmin.email,
        role: 'ADMIN',
      });

      return res.status(200).json({
        token,
        admin: {
          id: fallbackAdmin.id,
          name: fallbackAdmin.fullName,
          email: fallbackAdmin.email,
          role: 'ADMIN',
        },
      });
    }

    // 3) Credentials that match neither a valid DB row nor the default admin.
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
