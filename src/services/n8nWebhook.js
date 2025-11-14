const axios = require('axios');

/**
 * N8N webhook service for triggering workflows
 * @module services/n8nWebhook
 */

/**
 * Trigger N8N webhook with brief data
 * @param {Object} data - Data to send to N8N webhook
 * @returns {Promise<Object>} Webhook response
 */
async function trigger(data) {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn('⚠️  N8N webhook URL not configured, skipping webhook trigger');
    return {
      success: false,
      message: 'N8N webhook URL not configured',
    };
  }

  try {
    console.log('🔔 Triggering N8N webhook...');

    const response = await axios.post(
      webhookUrl,
      {
        ...data,
        timestamp: new Date().toISOString(),
        source: 'ekipa-strategow-backend',
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 10000,
      }
    );

    console.log('✅ N8N webhook triggered successfully');
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error) {
    console.error('❌ N8N webhook error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }

    // Don't throw error, just return failure status
    // We don't want to fail the entire request if webhook fails
    return {
      success: false,
      message: error.message,
      error: error.response?.data,
    };
  }
}

/**
 * Test N8N webhook connection
 * @returns {Promise<boolean>} Connection status
 */
async function testConnection() {
  const webhookUrl = process.env.N8N_WEBHOOK_URL;

  if (!webhookUrl) {
    console.error('❌ N8N webhook URL not configured');
    return false;
  }

  try {
    await axios.post(
      webhookUrl,
      {
        test: true,
        timestamp: new Date().toISOString(),
      },
      {
        headers: {
          'Content-Type': 'application/json',
        },
        timeout: 5000,
      }
    );

    console.log('✅ N8N webhook connection successful');
    return true;
  } catch (error) {
    console.error('❌ N8N webhook connection failed:', error.message);
    return false;
  }
}

module.exports = {
  trigger,
  testConnection,
};
