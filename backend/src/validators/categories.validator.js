
const { body } = require('express-validator');

const create = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required (1-100 chars)'),
];

const update = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required (1-100 chars)'),
];

const status = [
  body('is_active')
    .isBoolean()
    .toBoolean()
    .withMessage('is_active must be a boolean'),
];

module.exports = { create, update, status };