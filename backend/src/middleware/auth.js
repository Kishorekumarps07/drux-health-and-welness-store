const jwt = require('jsonwebtoken');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const prisma = require('../lib/prisma');
const { jwt: jwtConfig } = require('../config/env');

/**
 * Attempt to verify a token with a given secret.
 * Returns the decoded payload or null on failure.
 */
function tryVerify(token, secret) {
  try {
    return jwt.verify(token, secret);
  } catch {
    return null;
  }
}

/**
 * Verifies the JWT in the Authorization header.
 * Supports both custom-issued JWTs (JWT_SECRET) and
 * Supabase-issued JWTs (SUPABASE_JWT_SECRET).
 * Attaches `req.user` with id, roles, and email.
 */
const protect = asyncHandler(async (req, res, next) => {
  // ── 1. Extract token ────────────────────────────────────────────────────────
  let token;
  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }
  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access.', 401));
  }

  // ── 2. Verify: try custom secret first, then Supabase JWT secret ────────────
  let decoded = tryVerify(token, jwtConfig.secret);
  let isSupabaseToken = false;

  if (!decoded && process.env.SUPABASE_JWT_SECRET) {
    decoded = tryVerify(token, process.env.SUPABASE_JWT_SECRET);
    if (decoded) isSupabaseToken = true;
  }

  if (!decoded) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // ── 3. Resolve user from DB ─────────────────────────────────────────────────
  // Supabase tokens store the user's UUID in `sub`; custom tokens use `id`.
  const userId = decoded.id || decoded.sub;

  if (!userId) {
    return next(new AppError('Invalid token payload. Please log in again.', 401));
  }

  // For Supabase tokens, resolve by supabaseId if available; else fall back to email.
  let user;
  if (isSupabaseToken) {
    const email = decoded.email
      || decoded.user_metadata?.email
      || decoded.app_metadata?.email;

    user = await prisma.user.findFirst({
      where: email ? { email } : { id: userId },
      select: { id: true, email: true, roles: true, isVerified: true },
    });

    // Auto-provision: if a Supabase user authenticated successfully but has no
    // matching row in our DB yet (e.g. first social login), create a minimal record.
    if (!user && email) {
      const name = decoded.user_metadata?.full_name
        || decoded.user_metadata?.name
        || email.split('@')[0];
      const metaRole = decoded.user_metadata?.role || 'CUSTOMER';
      user = await prisma.user.create({
        data: {
          email,
          name,
          roles: [metaRole],
          passwordHash: '', // Supabase handles auth; no local password needed
        },
        select: { id: true, email: true, roles: true, isVerified: true },
      });
    }
  } else {
    user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, roles: true, isVerified: true },
    });
  }

  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = user;
  next();
});

/**
 * Restricts access to specific roles.
 * Must be used after `protect`.
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.some(role => req.user.roles.includes(role))) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

module.exports = { protect, restrictTo };
