const jwt = require('jsonwebtoken');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const prisma = require('../lib/prisma');
const supabase = require('../lib/supabase');
const { jwt: jwtConfig } = require('../config/env');
const logger = require('../config/logger');

/**
 * Verifies the JWT in the Authorization header.
 * Supports:
 * 1. Custom-issued JWTs (verified via JWT_SECRET)
 * 2. Supabase-issued JWTs (verified via Supabase API getUser)
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

  let userPayload = null;
  let isSupabaseToken = false;

  // ── 2. Strategy A: Try custom JWT secret ────────────────────────────────────
  try {
    userPayload = jwt.verify(token, jwtConfig.secret);
  } catch (err) {
    // If custom verification fails, we'll try Strategy B
    userPayload = null;
  }

  // ── 3. Strategy B: Try Supabase API verification ────────────────────────────
  if (!userPayload) {
    try {
      const { data, error } = await supabase.auth.getUser(token);
      if (!error && data.user) {
        userPayload = data.user;
        isSupabaseToken = true;
      }
    } catch (err) {
      logger.error('Supabase auth bridge failed:', err);
    }
  }

  if (!userPayload) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  // ── 4. Resolve user from local database ──────────────────────────────────────
  const userId = isSupabaseToken ? userPayload.id : (userPayload.id || userPayload.sub);
  const email = isSupabaseToken ? userPayload.email : userPayload.email;

  let user = await prisma.user.findFirst({
    where: { 
      OR: [
        { id: userId },
        { email: email }
      ]
    },
    select: { id: true, email: true, roles: true, isVerified: true },
  });

  // ── 5. Auto-provisioning (Mission Critical) ──────────────────────────────────
  // If a Supabase user is valid but not in our local DB yet, create them.
  if (!user && isSupabaseToken && email) {
    const name = userPayload.user_metadata?.full_name 
      || userPayload.user_metadata?.name 
      || email.split('@')[0];
    
    const metaRole = userPayload.user_metadata?.role || 'CUSTOMER';

    try {
      user = await prisma.user.create({
        data: {
          id: userId, // Use same UUID for consistency
          email,
          name,
          roles: [metaRole],
          passwordHash: 'SUPABASE_AUTH', // Mark as managed by Supabase
          isVerified: true
        },
        select: { id: true, email: true, roles: true, isVerified: true },
      });
      logger.info(`Auto-provisioned user ${email} from Supabase token.`);
    } catch (createErr) {
      logger.error('Auto-provisioning failed:', createErr);
    }
  }

  if (!user) {
    return next(new AppError('The user belonging to this token no longer exists.', 401));
  }

  req.user = user;
  next();
});

const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.some(role => req.user.roles.includes(role))) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

module.exports = { protect, restrictTo };
