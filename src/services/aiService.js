const config = require('../config');

/**
 * AI Service for generating website content
 * Handles interactions with OpenAI API
 */
class AIService {
  constructor() {
    this.apiKey = config.openai.apiKey;
    this.model = config.openai.model;
  }

  /**
   * Generate website HTML/CSS/JS based on brief
   * @param {Object} brief - The website brief containing requirements
   * @returns {Promise<Object>} Generated website code
   */
  async generateWebsite(brief) {
    try {
      // Placeholder for actual OpenAI API call
      // This would integrate with OpenAI to generate website code
      
      console.log('Generating website with AI for brief:', brief);

      // Mock response for demonstration
      return {
        html: '<!DOCTYPE html><html><head><title>Generated Site</title></head><body><h1>AI Generated Website</h1></body></html>',
        css: 'body { font-family: Arial, sans-serif; margin: 0; padding: 20px; }',
        js: 'console.log("Website loaded");',
        metadata: {
          generatedAt: new Date().toISOString(),
          model: this.model,
        },
      };
    } catch (error) {
      console.error('Error generating website:', error);
      throw new Error('Failed to generate website content');
    }
  }

  /**
   * Process and validate brief
   * @param {Object} brief - The website brief
   * @returns {Object} Validated and processed brief
   */
  processBrief(brief) {
    const { title, description, requirements, style } = brief;

    if (!title || !description) {
      throw new Error('Brief must include title and description');
    }

    return {
      title: title.trim(),
      description: description.trim(),
      requirements: requirements || [],
      style: style || 'modern',
      processedAt: new Date().toISOString(),
    };
  }
}

module.exports = new AIService();
