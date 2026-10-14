
const { body, query } = require('express-validator');

const create = [
  body('customer_name')
    .isString().trim().isLength({ min: 2, max: 150 })
    .withMessage('Name is required (2-150 chars)'),
  body('customer_phone')
    .isString().trim().isLength({ min: 8, max: 30 })
    .matches(/^[0-9+\s-]+$/)
    .withMessage('Valid phone number required'),
  body('service_name')
    .isString().trim().isLength({ min: 2, max: 200 })
    .withMessage('Service name is required'),
  body('description')
    .optional({ nullable: true, checkFalsy: true })
    .isString().trim().isLength({  max: 5000 })
    .withMessage('Description must be 5-5000 chars'),
];

const complete = [
  body('profit')
    .isFloat({ min: 0 })
    .toFloat()
    .withMessage('Profit is required and must be ≥ 0'),
];

const cancel = [
  // Empty body — no validation needed.
];

const list = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn(['pending', 'completed', 'cancelled']),
  query('search').optional().isString().isLength({ max: 200 }),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601(),
  query('sort').optional().isIn(['newest', 'oldest']),
];

module.exports = { create, complete, cancel, list };