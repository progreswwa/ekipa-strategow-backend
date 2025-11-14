const express = require('express');
const { aiService, netlifyService } = require('../services');

const router = express.Router();

/**
 * POST /api/v1/website/generate
 * Generate website from brief
 */
router.post('/generate', async (req, res, next) => {
  try {
    const brief = req.body;

    // Process and validate brief
    const processedBrief = aiService.processBrief(brief);

    // Generate website code
    const websiteCode = await aiService.generateWebsite(processedBrief);

    res.status(200).json({
      success: true,
      data: {
        brief: processedBrief,
        website: websiteCode,
      },
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/v1/website/deploy
 * Deploy generated website to Netlify
 */
router.post('/deploy', async (req, res, next) => {
  try {
    const { html, css, js } = req.body;

    if (!html) {
      return res.status(400).json({
        success: false,
        error: { message: 'HTML content is required' },
      });
    }

    // Deploy to Netlify
    const deploymentResult = await netlifyService.deploy({ html, css, js });

    res.status(200).json({
      success: true,
      data: deploymentResult,
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/v1/website/deployment/:deployId
 * Get deployment status
 */
router.get('/deployment/:deployId', async (req, res, next) => {
  try {
    const { deployId } = req.params;

    const status = await netlifyService.getDeploymentStatus(deployId);

    res.status(200).json({
      success: true,
      data: status,
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
