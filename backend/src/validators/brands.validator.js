
const { body, query } = require('express-validator');

const create = [
  body('name')
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name is required (1-100 chars)'),
  body('category_ids').optional().isArray(),
  body('category_ids.*').optional().isInt({ min: 1 }).toInt()
    .withMessage('Invalid category_id'),
];

const update = [
  body('name')
    .optional()
    .isString()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Name must be 1-100 chars'),
  body('category_ids').optional().isArray(),
  body('category_ids.*').optional().isInt({ min: 1 }).toInt(),
];

const status = [
  body('is_active').isBoolean().toBoolean(),
];

const listPublic = [
  query('category_id').optional().isInt({ min: 1 }).toInt(),
];

module.exports = { create, update, status, listPublic };