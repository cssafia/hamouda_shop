
const { body, query } = require('express-validator');
const { USAGE_KEYS } = require('../config/constants');

const create = [
  // ─── Base ─────────────────────────────────────────────
  body('product_type').isIn(['physical', 'digital']).withMessage('Invalid product_type'),
  body('category_id').isInt({ min: 1 }).toInt(),
  body('brand_id').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('name').isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString(),
  body('is_active').optional().isBoolean().toBoolean(),

  // ─── Pricing ──────────────────────────────────────────
  body('price').isFloat({ min: 0 }).toFloat(),
  body('promotional_price').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('profit').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),

  // ─── Stock ────────────────────────────────────────────
  body('stock_quantity').optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body('stock_mode').optional({ nullable: true }).isIn(['per_variant', 'shared']),

  // ─── Physical-only fields (allowed only when type=physical — enforced in service)
  body('condition').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('color').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('included_accessories').optional({ nullable: true }).isString(),

  // ─── Digital-only fields
  body('duration').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('version').optional({ nullable: true }).isString().isLength({ max: 100 }),

  // ─── Usages (physical only — enforced in service)
  body('usages').optional().isArray(),
  body('usages.*').optional().isIn(USAGE_KEYS).withMessage('Unknown usage key'),

  // ─── Base specifications
  body('specifications').optional().isArray(),
  body('specifications.*.name').isString().isLength({ min: 1, max: 100 }),
  body('specifications.*.value').isString(),
  body('specifications.*.display_order').optional().isInt({ min: 0 }).toInt(),

  // ─── Variants
  body('variants').optional().isArray(),
  body('variants.*.name').isString().isLength({ min: 1, max: 150 }),
  body('variants.*.price').isFloat({ min: 0 }).toFloat(),
  body('variants.*.promotional_price').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('variants.*.profit').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('variants.*.stock_quantity').optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body('variants.*.duration').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('variants.*.version').optional({ nullable: true }).isString().isLength({ max: 100 }),

  // Overrides (physical variants only — enforced in service)
  body('variants.*.overrides').optional().isArray(),
  body('variants.*.overrides.*.name').isString().isLength({ min: 1, max: 100 }),
  body('variants.*.overrides.*.value').isString(),

  // ─── Images
  body('primary_image_index').optional().isInt({ min: 0 }).toInt(),
  body('image_order').optional().isArray(),
  body('image_order.*').isInt({ min: 0 }).toInt(),
];

const update = [
  // base
  body('category_id').optional().isInt({ min: 1 }).toInt(),
  body('brand_id').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('name').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString(),
  body('is_active').optional().isBoolean().toBoolean(),

  // pricing
  body('price').optional().isFloat({ min: 0 }).toFloat(),
  body('promotional_price').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('profit').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),

  // stock
  body('stock_quantity').optional({ nullable: true }).isInt({ min: 0 }).toInt(),
  body('stock_mode').optional({ nullable: true }).isIn(['per_variant', 'shared']),

  // physical / digital specific
  body('condition').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('color').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('included_accessories').optional({ nullable: true }).isString(),
  body('duration').optional({ nullable: true }).isString().isLength({ max: 50 }),
  body('version').optional({ nullable: true }).isString().isLength({ max: 100 }),

  // usages
  body('usages').optional().isArray(),
  body('usages.*').optional().isIn(USAGE_KEYS),

  // specs
  body('specifications').optional().isArray(),

  // images
  body('keep_image_urls').optional().isArray(),
  body('keep_image_urls.*').isString(),
  body('primary_image_index').optional().isInt({ min: 0 }).toInt(),
  body('image_order').optional().isArray(),
  body('image_order.*').isInt({ min: 0 }).toInt(),
];

const status = [body('is_active').isBoolean().toBoolean()];

const listPublic = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category_id').optional().isInt({ min: 1 }).toInt(),
  query('brand_id').optional().isInt({ min: 1 }).toInt(),
  query('usage').optional().isIn(USAGE_KEYS),
  query('price_min').optional().isFloat({ min: 0 }).toFloat(),
  query('price_max').optional().isFloat({ min: 0 }).toFloat(),
  query('availability').optional().isIn(['available', 'out_of_stock', 'all']),
  query('product_type').optional().isIn(['physical', 'digital', 'all']),
  query('search').optional().isString().isLength({ max: 200 }),
  query('sort').optional().isIn(['newest', 'price_asc', 'price_desc', 'name_asc', 'name_desc']),
];

module.exports = { create, update, status, listPublic };