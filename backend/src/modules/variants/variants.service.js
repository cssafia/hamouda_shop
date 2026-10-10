
const ApiError = require('../../utils/apiError');
const db = require('../../config/database');
const productsRepo = require('../products/products.repository');
const specsRepo = require('../products/specifications.repository');
const repo = require('./variants.repository');

async function getById(id) {
  const variant = await repo.findById(id);
  if (!variant) throw ApiError.notFound('Variant not found');
  const overrides = await specsRepo.listByVariant(id);
  return { ...variant, overrides };
}

async function listForProduct(productId, includeInactive = true) {
  const product = await productsRepo.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');
  const variants = await repo.listByProduct(productId, includeInactive);
  const ids = variants.map((v) => v.id);
  const overrides = await specsRepo.listByVariantIds(ids);
  const byVariant = overrides.reduce((acc, o) => {
    (acc[o.variant_id] = acc[o.variant_id] || []).push({ name: o.name, value: o.value });
    return acc;
  }, {});
  return variants.map((v) => ({ ...v, overrides: byVariant[v.id] || [] }));
}

async function create(productId, input) {
  const product = await productsRepo.findById(productId);
  if (!product) throw ApiError.notFound('Product not found');

  // Stock rules
  if (product.product_type === 'digital') {
    if (input.stock_quantity != null) {
      throw ApiError.badRequest('Digital variants cannot have stock');
    }
  } else {
    if (product.stock_mode === 'per_variant') {
      if (input.stock_quantity === null || input.stock_quantity === undefined) {
        throw ApiError.badRequest('Per-variant mode requires stock_quantity');
      }
    } else if (product.stock_mode === 'shared') {
      if (input.stock_quantity != null) {
        throw ApiError.badRequest('Shared mode: variant stock_quantity must be null');
      }
    }
  }

  const id = await db.transaction(async (conn) => {
    const variantId = await repo.insert(conn, {
      product_id: productId,
      name: input.name,
      price: input.price,
      promotional_price: input.promotional_price,
      profit: input.profit ?? 0,
      stock_quantity:
        product.product_type === 'digital' || product.stock_mode === 'shared'
          ? null
          : input.stock_quantity,
      duration: input.duration,
      version: input.version,
    });
    if (input.overrides?.length) {
      await specsRepo.insertOverrides(conn, productId, variantId, input.overrides);
    }
    return variantId;
  });

  return getById(id);
}

async function update(productId, variantId, input) {
  const variant = await repo.findById(variantId);
  if (!variant || variant.product_id !== Number(productId)) {
    throw ApiError.notFound('Variant not found');
  }
  const product = await productsRepo.findById(productId);

  const fields = {};
  const allowed = ['name', 'price', 'promotional_price', 'profit', 'stock_quantity', 'duration', 'version'];
  for (const k of allowed) if (input[k] !== undefined) fields[k] = input[k];

  if (product.product_type === 'digital' && fields.stock_quantity != null) {
    throw ApiError.badRequest('Digital variants cannot have stock');
  }
  if (product.stock_mode === 'shared' && fields.stock_quantity != null) {
    throw ApiError.badRequest('Shared mode: variant stock_quantity must be null');
  }
  if (product.stock_mode === 'per_variant' && 'stock_quantity' in fields && fields.stock_quantity === null) {
    throw ApiError.badRequest('Per-variant mode requires stock_quantity');
  }

  await db.transaction(async (conn) => {
    if (Object.keys(fields).length) await repo.update(variantId, fields);
    if (input.overrides !== undefined) {
      await specsRepo.deleteByVariant(conn, variantId);
      if (input.overrides.length) {
        await specsRepo.insertOverrides(conn, productId, variantId, input.overrides);
      }
    }
  });

  return getById(variantId);
}

async function setStatus(productId, variantId, is_active) {
  const variant = await repo.findById(variantId);
  if (!variant || variant.product_id !== Number(productId)) {
    throw ApiError.notFound('Variant not found');
  }
  if (!is_active) {
    const activeCount = await repo.countByProduct(productId, true);
    if (activeCount <= 1) {
      throw ApiError.badRequest('Cannot deactivate the last active variant');
    }
  }
  await repo.setStatus(variantId, is_active);
  return getById(variantId);
}

module.exports = { getById, listForProduct, create, update, setStatus };