import { verifyToken } from '../utils/jwtUtils.js';

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
