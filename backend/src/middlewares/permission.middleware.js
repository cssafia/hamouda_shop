const { ROLES } = require('../config/constants');
const ApiError = require('../utils/apiError');
const permissionsRepo = require('../modules/administrators/permissions.repository');

module.exports = (permissionKey) => async (req, res, next) => {
  if (!req.user) return next(ApiError.unauthorized());

  if (req.user.role === ROLES.SUPERADMIN) return next();

  try {
    const granted = await permissionsRepo.hasPermission(req.user.id, permissionKey);
    if (!granted) {
      return next(ApiError.forbidden(`Missing permission: ${permissionKey}`));
    }
    next();
  } catch (err) {
    next(err);
  }
};