
const { body, query } = require('express-validator');

const create = [
  body('code').isString().trim().isLength({ min: 3, max: 50 }).matches(/^[A-Z0-9_-]+$/i),
  body('scope').isIn(['all', 'products', 'categories']),
  body('discount_type').isIn(['percentage', 'fixed']),
  body('discount_value').isFloat({ min: 0 }).toFloat(),
  body('minimum_amount').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('usage_limit').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('starts_at').optional({ nullable: true }).isISO8601(),
  body('expires_at').optional({ nullable: true }).isISO8601(),
  body('product_ids').optional().isArray(),
  body('product_ids.*').isInt({ min: 1 }).toInt(),
  body('category_ids').optional().isArray(),
  body('category_ids.*').isInt({ min: 1 }).toInt(),
];

const update = [
  body('code').optional().isString().trim().isLength({ min: 3, max: 50 }),
  body('scope').optional().isIn(['all', 'products', 'categories']),
  body('discount_type').optional().isIn(['percentage', 'fixed']),
  body('discount_value').optional().isFloat({ min: 0 }).toFloat(),
  body('minimum_amount').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('usage_limit').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('starts_at').optional({ nullable: true }).isISO8601(),
  body('expires_at').optional({ nullable: true }).isISO8601(),
  body('product_ids').optional().isArray(),
  body('category_ids').optional().isArray(),
];

const status = [body('is_active').isBoolean().toBoolean()];
const validate = [body('code').isString().trim().isLength({ min: 1, max: 50 })];

const list = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString(),
  query('is_active').optional().isIn(['true', 'false']),
];

module.exports = { create, update, status, validate, list };