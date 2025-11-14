const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const routes = require('./routes');
const { logger } = require('./middleware');
const { errorHandler, notFoundHandler } = require('./middleware/errorHandler');
const { apiLimiter } = require('./middleware/rateLimiter');
const { validateApiKey } = require('./middleware/auth');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging middleware
app.use(logger);

// Rate limiting
app.use('/api', apiLimiter);

// API authentication (except health endpoint)
app.use('/api', validateApiKey);

// API routes
app.use('/api', routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EKIPA STRATEGÓW Backend API',
    version: config.apiVersion,
    endpoints: {
      health: '/api/health',
      brief: '/api/brief',
      deploy: '/api/deploy',
      status: '/api/status/:jobId',
    },
    documentation: 'https://github.com/progreswwa/ekipa-strategow-backend',
  });
});

// 404 handler
app.use(notFoundHandler);

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
