import { verifyToken } from '../utils/jwtUtils.js';
import { prisma } from '../config/prismaClient.js';
import { supabase, supabaseEnabled } from '../config/supabaseClient.js';

/**
 * Middleware to authenticate requests using JWT Bearer token.
 * Rejects missing/invalid/expired tokens with 401.
 */
export function authenticate(req, res, next) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Missing or malformed token.',
      });
    }

    const token = authHeader.split(' ')[1];
    if (!token) {
      return res.status(401).json({
        success: false,
        error: 'Authentication required. Token is missing.',
      });
    }

    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired authentication token.',
    });
  }
}

/**
 * Middleware to restrict access to ADMIN role users only.
 * Rejects non-admin users with 403.
 */
export function requireAdmin(req, res, next) {
  if (!req.user || req.user.role !== 'ADMIN') {
    return res.status(403).json({
      success: false,
      error: 'Forbidden. Admin access required.',
    });
  }
  next();
}

/**
 * Verifies the Supabase JWT from the `Authorization: Bearer <token>` header,
 * then upserts the matching local User row so the rest of the app can rely on
 * the existing Prisma User model (family members, profile, etc.).
 *
 * req.user = { supabaseId, role, localUser } once authenticated.
 */
export async function requireAuth(req, res, next) {
  if (!supabaseEnabled) {
    // Dev fallback: no Supabase project configured — treat request as a
    // guest citizen so scheme browsing keeps working during development.
    req.user = {
      supabaseId: null,
      role: 'CITIZEN',
      localUser: null,
    };
    return next();
  }

  const header = req.headers.authorization || '';
  const token = header.startsWith('Bearer ') ? header.slice(7) : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: 'Authentication required: missing Authorization header.',
    });
  }

  let userClaims;
  try {
    const { data, error } = await supabase.auth.getUser(token);
    if (error) throw error;
    userClaims = data.user;
  } catch (error) {
    console.error('Supabase token verification failed:', error.message);
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token.',
    });
  }

  if (!userClaims) {
    return res.status(401).json({
      success: false,
      error: 'Invalid or expired session token.',
    });
  }

  const role = (userClaims.app_metadata?.role || userClaims.user_metadata?.role || 'citizen').toUpperCase();

  const fullName =
    userClaims.user_metadata?.fullName ||
    userClaims.user_metadata?.name ||
    userClaims.email ||
    'Citizen';

  // Sync the Supabase identity into the local Prisma user table. This cannot
  // be a single `upsert(where: { supabaseId })`: a local row may already exist
  // for the same email (with a null/different supabase_id) and that would
  // collide on the `email` unique index. Resolve the target row by id first.
  let localUser;
  try {
    localUser =
      (await prisma.user.findUnique({ where: { supabaseId: userClaims.id } })) ||
      (userClaims.email &&
        (await prisma.user.findUnique({ where: { email: userClaims.email } })));

    if (localUser) {
      localUser = await prisma.user.update({
        where: { id: localUser.id },
        data: {
          supabaseId: userClaims.id,
          email: userClaims.email ?? undefined,
          phone: userClaims.phone ?? undefined,
          fullName,
          role,
        },
      });
    } else {
      localUser = await prisma.user.create({
        data: {
          supabaseId: userClaims.id,
          email: userClaims.email,
          phone: userClaims.phone,
          fullName,
          role,
        },
      });
    }
  } catch (error) {
    console.error('Local user sync failed:', error.message);
    return res.status(500).json({
      success: false,
      error: 'Failed to sync user profile.',
    });
  }

  req.user = {
    supabaseId: userClaims.id,
    role,
    localUser,
  };

  return next();
}

/** Like requireAuth, but only lets officers (and admins) through. */
export async function requireOfficer(req, res, next) {
  await requireAuth(req, res, () => {
    if (req.user?.role !== 'OFFICER' && req.user?.role !== 'ADMIN') {
      return res.status(403).json({
        success: false,
        error: 'Forbidden: officer role required.',
      });
    }
    return next();
  });
}
