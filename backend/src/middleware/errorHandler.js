const logger = require('../config/logger');

/**
 * Centralized error handling middleware.
 * Handles Prisma errors, JWT errors, validation errors, and operational errors.
 */
const errorHandler = (err, req, res, next) => {
  let statusCode = err.statusCode || 500;
  let message = err.message || 'Internal Server Error';

  // ── Prisma Known Request Errors ───────────────────────────────────────────
  if (err.code === 'P2002') {
    // Unique constraint violation
    const field = err.meta?.target?.[0] || 'field';
    statusCode = 409;
    message = `A record with this ${field} already exists.`;
  } else if (err.code === 'P2025') {
    // Record not found
    statusCode = 404;
    message = err.meta?.cause || 'Record not found.';
  } else if (err.code === 'P2003') {
    // Foreign key constraint
    statusCode = 400;
    message = 'Invalid reference: related record does not exist.';
  }

  // ── JWT Errors ────────────────────────────────────────────────────────────
  if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    message = 'Invalid token. Please log in again.';
  }
  if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    message = 'Your session has expired. Please log in again.';
  }

  // ── Validation Errors ─────────────────────────────────────────────────────
  if (err.name === 'ZodError') {
    statusCode = 422;
    message = 'Validation failed';
    return res.status(statusCode).json({
      status: 'fail',
      message,
      errors: err.errors.map((e) => ({
        field: e.path.join('.'),
        message: e.message,
      })),
    });
  }

  // ── Non-operational (programming) errors ────────────────────────────────
  if (!err.isOperational || statusCode >= 500) {
    logger.error(`[CRITICAL] HTTP ${statusCode} | ${req.method} ${req.originalUrl}`, {
       message: err.message,
       stack: err.stack,
       body: req.body,
    });
    
    if (process.env.NODE_ENV === 'production') {
      message = 'Something went wrong on our end. Please try again later.';
      statusCode = 500;
    }
  }

  // ── Final JSON Response ───────────────────────────────────────────────────
  const response = {
    status: `${statusCode}`.startsWith('4') ? 'fail' : 'error',
    message,
    ...(statusCode === 422 && err.name === 'ZodError' && { 
      errors: err.errors.map(e => ({ field: e.path.join('.'), message: e.message })) 
    }),
    ...(process.env.NODE_ENV === 'development' && { 
      stack: err.stack,
      error: err
    }),
  };

  res.status(statusCode).json(response);
};

module.exports = errorHandler;
