import rateLimit from 'express-rate-limit';
import { config } from '../config/index.js';
import { ApiError } from '../utils/ApiError.js';

const rateLimitHandler = (_req, res) => {
  res.status(429).json({
    error: {
      code: 'RATE_LIMITED',
      message: 'Too many requests. Please try again later.',
    },
  });
};

/** General API rate limiter */
export const generalLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.ip,
});

/** Strict auth limiter (5 req/min per IP) */
export const authLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: config.AUTH_RATE_LIMIT_MAX,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  skipSuccessfulRequests: true, // don't count successful logins
});

/** Simulation run limiter (20 req/min per user) */
export const simulationRunLimiter = rateLimit({
  windowMs: config.RATE_LIMIT_WINDOW_MS,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
  handler: rateLimitHandler,
  keyGenerator: (req) => req.user?.id || req.ip,
});
