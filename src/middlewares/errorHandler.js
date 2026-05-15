const logger = require('../utils/logger');
const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  // Log full error details
  logger.error(err.message || err.toString() || 'Unknown error', { 
    stack: err.stack, 
    path: req.path,
    error: err 
  });

  if (err.isOperational) {
    return errorResponse(res, err.message, err.statusCode);
  }

  if (err.name === 'ValidationError') {
    return errorResponse(res, err.message, 422);
  }

  if (err.code === 11000) {
    const field = Object.keys(err.keyValue)[0];
    return errorResponse(res, `${field} already exists`, 409);
  }

  // Handle Razorpay errors
  if (err.error && err.error.description) {
    return errorResponse(res, `Payment gateway error: ${err.error.description}`, 500);
  }

  return errorResponse(res, err.message || 'Internal server error', 500);
};

module.exports = errorHandler;
