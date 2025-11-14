/**
 * Authentication middleware with API key validation
 * @module middleware/auth
 */

/**
 * Validate API key from request headers
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function validateApiKey(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');

  // Skip auth for health check endpoint
  if (req.path === '/api/health') {
    return next();
  }

  const validApiKey = process.env.API_KEY;

  // If no API key is configured, allow all requests (dev mode)
  if (!validApiKey) {
    console.warn('⚠️  API key not configured, allowing all requests');
    return next();
  }

  // Check if API key is provided
  if (!apiKey) {
    return res.status(401).json({
      success: false,
      error: {
        message: 'API key is required',
        code: 'MISSING_API_KEY',
      },
    });
  }

  // Validate API key
  if (apiKey !== validApiKey) {
    console.warn('⚠️  Invalid API key attempt:', apiKey.substring(0, 8) + '...');
    return res.status(403).json({
      success: false,
      error: {
        message: 'Invalid API key',
        code: 'INVALID_API_KEY',
      },
    });
  }

  // API key is valid, proceed
  next();
}

/**
 * Optional authentication - doesn't fail if no key provided
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 * @param {Function} next - Express next middleware function
 */
function optionalAuth(req, res, next) {
  const apiKey = req.headers['x-api-key'] || req.headers['authorization']?.replace('Bearer ', '');
  const validApiKey = process.env.API_KEY;

  if (apiKey && validApiKey && apiKey === validApiKey) {
    req.authenticated = true;
  } else {
    req.authenticated = false;
  }

  next();
}

module.exports = {
  validateApiKey,
  optionalAuth,
};
