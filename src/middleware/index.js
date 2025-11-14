const { errorHandler, asyncHandler, notFoundHandler } = require('./errorHandler');
const validateRequest = require('./validateRequest');
const logger = require('./logger');
const { validateApiKey, optionalAuth } = require('./auth');
const { apiLimiter, strictLimiter, createLimiter } = require('./rateLimiter');

module.exports = {
  errorHandler,
  asyncHandler,
  notFoundHandler,
  validateRequest,
  logger,
  validateApiKey,
  optionalAuth,
  apiLimiter,
  strictLimiter,
  createLimiter,
};
