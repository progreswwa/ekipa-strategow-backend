const netlifyConfig = require('../config/netlify');

/**
 * Netlify client service with site creation and deployment functions
 * @module services/netlifyClient
 */

/**
 * Create a new Netlify site
 * @param {string} siteName - Name for the site
 * @returns {Promise<Object>} Created site information
 */
async function createSite(siteName) {
  try {
    console.log(`📦 Creating Netlify site: ${siteName}`);
    const site = await netlifyConfig.createSite(siteName);
    return site;
  } catch (error) {
    console.error('Error creating Netlify site:', error.message);
    throw error;
  }
}

/**
 * Deploy website to Netlify
 * @param {string} siteId - Netlify site ID
 * @param {Object} files - Website files (html, css, js, metadata)
 * @returns {Promise<Object>} Deployment information
 */
async function deploy(siteId, files) {
  try {
    console.log(`🚀 Deploying to Netlify site: ${siteId}`);
    const deployment = await netlifyConfig.deploySite(siteId, files);
    return deployment;
  } catch (error) {
    console.error('Error deploying to Netlify:', error.message);
    throw error;
  }
}

/**
 * Get deployment status
 * @param {string} siteId - Netlify site ID
 * @param {string} deployId - Deployment ID
 * @returns {Promise<Object>} Deployment status
 */
async function getStatus(siteId, deployId) {
  try {
    console.log(`📊 Getting deployment status: ${deployId}`);
    const status = await netlifyConfig.getDeployStatus(siteId, deployId);
    return status;
  } catch (error) {
    console.error('Error getting deployment status:', error.message);
    throw error;
  }
}

/**
 * Create site and deploy in one operation
 * @param {string} siteName - Name for the site
 * @param {Object} files - Website files
 * @returns {Promise<Object>} Site and deployment information
 */
async function createAndDeploy(siteName, files) {
  try {
    // Create site
    const site = await createSite(siteName);

    // Deploy to the created site
    const deployment = await deploy(site.siteId, files);

    return {
      site,
      deployment,
    };
  } catch (error) {
    console.error('Error creating and deploying site:', error.message);
    throw error;
  }
}

module.exports = {
  createSite,
  deploy,
  getStatus,
  createAndDeploy,
};
