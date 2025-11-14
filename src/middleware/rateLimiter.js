const rateLimit = require('express-rate-limit');

/**
 * Rate limiter middleware using express-rate-limit
 * @module middleware/rateLimiter
 */

/**
 * General API rate limiter - 100 requests per minute
 */
const apiLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // 100 requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many requests, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable `X-RateLimit-*` headers
  handler: (req, res) => {
    console.warn('⚠️  Rate limit exceeded:', req.ip);
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: req.rateLimit.resetTime,
      },
    });
  },
});

/**
 * Stricter rate limiter for resource-intensive endpoints
 * 10 requests per minute
 */
const strictLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // 10 requests per minute
  message: {
    success: false,
    error: {
      message: 'Too many requests for this endpoint, please try again later',
      code: 'RATE_LIMIT_EXCEEDED',
    },
  },
  standardHeaders: true,
  legacyHeaders: false,
  handler: (req, res) => {
    console.warn('⚠️  Strict rate limit exceeded:', req.ip, req.path);
    res.status(429).json({
      success: false,
      error: {
        message: 'Too many requests for this endpoint, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
        retryAfter: req.rateLimit.resetTime,
      },
    });
  },
});

/**
 * Create custom rate limiter with specific options
 * @param {Object} options - Rate limiter options
 * @returns {Function} Rate limiter middleware
 */
function createLimiter(options = {}) {
  return rateLimit({
    windowMs: options.windowMs || 60 * 1000,
    max: options.max || 100,
    message: options.message || {
      success: false,
      error: {
        message: 'Too many requests, please try again later',
        code: 'RATE_LIMIT_EXCEEDED',
      },
    },
    standardHeaders: true,
    legacyHeaders: false,
  });
}

module.exports = {
  apiLimiter,
  strictLimiter,
  createLimiter,
};
