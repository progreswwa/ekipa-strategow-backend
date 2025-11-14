const express = require('express');

const router = express.Router();

/**
 * GET /health
 * Health check endpoint
 */
router.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

module.exports = router;
