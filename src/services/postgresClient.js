const { pool } = require('../config/database');

/**
 * PostgreSQL client service with connection pool and query helpers
 * @module services/postgresClient
 */

/**
 * Execute a query
 * @param {string} text - SQL query text
 * @param {Array} params - Query parameters
 * @returns {Promise<Object>} Query result
 */
async function query(text, params = []) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    console.log('📊 Executed query', { text, duration, rows: result.rowCount });
    return result;
  } catch (error) {
    console.error('❌ Query error:', error.message);
    throw error;
  }
}

/**
 * Get a client from the pool for transactions
 * @returns {Promise<Object>} Database client
 */
async function getClient() {
  const client = await pool.connect();
  const originalQuery = client.query;
  const originalRelease = client.release;

  // Set a timeout of 5 seconds, after which we will log this client's last query
  const timeout = setTimeout(() => {
    console.error('⚠️  Client has been checked out for more than 5 seconds!');
  }, 5000);

  // Monkey patch the query method to keep track of the last query executed
  client.query = (...args) => {
    client.lastQuery = args;
    return originalQuery.apply(client, args);
  };

  // Override release to clear the timeout
  client.release = () => {
    clearTimeout(timeout);
    client.query = originalQuery;
    client.release = originalRelease;
    return originalRelease.apply(client);
  };

  return client;
}

/**
 * Insert a brief into the database
 * @param {Object} brief - Brief data
 * @returns {Promise<Object>} Inserted brief with ID
 */
async function insertBrief(brief) {
  const { id, name, email, industry, pageType, description, colors, products } = brief;

  const text = `
    INSERT INTO briefs (id, name, email, industry, page_type, description, colors, products, status)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
    RETURNING *
  `;

  const values = [
    id,
    name,
    email,
    industry,
    pageType,
    description,
    JSON.stringify(colors || {}),
    JSON.stringify(products || []),
    'pending',
  ];

  const result = await query(text, values);
  return result.rows[0];
}

/**
 * Get brief by ID
 * @param {string} briefId - Brief ID
 * @returns {Promise<Object|null>} Brief data or null
 */
async function getBriefById(briefId) {
  const text = 'SELECT * FROM briefs WHERE id = $1';
  const result = await query(text, [briefId]);
  return result.rows[0] || null;
}

/**
 * Update brief status
 * @param {string} briefId - Brief ID
 * @param {string} status - New status
 * @returns {Promise<Object>} Updated brief
 */
async function updateBriefStatus(briefId, status) {
  const text = `
    UPDATE briefs 
    SET status = $1, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $2 
    RETURNING *
  `;
  const result = await query(text, [status, briefId]);
  return result.rows[0];
}

/**
 * Insert a job into the database
 * @param {Object} job - Job data
 * @returns {Promise<Object>} Inserted job with ID
 */
async function insertJob(job) {
  const { id, briefId, status } = job;

  const text = `
    INSERT INTO jobs (id, brief_id, status)
    VALUES ($1, $2, $3)
    RETURNING *
  `;

  const values = [id, briefId, status || 'pending'];

  const result = await query(text, values);
  return result.rows[0];
}

/**
 * Get job by ID
 * @param {string} jobId - Job ID
 * @returns {Promise<Object|null>} Job data or null
 */
async function getJobById(jobId) {
  const text = `
    SELECT j.*, b.name, b.email, b.industry, b.page_type, b.description
    FROM jobs j
    LEFT JOIN briefs b ON j.brief_id = b.id
    WHERE j.id = $1
  `;
  const result = await query(text, [jobId]);
  return result.rows[0] || null;
}

/**
 * Update job status and result
 * @param {string} jobId - Job ID
 * @param {string} status - New status
 * @param {Object} result - Job result data
 * @param {string} error - Error message if failed
 * @returns {Promise<Object>} Updated job
 */
async function updateJob(jobId, status, result = null, error = null) {
  const text = `
    UPDATE jobs 
    SET status = $1, result = $2, error = $3, updated_at = CURRENT_TIMESTAMP 
    WHERE id = $4 
    RETURNING *
  `;
  const values = [
    status,
    result ? JSON.stringify(result) : null,
    error,
    jobId,
  ];
  const queryResult = await query(text, values);
  return queryResult.rows[0];
}

/**
 * Get all jobs with optional filters
 * @param {Object} filters - Filter options
 * @returns {Promise<Array>} Array of jobs
 */
async function getJobs(filters = {}) {
  let text = 'SELECT * FROM jobs';
  const values = [];
  const conditions = [];

  if (filters.status) {
    conditions.push(`status = $${values.length + 1}`);
    values.push(filters.status);
  }

  if (filters.briefId) {
    conditions.push(`brief_id = $${values.length + 1}`);
    values.push(filters.briefId);
  }

  if (conditions.length > 0) {
    text += ' WHERE ' + conditions.join(' AND ');
  }

  text += ' ORDER BY created_at DESC';

  if (filters.limit) {
    text += ` LIMIT ${parseInt(filters.limit, 10)}`;
  }

  const result = await query(text, values);
  return result.rows;
}

module.exports = {
  query,
  getClient,
  insertBrief,
  getBriefById,
  updateBriefStatus,
  insertJob,
  getJobById,
  updateJob,
  getJobs,
};
