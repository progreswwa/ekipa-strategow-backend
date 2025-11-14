const morgan = require('morgan');

/**
 * Request logging middleware
 */
const logger = morgan(
  ':method :url :status :res[content-length] - :response-time ms',
  {
    skip: (req, _res) => {
      // Skip logging for health check endpoint
      return req.url === '/health';
    },
  }
);

module.exports = logger;
