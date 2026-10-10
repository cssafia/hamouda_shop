const { body } = require('express-validator');

const login = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
  body('password').isString().isLength({ min: 1 }).withMessage('Password required'),
];

const changePassword = [
  body('current_password').isString().isLength({ min: 1 }).withMessage('Current password required'),
  body('new_password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

const forgetPassword = [
  body('email').isEmail().withMessage('Valid email required').normalizeEmail(),
];

const resetPassword = [
  body('token').isString().isLength({ min: 32 }).withMessage('Invalid token'),
  body('new_password')
    .isString()
    .isLength({ min: 8 })
    .withMessage('New password must be at least 8 characters'),
];

module.exports = { login, changePassword, forgetPassword, resetPassword };