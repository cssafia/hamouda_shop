
const ApiError = require('../../utils/apiError');
const { pool } = require('../../config/database');
const repo = require('./cart.repository');
const productsRepo = require('../products/products.repository');
const variantsRepo = require('../variants/variants.repository');
const couponsService = require('../coupons/coupons.service');

const MAX_QTY_PER_LINE = 20;

function getSessionId(req) {
  const sid = req.headers['x-session-id'];
  if (!sid || typeof sid !== 'string' || sid.length < 8 || sid.length > 100) {
    throw ApiError.badRequest('Missing or invalid X-Session-Id header');
  }
  return sid;
}

function effectivePrice(price, promo) {
  const p = Number(price);
  const pr = promo != null ? Number(promo) : null;
  return pr != null && pr < p ? pr : p;
}

async function loadLineDetails(items) {
  if (items.length === 0) {
    return { products: {}, variants: {}, images: {} };
  }

  const productIds = [...new Set(items.map((i) => i.product_id))];
  const variantIds = [...new Set(items.map((i) => i.variant_id).filter(Boolean))];

  const productPh = productIds.map(() => '?').join(',');

  const variantSql = variantIds.length
    ? `SELECT id, product_id, name, price, promotional_price,
              stock_quantity, is_active, duration
         FROM product_variants WHERE id IN (${variantIds.map(() => '?').join(',')})`
    : null;

  const [productRows, variantRows, imageRows] = await Promise.all([
    pool.execute(
      `SELECT id, name, product_type, price, promotional_price,
              stock_quantity, stock_mode, is_active
         FROM products WHERE id IN (${productPh})`,
      productIds
    ).then(([r]) => r),
    variantSql ? pool.execute(variantSql, variantIds).then(([r]) => r) : Promise.resolve([]),
    pool.execute(
      `SELECT product_id, url FROM product_images
        WHERE product_id IN (${productPh}) AND is_primary = 1`,
      productIds
    ).then(([r]) => r),
  ]);

  return {
    products: Object.fromEntries(productRows.map((p) => [p.id, p])),
    variants: Object.fromEntries(variantRows.map((v) => [v.id, v])),
    images: Object.fromEntries(imageRows.map((i) => [i.product_id, i.url])),
  };
}

// variant_id = null means "the base config / base plan" (variant 0).
// Mode-aware availability:
//   digital         → always available while active
//   shared          → pool decides (product.stock_quantity)
//   per_variant     → variant_id null → product.stock_quantity (base)
//                     variant_id set  → variant.stock_quantity
//   no variants     → product.stock_quantity
function computeAvailability(product, variant) {
  if (!product || !product.is_active) return 'unavailable';
  if (product.product_type === 'digital') return 'available';

  if (product.stock_mode === 'shared') {
    return (product.stock_quantity ?? 0) > 0 ? 'available' : 'out_of_stock';
  }
  if (variant) {
    if (!variant.is_active) return 'unavailable';
    return (variant.stock_quantity ?? 0) > 0 ? 'available' : 'out_of_stock';
  }
  return (product.stock_quantity ?? 0) > 0 ? 'available' : 'out_of_stock';
}

function emptyView() {
  return { items: [], subtotal: 0, discount: 0, coupon: null, total: 0, items_count: 0 };
}

async function buildCartView(cart, couponCode) {
  const items = await repo.listItems(cart.id);
  if (items.length === 0) return emptyView();

  const { products, variants, images } = await loadLineDetails(items);

  const lines = items.map((it) => {
    const product = products[it.product_id];
    const variant = it.variant_id ? variants[it.variant_id] : null;

    if (!product) {
      return {
        id: it.id, product_id: it.product_id, variant_id: it.variant_id,
        quantity: it.quantity, name: 'Unavailable', variant_name: null,
        image: null, unit_price: 0, line_total: 0, availability: 'unavailable',
      };
    }

    const unit = variant
      ? effectivePrice(variant.price, variant.promotional_price)
      : effectivePrice(product.price, product.promotional_price);

    return {
      id: it.id,
      product_id: it.product_id,
      variant_id: it.variant_id,
      name: product.name,
      variant_name: variant ? (variant.name || variant.duration) : null,
      image: images[it.product_id] || null,
      unit_price: unit,
      quantity: it.quantity,
      line_total: unit * it.quantity,
      availability: computeAvailability(product, variant),
    };
  });

  const subtotal = lines
    .filter((l) => l.availability !== 'unavailable')
    .reduce((s, l) => s + l.line_total, 0);

  let discount = 0;
  let coupon = null;
  if (couponCode) {
    const result = await couponsService.computeDiscount(couponCode, lines, subtotal);
    if (result.valid) {
      discount = result.discount;
      coupon = result.coupon;
    } else {
      coupon = { code: couponCode, error: result.message };
    }
  }

  return {
    items: lines,
    subtotal,
    discount,
    coupon,
    total: Math.max(0, subtotal - discount),
    items_count: lines.length,
  };
}

async function getCart(sessionId, couponCode) {
  const cart = await repo.findOrCreate(sessionId);
  return buildCartView(cart, couponCode);
}

// Mode-aware stock check for one cart line.
//   digital      → no stock
//   shared       → product.stock_quantity is the pool (variant ignored)
//   per_variant  → variant_id set: variant.stock_quantity
//                  variant_id null: product.stock_quantity (base config)
//   no variants  → product.stock_quantity
async function checkStockForProduct(product, variant, totalQty) {
  if (product.product_type === 'digital') return;

  if (product.stock_mode === 'shared') {
    if ((product.stock_quantity ?? 0) < totalQty) {
      throw ApiError.badRequest('Not enough stock');
    }
    return;
  }

  if (variant) {
    if ((variant.stock_quantity ?? 0) < totalQty) {
      throw ApiError.badRequest('Not enough stock');
    }
    return;
  }

  if ((product.stock_quantity ?? 0) < totalQty) {
    throw ApiError.badRequest('Not enough stock');
  }
}

// variant_id = null is ALWAYS valid — it means "the base config / base plan"
// (variant 0). This applies to every product type:
//   - single-config physical (no variants)
//   - physical shared (base price, pool stock)
//   - physical per_variant (base config with its own stock on products.stock_quantity)
//   - digital single-plan
//   - digital multi-plan (base plan lives on product row)
// If variant_id is provided, it must exist and belong to this product.
async function addItem(sessionId, { product_id, variant_id, quantity }) {
  const cart = await repo.findOrCreate(sessionId);

  const product = await productsRepo.findById(product_id);
  if (!product || !product.is_active) {
    throw ApiError.notFound('Product not found or inactive');
  }

  let variant = null;
  if (variant_id) {
    variant = await variantsRepo.findById(variant_id);
    if (!variant || variant.product_id !== product.id) {
      throw ApiError.notFound('Variant not found');
    }
    if (!variant.is_active) {
      throw ApiError.badRequest('Variant is not available');
    }
  }

  const existing = await repo.findItem(cart.id, product_id, variant_id);
  const existingQty = existing ? existing.quantity : 0;
  const newQty = existingQty + quantity;

  if (newQty > MAX_QTY_PER_LINE) {
    throw ApiError.badRequest(`Maximum ${MAX_QTY_PER_LINE} per item`);
  }

  if (product.product_type !== 'digital') {
    if (product.stock_mode === 'shared') {
      const otherQty = await repo.sumQuantityExcludingItem(
        cart.id, product_id, existing ? existing.id : 0
      );
      await checkStockForProduct(product, null, otherQty + newQty);
    } else {
      await checkStockForProduct(product, variant, newQty);
    }
  }

  if (existing) {
    await repo.updateQuantity(existing.id, newQty);
  } else {
    await repo.insertItem(cart.id, { product_id, variant_id, quantity });
  }

  return buildCartView(cart);
}

async function updateQuantity(sessionId, itemId, quantity) {
  const cart = await repo.findBySessionId(sessionId);
  if (!cart) throw ApiError.notFound('Cart not found');

  const item = await repo.findItemById(cart.id, itemId);
  if (!item) throw ApiError.notFound('Item not found');

  if (quantity > MAX_QTY_PER_LINE) {
    throw ApiError.badRequest(`Maximum ${MAX_QTY_PER_LINE} per item`);
  }

  const product = await productsRepo.findById(item.product_id);
  if (!product || !product.is_active) {
    throw ApiError.badRequest('Product is no longer available');
  }

  if (product.product_type !== 'digital') {
    if (product.stock_mode === 'shared') {
      const otherQty = await repo.sumQuantityExcludingItem(
        cart.id, product.id, item.id
      );
      await checkStockForProduct(product, null, otherQty + quantity);
    } else if (item.variant_id) {
      const variant = await variantsRepo.findById(item.variant_id);
      await checkStockForProduct(product, variant, quantity);
    } else {
      await checkStockForProduct(product, null, quantity);
    }
  }

  await repo.updateQuantity(itemId, quantity);
  return buildCartView(cart);
}

async function removeItem(sessionId, itemId) {
  const cart = await repo.findBySessionId(sessionId);
  if (!cart) throw ApiError.notFound('Cart not found');
  await repo.deleteItem(cart.id, itemId);
  return buildCartView(cart);
}

async function clearCart(sessionId) {
  const cart = await repo.findBySessionId(sessionId);
  if (!cart) return emptyView();
  await repo.clear(cart.id);
  return emptyView();
}

module.exports = {
  getSessionId,
  getCart,
  addItem,
  updateQuantity,
  removeItem,
  clearCart,
  buildCartView,
  emptyView,
};