
const { body, query } = require('express-validator');

const list = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('search').optional().isString().isLength({ max: 200 }),
  query('category_id').optional().isInt({ min: 1 }).toInt(),
  query('brand_id').optional().isInt({ min: 1 }).toInt(),
  query('stock_status').optional().isIn(['all', 'low', 'out', 'issues']),
  query('stock_mode').optional().isIn(['single', 'shared', 'per_variant']),
];

const adjust = [
  body('delta')
    .isInt()
    .custom((v) => Number(v) !== 0)
    .withMessage('delta must be a non-zero integer')
    .toInt(),
  body('variant_id').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
];

module.exports = { list, adjust };