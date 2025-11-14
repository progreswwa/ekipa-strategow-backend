const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const config = require('./config');
const routes = require('./routes');
const { logger, errorHandler } = require('./middleware');

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors(config.cors));

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Logging middleware
app.use(logger);

// API routes
app.use(`/api/${config.apiVersion}`, routes);

// Root endpoint
app.get('/', (req, res) => {
  res.json({
    success: true,
    message: 'EKIPA STRATEGÓW Backend API',
    version: config.apiVersion,
    documentation: `/api/${config.apiVersion}/health`,
  });
});

// Error handling middleware (must be last)
app.use(errorHandler);

module.exports = app;
