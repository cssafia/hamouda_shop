
const ApiError = require('../../utils/apiError');
const db = require('../../config/database');
const { pool } = require('../../config/database');
const repo = require('./coupons.repository');

function sanitize(c) {
  return {
    id: c.id,
    code: c.code,
    scope: c.scope,
    discount_type: c.discount_type,
    discount_value: Number(c.discount_value),
    minimum_amount: c.minimum_amount != null ? Number(c.minimum_amount) : null,
    usage_limit: c.usage_limit,
    used_count: c.used_count,
    starts_at: c.starts_at,
    expires_at: c.expires_at,
    is_active: !!c.is_active,
    created_at: c.created_at,
    updated_at: c.updated_at,
  };
}

async function computeDiscount(code, lines, subtotal) {
  if (!code) return { valid: false, message: 'No coupon' };

  const coupon = await repo.findByCode(String(code).trim().toUpperCase());
  if (!coupon) return { valid: false, message: 'Coupon not found' };
  if (!coupon.is_active) return { valid: false, message: 'Coupon is not active' };

  const now = new Date();
  if (coupon.starts_at && new Date(coupon.starts_at) > now) {
    return { valid: false, message: 'Coupon not yet valid' };
  }
  if (coupon.expires_at && new Date(coupon.expires_at) < now) {
    return { valid: false, message: 'Coupon has expired' };
  }
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
    return { valid: false, message: 'Coupon usage limit reached' };
  }
  if (coupon.minimum_amount != null && subtotal < Number(coupon.minimum_amount)) {
    return {
      valid: false,
      message: `Minimum order amount is ${coupon.minimum_amount} DA`,
    };
  }

  let eligibleSubtotal = subtotal;

  if (coupon.scope === 'products') {
    const allowed = new Set(await repo.getProductIds(coupon.id));
    eligibleSubtotal = lines
      .filter((l) => allowed.has(l.product_id))
      .reduce((s, l) => s + l.line_total, 0);
  } else if (coupon.scope === 'categories') {
    const productIds = [...new Set(lines.map((l) => l.product_id))];
    if (productIds.length) {
      const ph = productIds.map(() => '?').join(',');
      const [rows] = await pool.execute(
        `SELECT id, category_id FROM products WHERE id IN (${ph})`,
        productIds
      );
      const catByProduct = Object.fromEntries(rows.map((r) => [r.id, r.category_id]));
      const allowed = new Set(await repo.getCategoryIds(coupon.id));
      eligibleSubtotal = lines
        .filter((l) => allowed.has(catByProduct[l.product_id]))
        .reduce((s, l) => s + l.line_total, 0);
    } else {
      eligibleSubtotal = 0;
    }
  }

  if (eligibleSubtotal <= 0) {
    return { valid: false, message: 'Coupon does not apply to any items in the cart' };
  }

  let discount =
    coupon.discount_type === 'percentage'
      ? (eligibleSubtotal * Number(coupon.discount_value)) / 100
      : Number(coupon.discount_value);

  discount = Math.min(discount, eligibleSubtotal);
  discount = Math.round(discount * 100) / 100;

  return {
    valid: true,
    discount,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      scope: coupon.scope,
      discount_type: coupon.discount_type,
      discount_value: Number(coupon.discount_value),
    },
    message: 'Coupon applied',
  };
}

async function validateForCart(code, cartView) {
  return computeDiscount(code, cartView.items, cartView.subtotal);
}

async function list(query) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const isActive =
    query.is_active === 'true' ? true :
    query.is_active === 'false' ? false : undefined;
  const { rows, total } = await repo.list({
    page, limit,
    search: query.search,
    is_active: isActive,
  });
  return {
    items: rows.map(sanitize),
    meta: { page, limit, total, pages: Math.ceil(total / limit) },
  };
}

async function getById(id) {
  const coupon = await repo.findById(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  const [product_ids, category_ids] = await Promise.all([
    repo.getProductIds(id),
    repo.getCategoryIds(id),
  ]);
  return { ...sanitize(coupon), product_ids, category_ids };
}

async function create(input) {
  const code = input.code.trim().toUpperCase();
  const existing = await repo.findByCode(code);
  if (existing) throw ApiError.conflict('Coupon code already exists');

  const id = await db.transaction(async (conn) => {
    const couponId = await repo.insert(conn, { ...input, code });
    if (input.scope === 'products' && input.product_ids?.length) {
      await repo.insertProducts(conn, couponId, input.product_ids);
    }
    if (input.scope === 'categories' && input.category_ids?.length) {
      await repo.insertCategories(conn, couponId, input.category_ids);
    }
    return couponId;
  });

  return getById(id);
}

async function update(id, input) {
  const coupon = await repo.findById(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');

  if (input.code) {
    const code = input.code.trim().toUpperCase();
    if (code !== coupon.code) {
      const dup = await repo.findByCode(code);
      if (dup) throw ApiError.conflict('Coupon code already exists');
      input.code = code;
    } else {
      delete input.code;
    }
  }

  const fields = {};
  const allowed = [
    'code', 'scope', 'discount_type', 'discount_value',
    'minimum_amount', 'usage_limit', 'starts_at', 'expires_at',
  ];
  for (const k of allowed) if (input[k] !== undefined) fields[k] = input[k];

  await db.transaction(async (conn) => {
    if (Object.keys(fields).length) await repo.update(id, fields);

    if (input.scope !== undefined || input.product_ids !== undefined) {
      await repo.deleteProducts(conn, id);
      if (input.scope === 'products' && input.product_ids?.length) {
        await repo.insertProducts(conn, id, input.product_ids);
      }
    }
    if (input.scope !== undefined || input.category_ids !== undefined) {
      await repo.deleteCategories(conn, id);
      if (input.scope === 'categories' && input.category_ids?.length) {
        await repo.insertCategories(conn, id, input.category_ids);
      }
    }
  });

  return getById(id);
}

async function setStatus(id, is_active) {
  const coupon = await repo.findById(id);
  if (!coupon) throw ApiError.notFound('Coupon not found');
  await repo.setStatus(id, is_active);
  return getById(id);
}

module.exports = {
  computeDiscount,
  validateForCart,
  list,
  getById,
  create,
  update,
  setStatus,
};