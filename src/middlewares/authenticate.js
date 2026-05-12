const { verifyToken } = require('../utils/jwt');
const { errorResponse } = require('../utils/response');
const userRepository = require('../repositories/user.repository');

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return errorResponse(res, 'No token provided', 401);
    }

    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    const user = await userRepository.findById(decoded.id);
    if (!user || !user.is_active || !user.is_verified) {
      return errorResponse(res, 'Unauthorized', 401);
    }

    req.user = user;
    next();
  } catch {
    return errorResponse(res, 'Invalid or expired token', 401);
  }
};

module.exports = authenticate;
