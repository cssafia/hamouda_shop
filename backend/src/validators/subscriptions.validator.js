'use strict';

const { body, query } = require('express-validator');
const { DURATIONS } = require('../config/constants');

const create = [
  // ─── Product level (base plan) — all required for digital
  body('category_id').isInt({ min: 1 }).toInt(),
  body('brand_id').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('name').isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString(),
  body('is_active').optional().isBoolean().toBoolean(),

  body('duration')
    .isIn(DURATIONS)
    .withMessage(`Duration must be one of: ${DURATIONS.join(', ')}`),
  body('price').isFloat({ min: 0 }).toFloat(),
  body('profit').isFloat({ min: 0 }).toFloat(),
  body('promotional_price').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),

  // ─── Additional plans (variants)
  body('variants').optional().isArray(),
  body('variants.*.duration')
    .isIn(DURATIONS)
    .withMessage(`Variant duration must be one of: ${DURATIONS.join(', ')}`),
  body('variants.*.price').isFloat({ min: 0 }).toFloat(),
  body('variants.*.profit').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('variants.*.promotional_price').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),

  // ─── Images
  body('primary_image_index').optional().isInt({ min: 0 }).toInt(),
  body('image_order').optional().isArray(),
  body('image_order.*').isInt({ min: 0 }).toInt(),
];

const update = [
  body('category_id').optional().isInt({ min: 1 }).toInt(),
  body('brand_id').optional({ nullable: true }).isInt({ min: 1 }).toInt(),
  body('name').optional().isString().trim().isLength({ min: 1, max: 200 }),
  body('description').optional({ nullable: true }).isString(),
  body('is_active').optional().isBoolean().toBoolean(),

  body('duration').optional().isIn(DURATIONS),
  body('price').optional().isFloat({ min: 0 }).toFloat(),
  body('profit').optional().isFloat({ min: 0 }).toFloat(),
  body('promotional_price').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),

  body('variants').optional().isArray(),
  body('variants.*.id').optional().isInt({ min: 1 }).toInt(),
  body('variants.*.duration').isIn(DURATIONS),
  body('variants.*.price').isFloat({ min: 0 }).toFloat(),
  body('variants.*.profit').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),
  body('variants.*.promotional_price').optional({ nullable: true }).isFloat({ min: 0 }).toFloat(),

  body('keep_image_urls').optional().isArray(),
  body('keep_image_urls.*').isString(),
  body('primary_image_index').optional().isInt({ min: 0 }).toInt(),
  body('image_order').optional().isArray(),
  body('image_order.*').isInt({ min: 0 }).toInt(),
];

const status = [
  body('is_active').isBoolean().toBoolean(),
];

const list = [
  query('page').optional().isInt({ min: 1 }).toInt(),
  query('limit').optional().isInt({ min: 1, max: 100 }).toInt(),
  query('category_id').optional().isInt({ min: 1 }).toInt(),
  query('brand_id').optional().isInt({ min: 1 }).toInt(),
  query('search').optional().isString().isLength({ max: 200 }),
  query('is_active').optional().isIn(['true', 'false']),
  query('sort').optional().isIn(['newest', 'name', 'price_asc', 'price_desc']),
];

module.exports = { create, update, status, list };