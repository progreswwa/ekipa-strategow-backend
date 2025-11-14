const express = require('express');
const websiteRoutes = require('./website');
const healthRoutes = require('./health');

const router = express.Router();

// Health check route
router.use('/health', healthRoutes);

// Website generation routes
router.use('/website', websiteRoutes);

module.exports = router;
