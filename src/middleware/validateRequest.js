/**
 * Request validation middleware
 * Validates incoming request body against a schema
 */
const validateRequest = (schema) => {
  return (req, res, next) => {
    if (!schema) {
      return next();
    }

    const { error, value } = schema.validate(req.body, {
      abortEarly: false,
      stripUnknown: true,
    });

    if (error) {
      const errorMessage = error.details
        .map((detail) => detail.message)
        .join(', ');
      
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: errorMessage,
        },
      });
    }

    req.body = value;
    next();
  };
};

module.exports = validateRequest;
