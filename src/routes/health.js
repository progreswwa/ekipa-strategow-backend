const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const database = require('../config/database');
const llmClient = require('../config/llm');
const netlifyClient = require('../config/netlify');

const router = express.Router();

/**
 * GET /api/health
 * Health check endpoint with service status
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const health = {
      success: true,
      message: 'Server is running',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'unknown',
        claude: 'unknown',
        netlify: 'unknown',
      },
    };

    // Check database connection
    try {
      const dbHealthy = await database.testConnection();
      health.services.database = dbHealthy ? 'connected' : 'disconnected';
    } catch (error) {
      health.services.database = 'error';
      console.error('Database health check failed:', error.message);
    }

    // Check Claude API (optional, only if configured)
    if (process.env.CLAUDE_API_KEY) {
      try {
        const claudeHealthy = await llmClient.testConnection();
        health.services.claude = claudeHealthy ? 'connected' : 'disconnected';
      } catch (error) {
        health.services.claude = 'error';
        console.error('Claude API health check failed:', error.message);
      }
    } else {
      health.services.claude = 'not_configured';
    }

    // Check Netlify API (optional, only if configured)
    if (process.env.NETLIFY_API_TOKEN) {
      try {
        const netlifyHealthy = await netlifyClient.testConnection();
        health.services.netlify = netlifyHealthy ? 'connected' : 'disconnected';
      } catch (error) {
        health.services.netlify = 'error';
        console.error('Netlify API health check failed:', error.message);
      }
    } else {
      health.services.netlify = 'not_configured';
    }

    // Determine overall health status
    const allServicesHealthy = Object.values(health.services).every(
      (status) => status === 'connected' || status === 'not_configured'
    );

    const statusCode = allServicesHealthy ? 200 : 503;

    res.status(statusCode).json(health);
  })
);

module.exports = router;
