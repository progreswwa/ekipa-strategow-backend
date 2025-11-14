/**
 * Brief validation service
 * @module services/briefValidator
 */

/**
 * Validate brief data
 * @param {Object} brief - Brief data to validate
 * @returns {Object} Validation result with isValid flag and errors array
 */
function validate(brief) {
  const errors = [];

  // Required fields
  const requiredFields = [
    { field: 'name', type: 'string', message: 'Name is required' },
    { field: 'email', type: 'string', message: 'Email is required' },
    { field: 'industry', type: 'string', message: 'Industry is required' },
    { field: 'pageType', type: 'string', message: 'Page type is required' },
    { field: 'description', type: 'string', message: 'Description is required' },
  ];

  // Check required fields
  requiredFields.forEach(({ field, type, message }) => {
    if (!brief[field]) {
      errors.push(message);
    } else if (typeof brief[field] !== type) {
      errors.push(`${field} must be a ${type}`);
    } else if (brief[field].trim().length === 0) {
      errors.push(`${field} cannot be empty`);
    }
  });

  // Validate email format
  if (brief.email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(brief.email)) {
      errors.push('Invalid email format');
    }
  }

  // Validate name length
  if (brief.name && brief.name.length > 255) {
    errors.push('Name must be less than 255 characters');
  }

  // Validate email length
  if (brief.email && brief.email.length > 255) {
    errors.push('Email must be less than 255 characters');
  }

  // Validate industry
  if (brief.industry && brief.industry.length > 255) {
    errors.push('Industry must be less than 255 characters');
  }

  // Validate page type
  const validPageTypes = [
    'landing',
    'portfolio',
    'blog',
    'ecommerce',
    'corporate',
    'personal',
    'other',
  ];
  if (brief.pageType && !validPageTypes.includes(brief.pageType.toLowerCase())) {
    errors.push(
      `Invalid page type. Valid types are: ${validPageTypes.join(', ')}`
    );
  }

  // Validate description length
  if (brief.description && brief.description.length < 10) {
    errors.push('Description must be at least 10 characters');
  }
  if (brief.description && brief.description.length > 5000) {
    errors.push('Description must be less than 5000 characters');
  }

  // Validate colors if provided
  if (brief.colors) {
    if (typeof brief.colors !== 'object' || Array.isArray(brief.colors)) {
      errors.push('Colors must be an object');
    } else {
      // Check if colors are valid hex codes or color names
      Object.entries(brief.colors).forEach(([key, value]) => {
        if (typeof value !== 'string') {
          errors.push(`Color value for ${key} must be a string`);
        }
      });
    }
  }

  // Validate products if provided
  if (brief.products) {
    if (!Array.isArray(brief.products)) {
      errors.push('Products must be an array');
    } else {
      brief.products.forEach((product, index) => {
        if (typeof product !== 'object' || Array.isArray(product)) {
          errors.push(`Product at index ${index} must be an object`);
        }
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Sanitize brief data
 * @param {Object} brief - Brief data to sanitize
 * @returns {Object} Sanitized brief data
 */
function sanitize(brief) {
  return {
    name: brief.name?.trim() || '',
    email: brief.email?.trim().toLowerCase() || '',
    industry: brief.industry?.trim() || '',
    pageType: brief.pageType?.trim().toLowerCase() || '',
    description: brief.description?.trim() || '',
    colors: brief.colors || {},
    products: brief.products || [],
  };
}

module.exports = {
  validate,
  sanitize,
};
