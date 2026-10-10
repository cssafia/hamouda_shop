const { body } = require('express-validator');

const create = [
  body('name').isString().trim().isLength({ min: 1, max: 150 }),
  body('price').isFloat({ min: 0 }).toFloat(),
  body('promotional_price').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('profit').optional().isFloat({ min: 0 }).toFloat(),
  body('stock_quantity').optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body('duration').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('version').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('overrides').optional().isArray(),
  body('overrides.*.name').isString().isLength({ min: 1, max: 100 }),
  body('overrides.*.value').isString(),
];

const update = [
  body('name').optional().isString().trim().isLength({ min: 1, max: 150 }),
  body('price').optional().isFloat({ min: 0 }).toFloat(),
  body('promotional_price').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('profit').optional().isFloat({ min: 0 }).toFloat(),
  body('stock_quantity').optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body('duration').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('version').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('overrides').optional().isArray(),
  body('overrides.*.name').isString().isLength({ min: 1, max: 100 }),
  body('overrides.*.value').isString(),
];

const status = [body('is_active').isBoolean().toBoolean()];

module.exports = { create, update, status };