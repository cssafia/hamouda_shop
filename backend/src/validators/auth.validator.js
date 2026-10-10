
const { body } = require('express-validator');

const create = [
  body('name').isString().trim().isLength({ min: 1, max: 100 })
    .withMessage('Name is required (1-100 chars)'),
  body('parent_id').optional({ nullable: true }).isInt({ min: 1 }).toInt()
    .withMessage('Invalid parent_id'),
];

const update = [
  body('name').optional().isString().trim().isLength({ min: 1, max: 100 }),
  body('slug').optional().isString().trim().isLength({ min: 1, max: 120 })
    .matches(/^[a-z0-9-]+$/).withMessage('Slug must be lowercase a-z, 0-9, or dashes'),
  body('parent_id').optional({ nullable: true }).isInt({ min: 1 }).toInt()
    .withMessage('Invalid parent_id'),
];

const status = [
  body('is_active').isBoolean().toBoolean()
    .withMessage('is_active must be a boolean'),
];

module.exports = { create, update, status };