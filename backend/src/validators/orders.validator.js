
const { body, query } = require('express-validator');

const create = [
  body('customer_name').isString().trim().isLength({ min: 2, max: 150 }),
  body('customer_phone').isString().trim().isLength({ min: 8, max: 30 })
    .matches(/^[0-9+\s-]+$/),
  body('wilaya').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('commune').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('delivery_type').optional({ nullable: true }).isIn(['home', 'stop_desk']),
  body('address').optional({ nullable: true }).isString().isLength({ max: 255 }),
  body('stop_desk_name').optional({ nullable: true }).isString().isLength({ max: 150 }),
  body('note').optional({ nullable: true }).isString().isLength({ max: 1000 }),
  body('coupon_code').optional({ nullable: true }).isString().isLength({ max: 50 }),
];

const status = [
  body('status').isIn(['confirmed', 'shipped', 'completed', 'cancelled', 'returned']),
  body('cancellation_reason').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('cancellation_note').optional({ nullable: true }).isString().isLength({ max: 1000 }),
];

const shippingUpdate = [
  body('courier').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('tracking_number').optional({ nullable: true }).isString().isLength({ max: 100 }),
  body('status').optional({ nullable: true }).isString().isLength({ max: 50 }),
];

const list = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('status').optional().isIn([
    'pending', 'confirmed', 'shipped', 'completed', 'cancelled', 'returned',
  ]),
  query('order_type').optional().isIn(['physical', 'digital']),
  query('search').optional().isString().isLength({ max: 200 }),
  query('date_from').optional().isISO8601(),
  query('date_to').optional().isISO8601(),
  query('sort').optional().isIn(['newest', 'oldest', 'amount_desc', 'amount_asc']),
];

module.exports = { create, status, shippingUpdate, list };