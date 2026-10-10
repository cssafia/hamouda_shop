const env = require('../config/env');
const logger = require('../config/logger');
const ApiError = require('../utils/apiError');

// eslint-disable-next-line no-unused-vars
module.exports = (err, req, res, next) => {
  const isApiError = err instanceof ApiError;
  const statusCode = isApiError ? err.statusCode : 500;
  const message = isApiError ? err.message : 'Internal server error';

  if (statusCode >= 500) {
    logger.error(err.message, { stack: err.stack, path: req.originalUrl });
  }

  const body = { success: false, message };
  if (isApiError && err.details) body.details = err.details;
  if (env.nodeEnv === 'development' && !isApiError) body.stack = err.stack;

  res.status(statusCode).json(body);
};