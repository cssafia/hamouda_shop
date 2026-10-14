
const ApiError = require('../../utils/apiError');
const db = require('../../config/database');
const env = require('../../config/env');
const logger = require('../../config/logger');
const { sendMail } = require('../../utils/mailers');
const notificationsService = require('../notifications/notifications.service');
const repo = require('./stock.repository');

// ─── Helpers ───────────────────────────────────────────

function statusOf(total, threshold) {
  if (total <= 0) return 'out';
  if (threshold != null && total <= threshold) return 'low';
  return 'in_stock';
}

function toNumberOrNull(value) {
  return value != null ? Number(value) : null;
}

function sendLowStockEmail(notif) {
  const label = notif.variantName
    ? `${notif.productName} — ${notif.variantName}`
    : notif.productName;

  sendMail({
    to: env.mail.superadminEmail,
    subject: `Low stock: ${label}`,
    text: `Stock is ${notif.newQty} (threshold: ${notif.threshold}).`,
  }).catch((err) => logger.error(`Low-stock email failed: ${err.message}`));
}

function mapVariant(v) {
  return {
    id: v.id,
    name: v.name,
    stock_quantity: v.stock_quantity ?? 0,
    low_stock_threshold: toNumberOrNull(v.low_stock_threshold),
    is_active: !!v.is_active,
  };
}

// ─── List ──────────────────────────────────────────────

async function list(query) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const stock_status = query.stock_status || 'all';

  const { rows, total } = await repo.list({
    page, limit,
    search: query.search,
    category_id: query.category_id,
    brand_id: query.brand_id,
    stock_mode: query.stock_mode,
    stock_status,
  });

  const ids = rows.map((r) => r.id);
  const variantsByProduct = await repo.listVariantsForProductIds(ids);

  const items = rows.map((r) => {
    const variants = (variantsByProduct[r.id] || []).map(mapVariant);
    const totalStock = Number(r.total_stock ?? 0);
    const threshold = toNumberOrNull(r.low_stock_threshold);

    return {
      id: r.id,
      name: r.name,
      primary_image: r.primary_image ?? null,
      category: { id: r.category_id, name: r.category_name },
      brand: r.brand_id ? { id: r.brand_id, name: r.brand_name } : null,
      is_active: !!r.is_active,
      stock_mode: r.stock_mode ?? null,
      stock_quantity: r.stock_quantity ?? null,
      total_stock: totalStock,
      low_stock_threshold: threshold,
      stock_status: statusOf(totalStock, threshold),
      variants_count: variants.length,
      variants,
    };
  });

  return {
    items,
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

// ─── Single ────────────────────────────────────────────

async function getOne(productId) {
  const product = await repo.findProductStock(productId);
  if (!product || product.product_type !== 'physical') {
    throw ApiError.notFound('Physical product not found');
  }

  const variants = await repo.findVariantsByProduct(productId);
  const variantSum = variants.reduce((s, v) => s + (v.stock_quantity || 0), 0);
  const base = product.stock_quantity ?? 0;
  const totalStock = base + variantSum;
  const threshold = toNumberOrNull(product.low_stock_threshold);

  return {
    id: product.id,
    name: product.name,
    primary_image: product.primary_image ?? null,
    is_active: !!product.is_active,
    product_type: product.product_type,
    stock_mode: product.stock_mode ?? null,
    stock_quantity: product.stock_mode !== 'per_variant' ? base : null,
    low_stock_threshold: threshold,
    stock_status: statusOf(totalStock, threshold),
    total_stock: totalStock,
    variants: variants.map(mapVariant),
  };
}

// ─── Adjust (single endpoint, handles base + variant) ──

async function adjust(productId, delta, variantId = null) {
  if (!Number.isInteger(delta) || delta === 0) {
    throw ApiError.badRequest('delta must be a non-zero integer');
  }

  let notification = null;

  await db.transaction(async (conn) => {
    const product = await repo.lockProduct(conn, productId);
    if (!product) throw ApiError.notFound('Product not found');
    if (product.product_type !== 'physical') {
      throw ApiError.badRequest('Only physical products can be adjusted');
    }

    notification = variantId
      ? await adjustVariant(conn, product, variantId, delta)
      : await adjustBase(conn, product, delta);
  });

  if (notification) sendLowStockEmail(notification);

  return getOne(productId);
}

async function adjustBase(conn, product, delta) {
  const prevQty = product.stock_quantity ?? 0;
  const newQty = prevQty + delta;

  if (newQty < 0) {
    throw ApiError.badRequest(`Stock insuffisant (disponible : ${prevQty})`);
  }

  await repo.setProductStock(conn, product.id, newQty);

  return notificationsService.checkAndNotifyLowStock(conn, {
    product,
    variant: null,
    threshold: product.low_stock_threshold,
    prevQty,
    newQty,
  });
}

async function adjustVariant(conn, product, variantId, delta) {
  if (product.stock_mode !== 'per_variant') {
    throw ApiError.badRequest('This product does not use per-variant stock');
  }

  const variant = await repo.lockVariant(conn, variantId);
  if (!variant || variant.product_id !== product.id) {
    throw ApiError.notFound('Variant not found');
  }

  const prevQty = variant.stock_quantity ?? 0;
  const newQty = prevQty + delta;

  if (newQty < 0) {
    throw ApiError.badRequest(`Stock insuffisant (disponible : ${prevQty})`);
  }

  await repo.setVariantStock(conn, variantId, newQty);

  return notificationsService.checkAndNotifyLowStock(conn, {
    product,
    variant,
    threshold: variant.low_stock_threshold,
    prevQty,
    newQty,
  });
}

module.exports = { list, getOne, adjust };