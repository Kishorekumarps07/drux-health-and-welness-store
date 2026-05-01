const jwt = require('jsonwebtoken');
const AppError = require('../lib/AppError');
const asyncHandler = require('../lib/asyncHandler');
const prisma = require('../lib/prisma');
const { jwt: jwtConfig } = require('../config/env');

/**
 * Verifies the JWT in the Authorization header.
 * Attaches `req.user` with id, roles, and email.
 */
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer ')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return next(new AppError('You are not logged in. Please log in to access.', 401));
  }

  let decoded;
  try {
    decoded = jwt.verify(token, jwtConfig.secret);
  } catch (err) {
    return next(new AppError('Invalid or expired token. Please log in again.', 401));
  }

  const user = await prisma.user.findUnique({
    where: { id: decoded.id },
    select: { id: true, email: true, roles: true, isVerified: true },
  });

  if (!user) {
    return next(new AppError('The user for this token no longer exists.', 401));
  }

  req.user = user;
  next();
});

/**
 * Restricts access to specific roles.
 * Must be used after `protect`.
 * @param {...string} roles - e.g. 'ADMIN', 'VENDOR'
 */
const restrictTo = (...roles) => (req, res, next) => {
  if (!roles.some(role => req.user.roles.includes(role))) {
    return next(new AppError('You do not have permission to perform this action.', 403));
  }
  next();
};

module.exports = { protect, restrictTo };
