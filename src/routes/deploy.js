const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler } = require('../middleware/errorHandler');
const { strictLimiter } = require('../middleware/rateLimiter');
const llmClient = require('../config/llm');
const netlifyClient = require('../services/netlifyClient');
const postgresClient = require('../services/postgresClient');

const router = express.Router();

/**
 * POST /api/deploy
 * Generate website and deploy to Netlify
 * 
 * @body {string} briefId - Brief ID to generate website for (optional)
 * @body {Object} brief - Brief data (required if briefId not provided)
 * @body {boolean} autoGenerate - Auto-generate with AI (default: true)
 * @body {Object} websiteCode - Pre-generated website code (optional)
 */
router.post(
  '/',
  strictLimiter, // Apply stricter rate limiting for deployment
  asyncHandler(async (req, res) => {
    const { briefId, brief, autoGenerate = true, websiteCode } = req.body;

    // Validate input
    if (!briefId && !brief) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Either briefId or brief data is required',
          code: 'MISSING_REQUIRED_FIELD',
        },
      });
    }

    // Create job record
    const jobId = uuidv4();
    let briefData = brief;

    // Get brief from database if briefId provided
    if (briefId) {
      briefData = await postgresClient.getBriefById(briefId);
      if (!briefData) {
        return res.status(404).json({
          success: false,
          error: {
            message: 'Brief not found',
            code: 'BRIEF_NOT_FOUND',
          },
        });
      }
    }

    // Create job in database
    await postgresClient.insertJob({
      id: jobId,
      briefId: briefId || null,
      status: 'processing',
    });

    // Return immediate response with job ID
    res.status(202).json({
      success: true,
      data: {
        jobId,
        status: 'processing',
        message: 'Deployment started. Check status at /api/status/' + jobId,
      },
    });

    // Process deployment asynchronously
    processDeployment(jobId, briefData, autoGenerate, websiteCode).catch(
      (error) => {
        console.error('❌ Deployment processing error:', error);
        postgresClient.updateJob(jobId, 'failed', null, error.message);
      }
    );
  })
);

/**
 * Process deployment asynchronously
 * @private
 * @param {string} jobId - Job ID
 * @param {Object} briefData - Brief data
 * @param {boolean} autoGenerate - Whether to auto-generate with AI
 * @param {Object} websiteCode - Pre-generated website code
 */
async function processDeployment(jobId, briefData, autoGenerate, websiteCode) {
  try {
    let generatedCode = websiteCode;

    // Generate website with AI if needed
    if (autoGenerate && !websiteCode) {
      console.log('🤖 Generating website with Claude AI...');
      generatedCode = await llmClient.generateWebsite(briefData);
    }

    if (!generatedCode || !generatedCode.html) {
      throw new Error('No website code available for deployment');
    }

    // Create site name from brief
    const siteName = `ekipa-${briefData.name
      ?.toLowerCase()
      .replace(/[^a-z0-9]/g, '-')
      .substring(0, 30)}-${Date.now()}`;

    // Deploy to Netlify
    console.log('🚀 Deploying to Netlify...');
    const deployment = await netlifyClient.createAndDeploy(
      siteName,
      generatedCode
    );

    // Update job with success
    await postgresClient.updateJob(jobId, 'completed', {
      deployment,
      generatedCode: {
        metadata: generatedCode.metadata,
      },
    });

    console.log('✅ Deployment completed successfully:', jobId);
  } catch (error) {
    console.error('❌ Deployment failed:', error.message);
    await postgresClient.updateJob(jobId, 'failed', null, error.message);
    throw error;
  }
}

module.exports = router;
