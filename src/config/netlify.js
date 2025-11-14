const axios = require('axios');

/**
 * Netlify API wrapper for site creation and deployment
 * @module config/netlify
 */

class NetlifyClient {
  constructor() {
    this.apiToken = process.env.NETLIFY_API_TOKEN;
    this.apiUrl = process.env.NETLIFY_API_URL || 'https://api.netlify.com/api/v1';
    this.teamId = process.env.NETLIFY_TEAM_ID;
  }

  /**
   * Create a new Netlify site
   * @param {string} siteName - Name for the site
   * @returns {Promise<Object>} Created site information
   */
  async createSite(siteName) {
    try {
      if (!this.apiToken) {
        throw new Error('Netlify API token not configured');
      }

      const response = await axios.post(
        `${this.apiUrl}/sites`,
        {
          name: siteName,
          custom_domain: null,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
          timeout: 30000,
        }
      );

      console.log(`✅ Netlify site created: ${response.data.name}`);
      return {
        siteId: response.data.id,
        siteName: response.data.name,
        url: response.data.ssl_url || response.data.url,
        adminUrl: response.data.admin_url,
      };
    } catch (error) {
      console.error('Netlify create site error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to create Netlify site: ${error.message}`);
    }
  }

  /**
   * Deploy website to Netlify
   * @param {string} siteId - Netlify site ID
   * @param {Object} files - Website files (html, css, js)
   * @returns {Promise<Object>} Deployment information
   */
  async deploySite(siteId, files) {
    try {
      if (!this.apiToken) {
        throw new Error('Netlify API token not configured');
      }

      // Create index.html content
      const indexHtml = this._buildIndexHtml(files);

      // Deploy using Netlify's deploy API
      const response = await axios.post(
        `${this.apiUrl}/sites/${siteId}/deploys`,
        {
          files: {
            '/index.html': indexHtml,
          },
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${this.apiToken}`,
          },
          timeout: 60000,
        }
      );

      console.log(`✅ Website deployed to Netlify: ${response.data.deploy_ssl_url}`);
      return {
        deployId: response.data.id,
        url: response.data.deploy_ssl_url || response.data.deploy_url,
        status: response.data.state,
        createdAt: response.data.created_at,
      };
    } catch (error) {
      console.error('Netlify deploy error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to deploy to Netlify: ${error.message}`);
    }
  }

  /**
   * Get deployment status
   * @param {string} siteId - Netlify site ID
   * @param {string} deployId - Deployment ID
   * @returns {Promise<Object>} Deployment status
   */
  async getDeployStatus(siteId, deployId) {
    try {
      if (!this.apiToken) {
        throw new Error('Netlify API token not configured');
      }

      const response = await axios.get(
        `${this.apiUrl}/sites/${siteId}/deploys/${deployId}`,
        {
          headers: {
            Authorization: `Bearer ${this.apiToken}`,
          },
          timeout: 10000,
        }
      );

      return {
        deployId: response.data.id,
        status: response.data.state,
        url: response.data.deploy_ssl_url || response.data.deploy_url,
        createdAt: response.data.created_at,
        publishedAt: response.data.published_at,
      };
    } catch (error) {
      console.error('Netlify get deploy status error:', error.message);
      throw new Error(`Failed to get deployment status: ${error.message}`);
    }
  }

  /**
   * Build complete HTML document
   * @private
   * @param {Object} files - Website files
   * @returns {string} Complete HTML document
   */
  _buildIndexHtml(files) {
    const { html, css, js } = files;

    // If HTML is already a complete document, return it
    if (html.includes('<!DOCTYPE') || html.includes('<html')) {
      return html;
    }

    // Build complete HTML document
    return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${files.metadata?.title || 'Website'}</title>
  <meta name="description" content="${files.metadata?.description || ''}">
  <style>
    ${css || ''}
  </style>
</head>
<body>
  ${html}
  ${js ? `<script>${js}</script>` : ''}
</body>
</html>`;
  }

  /**
   * Test Netlify API connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      if (!this.apiToken) {
        console.error('❌ Netlify API token not configured');
        return false;
      }

      await axios.get(`${this.apiUrl}/sites`, {
        headers: {
          Authorization: `Bearer ${this.apiToken}`,
        },
        timeout: 10000,
      });

      console.log('✅ Netlify API connection successful');
      return true;
    } catch (error) {
      console.error('❌ Netlify API connection failed:', error.message);
      return false;
    }
  }
}

module.exports = new NetlifyClient();
