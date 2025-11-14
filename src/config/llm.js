const axios = require('axios');

/**
 * Claude API client configuration
 * @module config/llm
 */

class ClaudeClient {
  constructor() {
    this.apiKey = process.env.CLAUDE_API_KEY;
    this.apiUrl = process.env.CLAUDE_API_URL || 'https://api.anthropic.com/v1/messages';
    this.model = process.env.CLAUDE_MODEL || 'claude-3-sonnet-20240229';
    this.maxTokens = parseInt(process.env.CLAUDE_MAX_TOKENS || '4096', 10);
  }

  /**
   * Generate website content using Claude API
   * @param {Object} brief - The website brief
   * @returns {Promise<Object>} Generated website content
   */
  async generateWebsite(brief) {
    try {
      if (!this.apiKey) {
        throw new Error('Claude API key not configured');
      }

      const prompt = this._buildPrompt(brief);

      const response = await axios.post(
        this.apiUrl,
        {
          model: this.model,
          max_tokens: this.maxTokens,
          messages: [
            {
              role: 'user',
              content: prompt,
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
          timeout: 60000,
        }
      );

      return this._parseResponse(response.data);
    } catch (error) {
      console.error('Claude API error:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      throw new Error(`Failed to generate website: ${error.message}`);
    }
  }

  /**
   * Build prompt for Claude API
   * @private
   * @param {Object} brief - The website brief
   * @returns {string} Formatted prompt
   */
  _buildPrompt(brief) {
    return `Generate a complete, production-ready website based on the following brief:

Name: ${brief.name}
Email: ${brief.email}
Industry: ${brief.industry}
Page Type: ${brief.pageType}
Description: ${brief.description}
Color Preferences: ${JSON.stringify(brief.colors || {})}
Products/Services: ${JSON.stringify(brief.products || [])}

Please generate:
1. Complete HTML with semantic structure
2. Inline CSS with modern, responsive design
3. JavaScript for interactivity (if needed)

Requirements:
- Mobile-first responsive design
- Modern, professional appearance
- SEO-optimized structure
- Accessible (WCAG 2.1 Level AA)
- Fast loading time
- Cross-browser compatible

Return the response in the following JSON format:
{
  "html": "complete HTML code",
  "css": "complete CSS code (can be inline or separate)",
  "js": "JavaScript code (if any)",
  "metadata": {
    "title": "page title",
    "description": "meta description",
    "keywords": ["keyword1", "keyword2"]
  }
}`;
  }

  /**
   * Parse Claude API response
   * @private
   * @param {Object} response - Claude API response
   * @returns {Object} Parsed website content
   */
  _parseResponse(response) {
    try {
      const content = response.content[0].text;
      
      // Try to extract JSON from the response
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]);
      }

      // Fallback: return raw content
      return {
        html: content,
        css: '',
        js: '',
        metadata: {
          title: 'Generated Website',
          description: 'AI-generated website',
          keywords: [],
        },
      };
    } catch (error) {
      console.error('Error parsing Claude response:', error.message);
      throw new Error('Failed to parse Claude API response');
    }
  }

  /**
   * Test Claude API connection
   * @returns {Promise<boolean>} Connection status
   */
  async testConnection() {
    try {
      if (!this.apiKey) {
        console.error('❌ Claude API key not configured');
        return false;
      }

      await axios.post(
        this.apiUrl,
        {
          model: this.model,
          max_tokens: 100,
          messages: [
            {
              role: 'user',
              content: 'Hello, Claude! Please respond with "OK".',
            },
          ],
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': this.apiKey,
            'anthropic-version': '2023-06-01',
          },
          timeout: 10000,
        }
      );

      console.log('✅ Claude API connection successful');
      return true;
    } catch (error) {
      console.error('❌ Claude API connection failed:', error.message);
      return false;
    }
  }
}

module.exports = new ClaudeClient();
