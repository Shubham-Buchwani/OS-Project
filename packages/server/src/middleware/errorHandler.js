import { logger } from '../utils/logger.js';
import { isDev } from '../config/index.js';

/**
 * Central Express error handler.
 * Must have 4 arguments to be recognized as error middleware.
 */
// eslint-disable-next-line no-unused-vars
export function errorHandler(err, req, res, next) {
  // Generate a request-level trace ID if not already set
  const requestId = req.id || 'unknown';

  // Operational errors (ApiError instances) — known, expected failures
  if (err.isOperational) {
    logger.warn({ err, requestId }, `Operational error: ${err.message}`);
    return res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
        ...(err.details.length > 0 && { details: err.details }),
        requestId,
      },
    });
  }

  // Mongoose validation errors
  if (err.name === 'ValidationError') {
    const details = Object.values(err.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    logger.warn({ err, requestId }, 'Mongoose validation error');
    return res.status(400).json({
      error: { code: 'VALIDATION_ERROR', message: 'Validation failed', details, requestId },
    });
  }

  // Mongoose duplicate key error
  if (err.code === 11000) {
    const field = Object.keys(err.keyPattern)[0];
    logger.warn({ err, requestId }, 'Duplicate key error');
    return res.status(409).json({
      error: { code: 'CONFLICT', message: `${field} already exists`, requestId },
    });
  }

  // JWT errors (should be caught by authenticate middleware, but just in case)
  if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
    return res.status(401).json({
      error: { code: 'UNAUTHORIZED', message: 'Invalid or expired token', requestId },
    });
  }

  // Programmer errors / unknown errors
  logger.error({ err, requestId }, 'Unhandled server error');
  return res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: isDev ? err.message : 'Something went wrong. Please try again.',
      ...(isDev && { stack: err.stack }),
      requestId,
    },
  });
}
