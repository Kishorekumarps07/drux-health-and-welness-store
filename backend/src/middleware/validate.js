'use strict';

const AppError = require('../lib/AppError');

/**
 * Global Zod validation middleware.
 * Intercepts request data (body, query, params) and validates against a schema.
 */
const validate = (schema) => (req, res, next) => {
  try {
    const data = {
      body: req.body,
      query: req.query,
      params: req.params,
    };

    const validated = schema.parse(data.body); // Currently mostly body focused
    req.body = validated;
    
    next();
  } catch (error) {
    if (error.name === 'ZodError') {
      next(error); // Caught by centralized errorHandler
    } else {
      next(new AppError('Internal validation error', 500));
    }
  }
};

module.exports = validate;
