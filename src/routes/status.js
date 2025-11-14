const express = require('express');
const { asyncHandler } = require('../middleware/errorHandler');
const postgresClient = require('../services/postgresClient');

const router = express.Router();

/**
 * GET /api/status/:jobId
 * Get deployment job status
 * 
 * @param {string} jobId - Job ID to check status for
 */
router.get(
  '/:jobId',
  asyncHandler(async (req, res) => {
    const { jobId } = req.params;

    // Get job from database
    const job = await postgresClient.getJobById(jobId);

    if (!job) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Job not found',
          code: 'JOB_NOT_FOUND',
        },
      });
    }

    // Parse result if available
    let result = null;
    if (job.result) {
      try {
        result = typeof job.result === 'string' ? JSON.parse(job.result) : job.result;
      } catch (error) {
        console.error('Error parsing job result:', error);
        result = job.result;
      }
    }

    // Return job status
    res.status(200).json({
      success: true,
      data: {
        jobId: job.id,
        briefId: job.brief_id,
        status: job.status,
        result,
        error: job.error,
        createdAt: job.created_at,
        updatedAt: job.updated_at,
      },
    });
  })
);

/**
 * GET /api/status
 * Get all jobs (with optional filters)
 * 
 * @query {string} status - Filter by status (pending, processing, completed, failed)
 * @query {string} briefId - Filter by brief ID
 * @query {number} limit - Limit number of results
 */
router.get(
  '/',
  asyncHandler(async (req, res) => {
    const { status, briefId, limit } = req.query;

    const filters = {};
    if (status) filters.status = status;
    if (briefId) filters.briefId = briefId;
    if (limit) filters.limit = parseInt(limit, 10);

    const jobs = await postgresClient.getJobs(filters);

    res.status(200).json({
      success: true,
      data: {
        jobs: jobs.map((job) => ({
          jobId: job.id,
          briefId: job.brief_id,
          status: job.status,
          createdAt: job.created_at,
          updatedAt: job.updated_at,
        })),
        count: jobs.length,
      },
    });
  })
);

module.exports = router;
