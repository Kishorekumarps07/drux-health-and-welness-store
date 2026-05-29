const jwt = require('jsonwebtoken');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const prisma = require('../lib/prisma');
const supabase = require('../lib/supabase');
const { jwt: jwtConfig } = require('../config/env');
const logger = require('../config/logger');
const Cache = require('../lib/cache');

// Collapsed promise cache for Supabase token verification to prevent parallel rate limits and speed up performance
const tokenVerificationCache = new Map(); // token -> { promise, expiresAt }
const CACHE_DURATION = 30 * 1000; // Cache verification for 30 seconds

const verifySupabaseTokenCached = async (token) => {
  const now = Date.now();
  const cached = tokenVerificationCache.get(token);
  
  if (cached && cached.expiresAt > now) {
    return cached.promise;
  }

  // Create the verification promise
  const verificationPromise = (async () => {
    let supabaseTimeout;
    const timeoutPromise = new Promise((_, reject) => {
      supabaseTimeout = setTimeout(() => reject(new Error('AbortError')), 10000);
    });
    
    try {
      const getUserPromise = supabase.auth.getUser(token);
      const { data, error } = await Promise.race([getUserPromise, timeoutPromise]);
      
      if (supabaseTimeout) clearTimeout(supabaseTimeout);
      
      if (error) {
        logger.error('Supabase auth bridge returned error:', error);
        throw error;
      }
      
      if (!data.user) {
        throw new Error('User not found in Supabase session');
      }
      
      return data.user;
    } catch (err) {
      if (supabaseTimeout) clearTimeout(supabaseTimeout);
      throw err;
    }
  })();

  // Store the promise in cache
  tokenVerificationCache.set(token, {
    promise: verificationPromise,
    expiresAt: now + CACHE_DURATION
  });

  // Catch errors in the cache so we don't store a permanently rejected promise
  verificationPromise.catch(() => {
    tokenVerificationCache.delete(token);
  });

  return verificationPromise;
};

// Collapsed promise cache for user database resolution to prevent database pooler saturation
const userResolutionCache = new Map(); // token -> { promise, expiresAt }
const USER_CACHE_DURATION = 15; // Cache user resolution for 15 seconds

const clearAuthUserCache = async () => {
  userResolutionCache.clear();
  try {
    await Cache.clearPattern('auth:user:*');
  } catch (err) {
    // Suppress potential invalidation errors
  }
};

const resolveUserCached = async (token, userId, email, isSupabaseToken, userPayload) => {
  const now = Date.now();
  const cachedLocal = userResolutionCache.get(token);
  
  if (cachedLocal && cachedLocal.expiresAt > now) {
    return cachedLocal.promise;
  }

  // Create user resolution promise
  const resolutionPromise = (async () => {
    // Check central cache (Redis or central memory) first
    const cachedCentral = await Cache.get(`auth:user:${token}`);
    if (cachedCentral) {
      return cachedCentral;
    }

    // ── 1. Resolve user from local database using fast findUnique index queries ─────
    let user;
    if (userId) {
      user = await prisma.user.findUnique({
        where: { id: userId },
        select: { 
          id: true, 
          email: true, 
          roles: true, 
          isVerified: true,
          vendor: {
            select: { approvalStatus: true }
          }
        },
      });
    }
    
    if (!user && email) {
      user = await prisma.user.findUnique({
        where: { email: email },
        select: { 
          id: true, 
          email: true, 
          roles: true, 
          isVerified: true,
          vendor: {
            select: { approvalStatus: true }
          }
        },
      });
    }

    // ── 2. Auto-provisioning (Mission Critical) ──────────────────────────────────
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
          select: { 
            id: true, 
            email: true, 
            roles: true, 
            isVerified: true,
            vendor: {
              select: { approvalStatus: true }
            }
          },
        });
        logger.info(`Auto-provisioned user ${email} from Supabase token.`);
      } catch (createErr) {
        logger.error('Auto-provisioning failed:', createErr);
      }
    }

    if (!user) {
      throw new AppError('The user belonging to this token no longer exists.', 401);
    }

    // Save to central cache
    await Cache.set(`auth:user:${token}`, user, USER_CACHE_DURATION);

    return user;
  })();

  // Store resolved user promise in local collapsed cache
  userResolutionCache.set(token, {
    promise: resolutionPromise,
    expiresAt: now + (USER_CACHE_DURATION * 1000)
  });

  // Catch errors so we don't store permanently rejected promises
  resolutionPromise.catch(() => {
    userResolutionCache.delete(token);
  });

  return resolutionPromise;
};

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

  // ── 3. Strategy B: Try Supabase API verification (with timeout) ─────────────
  if (!userPayload) {
    try {
      userPayload = await verifySupabaseTokenCached(token);
      isSupabaseToken = true;
    } catch (err) {
      if (err.message === 'AbortError') {
        logger.warn('Supabase auth bridge timed out after 10s — backend waking up.');
        return next(new AppError('Authentication server is waking up. Please try again in a few seconds.', 504));
      } else {
        logger.error('Supabase auth bridge failed:', err);
      }
    }
  }

  if (!userPayload) {
    let message = 'Invalid or expired token. Please log in again.';
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_ROLE_KEY) {
      message = 'Backend is not fully configured (Missing Supabase Keys). Please contact administrator.';
    }
    return next(new AppError(message, 401));
  }

  // ── 4. Resolve user from local database ──────────────────────────────────────
  const userId = isSupabaseToken ? userPayload.id : (userPayload.id || userPayload.sub);
  const email = isSupabaseToken ? userPayload.email : userPayload.email;

  // Resolve user via the optimized caching resolution helper
  const user = await resolveUserCached(token, userId, email, isSupabaseToken, userPayload);

  // Debug log for roles
  logger.info(`Auth: User ${user.email} accessing ${req.originalUrl} with roles: ${JSON.stringify(user.roles)}`);

  req.user = user;
  next();
});

const restrictTo = (...roles) => (req, res, next) => {
  // 1. Basic Role Check
  if (!roles.some(role => req.user.roles.includes(role))) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }

  // 2. Strict Vendor Status Check
  // If the user has a VENDOR role and isn't an ADMIN, they MUST be ACTIVE to proceed
  if (req.user.roles.includes('VENDOR') && !req.user.roles.includes('ADMIN')) {
    const status = req.user.vendor?.approvalStatus;
    if (status !== 'ACTIVE' && status !== 'APPROVED') {
      return next(new AppError('Access denied. Your vendor account is currently pending approval or suspended.', 403));
    }
  }

  next();
};

module.exports = { protect, restrictTo, clearAuthUserCache };
