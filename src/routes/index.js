const express = require('express');
const briefRoutes = require('./brief');
const deployRoutes = require('./deploy');
const statusRoutes = require('./status');
const healthRoutes = require('./health');

const router = express.Router();

// Health check route (no auth required)
router.use('/health', healthRoutes);

// API routes (with auth)
router.use('/brief', briefRoutes);
router.use('/deploy', deployRoutes);
router.use('/status', statusRoutes);

module.exports = router;
