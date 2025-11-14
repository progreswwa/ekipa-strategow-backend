const express = require('express');
const { v4: uuidv4 } = require('uuid');
const { asyncHandler } = require('../middleware/errorHandler');
const briefValidator = require('../services/briefValidator');
const postgresClient = require('../services/postgresClient');
const n8nWebhook = require('../services/n8nWebhook');

const router = express.Router();

/**
 * POST /api/brief
 * Submit a new website brief
 * 
 * @body {string} name - Client name
 * @body {string} email - Client email
 * @body {string} industry - Industry/business sector
 * @body {string} pageType - Type of page (landing, portfolio, blog, etc.)
 * @body {string} description - Detailed description of requirements
 * @body {Object} colors - Color preferences (optional)
 * @body {Array} products - Products/services to feature (optional)
 */
router.post(
  '/',
  asyncHandler(async (req, res) => {
    // Sanitize input
    const sanitizedBrief = briefValidator.sanitize(req.body);

    // Validate brief
    const validation = briefValidator.validate(sanitizedBrief);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation failed',
          code: 'VALIDATION_ERROR',
          details: validation.errors,
        },
      });
    }

    // Generate unique ID for the brief
    const briefId = uuidv4();
    const briefData = {
      id: briefId,
      ...sanitizedBrief,
    };

    // Store brief in database
    const savedBrief = await postgresClient.insertBrief(briefData);
    console.log('✅ Brief saved to database:', briefId);

    // Trigger N8N webhook (non-blocking)
    n8nWebhook.trigger({
      briefId,
      brief: sanitizedBrief,
      type: 'brief_submitted',
    }).catch((error) => {
      console.error('N8N webhook error (non-blocking):', error.message);
    });

    // Return success response
    res.status(201).json({
      success: true,
      data: {
        briefId,
        brief: {
          id: savedBrief.id,
          name: savedBrief.name,
          email: savedBrief.email,
          industry: savedBrief.industry,
          pageType: savedBrief.page_type,
          description: savedBrief.description,
          colors: savedBrief.colors,
          products: savedBrief.products,
          status: savedBrief.status,
          createdAt: savedBrief.created_at,
        },
        message: 'Brief submitted successfully',
      },
    });
  })
);

/**
 * GET /api/brief/:briefId
 * Get brief by ID
 */
router.get(
  '/:briefId',
  asyncHandler(async (req, res) => {
    const { briefId } = req.params;

    const brief = await postgresClient.getBriefById(briefId);

    if (!brief) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Brief not found',
          code: 'BRIEF_NOT_FOUND',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: {
        id: brief.id,
        name: brief.name,
        email: brief.email,
        industry: brief.industry,
        pageType: brief.page_type,
        description: brief.description,
        colors: brief.colors,
        products: brief.products,
        status: brief.status,
        createdAt: brief.created_at,
        updatedAt: brief.updated_at,
      },
    });
  })
);

module.exports = router;
