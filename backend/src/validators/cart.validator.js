
const { body } = require('express-validator');

const add = [
  body('product_id').isInt({ min: 1 }).toInt(),
  body('variant_id').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('quantity').isInt({ min: 1, max: 20 }).toInt(),
];

const updateQty = [
  body('quantity').isInt({ min: 1, max: 20 }).toInt(),
];

module.exports = { add, updateQty };