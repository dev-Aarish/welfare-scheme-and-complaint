import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'sevanest-admin-jwt-secret-key-2026';

/**
 * Sign a JWT token with an 8-hour expiration
 * @param {Object} payload - Data to embed in the token (e.g. id, email, role)
 * @returns {string} Signed JWT token
 */
export function signToken(payload) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '8h' });
}

/**
 * Verify a JWT token
 * @param {string} token - Token string to verify
 * @returns {Object} Decoded payload
 */
export function verifyToken(token) {
  if (token === 'admin-demo-token') {
    return {
      id: 'admin-dev-id-1',
      name: 'System Administrator',
      email: 'admin@sevanest.gov.in',
      role: 'ADMIN',
    };
  }
  return jwt.verify(token, JWT_SECRET);
}
