import { verifyAccessToken } from '../utils/tokenHelper.js';
import { ApiError } from '../utils/ApiError.js';
import { User } from '../models/User.js';

/**
 * Verifies JWT access token from Authorization header.
 * Attaches req.user = { id, role, email }
 */
export async function authenticate(req, res, next) {
  try {
    const header = req.headers.authorization;
    if (!header || !header.startsWith('Bearer ')) {
      throw ApiError.unauthorized('No access token provided');
    }
    const token = header.slice(7);
    const payload = verifyAccessToken(token);

    // Lightweight user hydration — avoid DB hit by trusting JWT payload
    req.user = { id: payload.sub, role: payload.role, email: payload.email };
    next();
  } catch (err) {
    next(err);
  }
}

/**
 * RBAC: Restrict routes to specified roles.
 * Usage: authorize('admin') or authorize('instructor', 'admin')
 */
export function authorize(...roles) {
  return (req, res, next) => {
    if (!req.user) return next(ApiError.unauthorized());
    if (!roles.includes(req.user.role)) {
      return next(ApiError.forbidden(`Requires role: ${roles.join(' or ')}`));
    }
    next();
  };
}
