const ApiError = require('../utils/apiError');

module.exports = (...allowedRoles) => (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());
  if (!allowedRoles.includes(req.user.role)) {
    return next(ApiError.forbidden('Insufficient role'));
  }
  next();
};