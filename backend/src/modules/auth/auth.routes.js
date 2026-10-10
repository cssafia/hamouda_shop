const express = require('express');
const { validationResult } = require('express-validator');

const authController = require('./auth.controller');
const validator = require('./auth.validator');
const authMiddleware = require('../../middlewares/auth.middleware');
const { authLimiter } = require('../../middlewares/rateLimiter.middleware');
const ApiError = require('../../utils/apiError');

const router = express.Router();

// Turn express-validator errors into ApiError before they reach the controller.
function validate(rules) {
  return [
    ...rules,
    (req, res, next) => {
      const errors = validationResult(req);
      if (errors.isEmpty()) return next();
      const details = errors.array().map((e) => ({ field: e.path, msg: e.msg }));
      next(ApiError.badRequest('Validation failed', details));
    },
  ];
}

router.post('/login', authLimiter, validate(validator.login), authController.login);
router.post('/logout', authMiddleware, authController.logout);

router.patch(
  '/password',
  authMiddleware,
  validate(validator.changePassword),
  authController.changePassword
);

router.post(
  '/forget-password',
  authLimiter,
  validate(validator.forgetPassword),
  authController.forgetPassword
);

router.post(
  '/reset-password',
  authLimiter,
  validate(validator.resetPassword),
  authController.resetPassword
);

module.exports = router;