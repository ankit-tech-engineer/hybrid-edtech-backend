const { errorResponse } = require('../utils/response');

const authorize = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    return errorResponse(res, 'Forbidden: insufficient permissions', 403);
  }
  next();
};

module.exports = authorize;
