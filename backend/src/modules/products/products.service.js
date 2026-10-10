const ApiError = require('../../utils/apiError');
const db = require('../../config/database');
const { USAGE_KEYS } = require('../../config/constants');
const repo = require('./products.repository');
const specsRepo = require('./specifications.repository');
const variantsRepo = require('../variants/variants.repository');

// ─── Helpers ───────────────────────────────────────────

function validateUsages(usages) {
  if (!usages) return;
  for (const k of usages) {
    if (!USAGE_KEYS.includes(k)) throw ApiError.badRequest(`Unknown usage key: ${k}`);
  }
}

function assertTypeRules(productType, body) {
  if (productType === 'physical') {
    if (body.duration || body.version) {
      throw ApiError.badRequest('Physical products cannot have duration/version');
    }
  }

  if (productType === 'digital') {
    if (body.condition || body.color || body.included_accessories) {
      throw ApiError.badRequest('Digital products cannot have condition/color/accessories');
    }
    if (body.stock_quantity != null) {
      throw ApiError.badRequest('Digital products cannot have stock');
    }
    if (body.stock_mode) {
      throw ApiError.badRequest('Digital products cannot have stock_mode');
    }
    if (body.usages?.length) {
      throw ApiError.badRequest('Digital products cannot have usages');
    }
    if (body.specifications?.length) {
      throw ApiError.badRequest('Digital products cannot have specifications');
    }
    if (body.version) {
      throw ApiError.badRequest('Digital products cannot have version');
    }

    if (Array.isArray(body.variants)) {
      for (const v of body.variants) {
        if (v.overrides?.length) {
          throw ApiError.badRequest('Digital variants cannot have overrides');
        }
        if (v.stock_quantity != null) {
          throw ApiError.badRequest('Digital variants cannot have stock');
        }
      }
    }

    // Base plan is mandatory for every digital product.
    if (!body.duration) {
      throw ApiError.badRequest('Digital products require a duration on the base plan');
    }
    if (body.price === undefined || body.price === null) {
      throw ApiError.badRequest('Digital products require a price on the base plan');
    }
    if (body.profit === undefined || body.profit === null) {
      throw ApiError.badRequest('Digital products require a profit on the base plan');
    }
  }
}

function assertStockRules(productType, stockMode, stockQuantity, variants) {
  if (productType === 'digital') return;

  const hasVariants = Array.isArray(variants) && variants.length > 0;

  // ── 1. Base stock: required in EVERY physical mode (it's the default variant).
  if (stockQuantity === null || stockQuantity === undefined) {
    throw ApiError.badRequest('Physical products require a base stock_quantity');
  }

  // ── 2. Single mode (no variants): no stock_mode allowed.
  if (!hasVariants) {
    if (stockMode) {
      throw ApiError.badRequest('Products without variants cannot have stock_mode');
    }
    return;
  }

  // ── 3. Variant modes: stock_mode is mandatory.
  if (!stockMode) {
    throw ApiError.badRequest('Products with variants require a stock_mode');
  }

  if (stockMode === 'shared') {
    // Variants share the base pool → their own stock must be null.
    for (const v of variants) {
      if (v.stock_quantity != null) {
        throw ApiError.badRequest('Shared mode: variant stock_quantity must be null');
      }
    }
    return;
  }

  if (stockMode === 'per_variant') {
    // Each variant tracks its own stock.
    for (const v of variants) {
      if (v.stock_quantity === null || v.stock_quantity === undefined) {
        throw ApiError.badRequest('Per-variant mode: each variant requires stock_quantity');
      }
    }
    return;
  }
}

function computeDefaultVariantId(variants) {
  if (!variants?.length) return null;
  const available = variants.filter((v) => v.stock_quantity == null || v.stock_quantity > 0);
  const pool = available.length ? available : variants;
  let cheapest = pool[0];
  for (const v of pool) if (Number(v.price) < Number(cheapest.price)) cheapest = v;
  return cheapest.id;
}

// ─── Create ────────────────────────────────────────────

async function create(input) {
  const productType = input.product_type;

  assertTypeRules(productType, input);
  validateUsages(input.usages);

  const hasVariants = Array.isArray(input.variants) && input.variants.length > 0;
  assertStockRules(productType, input.stock_mode, input.stock_quantity, input.variants);

  // Normalize product-level stock.
  let productStock = input.stock_quantity ?? null;
  if (productType === 'digital') {
    productStock = null;
  }

  const id = await db.transaction(async (conn) => {
    const productId = await repo.insert(conn, {
      ...input,
      stock_quantity: productStock,
    });

    if (input.usages?.length) await repo.insertUsages(conn, productId, input.usages);

    if (input.specifications?.length) {
      await specsRepo.insertOverrides(
        conn, productId, null,
        input.specifications.map((s, i) => ({
          name: s.name, value: s.value, display_order: s.display_order ?? i,
        }))
      );
    }

    if (input.images?.length) await repo.insertImages(conn, productId, input.images);

    if (hasVariants) {
      for (const v of input.variants) {
        const isDigital = productType === 'digital';

        // Stock rules:
        //   digital → null
        //   physical shared → null
        //   physical per_variant → v.stock_quantity
        const stock = isDigital || input.stock_mode === 'shared'
          ? null
          : (v.stock_quantity ?? 0);

        // Name: digital variants use duration as the label. Physical requires name.
        const name = isDigital ? (v.name || v.duration) : v.name;

        // Profit: variant override wins; otherwise inherit product profit.
        const profit = v.profit ?? input.profit ?? 0;

        const variantId = await variantsRepo.insert(conn, {
          product_id: productId,
          name,
          price: v.price,
          promotional_price: v.promotional_price,
          profit,
          stock_quantity: stock,
          duration: v.duration,
          version: v.version,
        });

        if (v.overrides?.length) {
          await specsRepo.insertOverrides(conn, productId, variantId, v.overrides);
        }
      }
    }

    return productId;
  });

  return getAdminById(id);
}

// ─── Admin reads ───────────────────────────────────────

async function getAdminById(id) {
  const product = await repo.findById(id);
  if (!product) throw ApiError.notFound('Product not found');

  if (product.product_type === 'digital') {
    return getAdminSubscriptionById(product);
  }
  return getAdminPhysicalById(product);
}

async function getAdminPhysicalById(product) {
  const id = product.id;
  const [variants, images, baseSpecs, usages] = await Promise.all([
    variantsRepo.listByProduct(id, true),
    repo.listImagesByProduct(id),
    specsRepo.listBaseByProduct(id),
    repo.listUsagesByProduct(id),
  ]);

  const variantIds = variants.map((v) => v.id);
  const overrideRows = await specsRepo.listByVariantIds(variantIds);
  const overridesByVariant = overrideRows.reduce((acc, o) => {
    (acc[o.variant_id] = acc[o.variant_id] || []).push({ name: o.name, value: o.value });
    return acc;
  }, {});

  return {
    ...product,
    is_active: !!product.is_active,
    images,
    specifications: baseSpecs,
    usages,
    variants: variants.map((v) => ({
      ...v,
      is_active: !!v.is_active,
      overrides: overridesByVariant[v.id] || [],
    })),
  };
}

async function getAdminSubscriptionById(product) {
  const id = product.id;
  const [variants, images, categoryRow, brandRow] = await Promise.all([
    variantsRepo.listByProduct(id, true),
    repo.listImagesByProduct(id),
    db.pool.execute(
      `SELECT id, name FROM categories WHERE id = ? LIMIT 1`,
      [product.category_id]
    ).then(([r]) => r[0] || null),
    product.brand_id
      ? db.pool.execute(
          `SELECT id, name FROM brands WHERE id = ? LIMIT 1`,
          [product.brand_id]
        ).then(([r]) => r[0] || null)
      : Promise.resolve(null),
  ]);

  return {
    id: product.id,
    product_type: 'digital',
    name: product.name,
    description: product.description,
    category: categoryRow,
    brand: brandRow,
    is_active: !!product.is_active,
    created_at: product.created_at,
    updated_at: product.updated_at,
    images,
    base_plan: {
      duration: product.duration,
      price: Number(product.price),
      promotional_price: product.promotional_price != null ? Number(product.promotional_price) : null,
      profit: Number(product.profit),
    },
    variants: variants.map((v) => ({
      id: v.id,
      duration: v.duration,
      price: Number(v.price),
      promotional_price: v.promotional_price != null ? Number(v.promotional_price) : null,
      profit: Number(v.profit),
      is_active: !!v.is_active,
    })),
  };
}

async function listAdmin(query) {
  const page = query.page || 1;
  const limit = query.limit || 20;
  const isActiveFilter =
    query.is_active === 'true' ? true :
    query.is_active === 'false' ? false : undefined;

  const { rows, total } = await repo.listAdmin({
    page, limit,
    search: query.search,
    category_id: query.category_id,
    brand_id: query.brand_id,
    product_type: query.product_type,
    is_active: isActiveFilter,
    sort: query.sort,
  });

  const ids = rows.map((r) => r.id);
  const [variantRows, primaries, usagesRows] = await Promise.all([
    variantsRepo.listByProductIds(ids, true),
    repo.listPrimaryImagesByProductIds(ids),
    repo.listUsagesByProductIds(ids),
  ]);

  const variantsByProduct = variantRows.reduce((acc, v) => {
    (acc[v.product_id] = acc[v.product_id] || []).push(v);
    return acc;
  }, {});
  const primaryByProduct = Object.fromEntries(primaries.map((p) => [p.product_id, p.url]));
  const usagesByProduct = usagesRows.reduce((acc, u) => {
    (acc[u.product_id] = acc[u.product_id] || []).push(u.usage_key);
    return acc;
  }, {});

  const items = rows.map((p) => {
    const variants = variantsByProduct[p.id] || [];
    const prices = variants.map((v) => Number(v.price));
    return {
      id: p.id,
      name: p.name,
      product_type: p.product_type,
      is_active: !!p.is_active,
      stock_mode: p.stock_mode,
      category: { id: p.category_id, name: p.category_name },
      brand: p.brand_id ? { id: p.brand_id, name: p.brand_name } : null,
      price: Number(p.price),
      promotional_price: p.promotional_price != null ? Number(p.promotional_price) : null,
      price_range: variants.length ? { min: Math.min(...prices), max: Math.max(...prices) } : null,
      stock: p.product_type === 'digital'
        ? null
        : p.stock_mode === 'shared'
          ? p.stock_quantity
          : p.stock_mode === 'per_variant'
            ? (p.stock_quantity || 0) + variants.reduce((s, v) => s + (v.stock_quantity || 0), 0)
            : p.stock_quantity,
      variants_count: variants.length,
      primary_image: primaryByProduct[p.id] || null,
      usages: usagesByProduct[p.id] || [],
      duration: p.duration,
      created_at: p.created_at,
      updated_at: p.updated_at,
    };
  });

  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
}

// ─── Public reads ──────────────────────────────────────

async function listPublic(query) {
  const page = query.page || 1;
  const limit = query.limit || 20;

  const { rows, total } = await repo.listPublic({
    page, limit,
    category_id: query.category_id,
    brand_id: query.brand_id,
    usage: query.usage,
    price_min: query.price_min,
    price_max: query.price_max,
    availability: query.availability || 'all',
    product_type: query.product_type || 'all',
    search: query.search,
    sort: query.sort,
  });

  const ids = rows.map((r) => r.id);
  const [primaries, usagesRows] = await Promise.all([
    repo.listPrimaryImagesByProductIds(ids),
    repo.listUsagesByProductIds(ids),
  ]);
  const primaryByProduct = Object.fromEntries(primaries.map((p) => [p.product_id, p.url]));
  const usagesByProduct = usagesRows.reduce((acc, u) => {
    (acc[u.product_id] = acc[u.product_id] || []).push(u.usage_key);
    return acc;
  }, {});

  const items = rows.map((p) => ({
    id: p.id,
    name: p.name,
    product_type: p.product_type,
    category: { id: p.category_id, name: p.category_name },
    brand: p.brand_id ? { id: p.brand_id, name: p.brand_name } : null,
    price: Number(p.effective_price),
    promotional_price: p.promotional_price != null ? Number(p.promotional_price) : null,
    is_on_promo: p.promotional_price != null && Number(p.promotional_price) < Number(p.effective_price),
    has_variants: !!p.has_variants,
    availability: p.is_available ? 'available' : 'out_of_stock',
    primary_image: primaryByProduct[p.id] || null,
    usages: usagesByProduct[p.id] || [],
  }));

  return { items, meta: { page, limit, total, pages: Math.ceil(total / limit) } };
}

async function getPublicById(id) {
  const product = await repo.findById(id);
  if (!product || !product.is_active) throw ApiError.notFound('Product not found');

  const [variants, images, baseSpecs, usages, categoryRow, brandRow] = await Promise.all([
    variantsRepo.listByProduct(product.id, false),
    repo.listImagesByProduct(product.id),
    specsRepo.listBaseByProduct(product.id),
    repo.listUsagesByProduct(product.id),
    db.pool.execute(`SELECT id, name FROM categories WHERE id = ? LIMIT 1`, [product.category_id])
      .then(([r]) => r[0] || null),
    product.brand_id
      ? db.pool.execute(`SELECT id, name FROM brands WHERE id = ? LIMIT 1`, [product.brand_id])
          .then(([r]) => r[0] || null)
      : Promise.resolve(null),
  ]);

  const variantIds = variants.map((v) => v.id);
  const overrideRows = await specsRepo.listByVariantIds(variantIds);
  const overridesByVariant = overrideRows.reduce((acc, o) => {
    (acc[o.variant_id] = acc[o.variant_id] || []).push({ name: o.name, value: o.value });
    return acc;
  }, {});

  const isAvailable = (v) => {
    if (product.product_type === 'digital') return true;
    if (product.stock_mode === 'shared') return product.stock_quantity > 0;
    if (product.stock_mode === 'per_variant') return (v.stock_quantity || 0) > 0;
    return product.stock_quantity > 0;
  };

  const publicVariants = variants.map((v) => ({
    id: v.id,
    name: v.name,
    price: Number(v.price),
    promotional_price: v.promotional_price != null ? Number(v.promotional_price) : null,
    duration: v.duration,
    version: v.version,
    availability: isAvailable(v) ? 'available' : 'out_of_stock',
    overrides: overridesByVariant[v.id] || [],
  }));

  const productAvailability = product.product_type === 'digital'
    ? true
    : product.stock_mode === 'shared'
      ? product.stock_quantity > 0
      : publicVariants.some((v) => v.availability === 'available');

  const displayPrice = publicVariants.length
    ? Math.min(...publicVariants.map((v) => v.price))
    : Number(product.price);

  const defaultVariantId = computeDefaultVariantId(
    variants.map((v) => ({
      id: v.id,
      price: v.price,
      stock_quantity: product.stock_mode === 'shared' ? 1 : v.stock_quantity,
    }))
  );

  return {
    id: product.id,
    name: product.name,
    product_type: product.product_type,
    description: product.description,
    category: categoryRow,
    brand: brandRow,
    condition: product.condition,
    color: product.color,
    included_accessories: product.included_accessories,
    duration: product.duration,
    version: product.version,
    price: displayPrice,
    promotional_price: product.promotional_price != null ? Number(product.promotional_price) : null,
    has_variants: publicVariants.length > 0,
    availability: productAvailability ? 'available' : 'out_of_stock',
    default_variant_id: defaultVariantId,
    images,
    specifications: baseSpecs,
    variants: publicVariants,
    usages,
  };
}

// ─── Update ────────────────────────────────────────────

async function update(id, input) {
  const product = await repo.findById(id);
  if (!product) throw ApiError.notFound('Product not found');

  if (input.product_type !== undefined && input.product_type !== product.product_type) {
    throw ApiError.badRequest('product_type cannot be changed');
  }

  assertTypeRules(product.product_type, input);
  validateUsages(input.usages);

  // ── Existing variants in DB
  const existingVariants = await variantsRepo.listByProduct(id, false);
  const existingIds = new Set(existingVariants.map((v) => v.id));

  // ── Target state comes from the payload, not from the DB.
  //    incoming === null means "the caller didn't touch variants".
  const incoming = Array.isArray(input.variants) ? input.variants : null;
  const targetHasVariants = incoming !== null
    ? incoming.length > 0
    : existingVariants.length > 0;

  const newMode = targetHasVariants
    ? (input.stock_mode !== undefined ? input.stock_mode : product.stock_mode)
    : null;

  // ── Stock validation (mirrors assertStockRules for the target state)
  if (product.product_type === 'physical') {
    if (targetHasVariants) {
      if (!newMode) {
        throw ApiError.badRequest('Products with variants require a stock_mode');
      }

      const base = input.stock_quantity !== undefined
        ? input.stock_quantity
        : product.stock_quantity;
      if (base === null || base === undefined) {
        throw ApiError.badRequest('Base stock_quantity is required');
      }

      const list = incoming ?? existingVariants;
      if (newMode === 'per_variant') {
        for (const v of list) {
          if (v.stock_quantity === null || v.stock_quantity === undefined) {
            throw ApiError.badRequest(
              `Variant "${v.name || 'unnamed'}" needs a stock_quantity in per-variant mode`
            );
          }
        }
      } else if (newMode === 'shared') {
        for (const v of list) {
          if (v.stock_quantity != null) {
            throw ApiError.badRequest('Shared mode: variant stock_quantity must be null');
          }
        }
      }
    } else {
      if (input.stock_mode) {
        throw ApiError.badRequest('Products without variants cannot have stock_mode');
      }
      const base = input.stock_quantity !== undefined
        ? input.stock_quantity
        : product.stock_quantity;
      if (base === null || base === undefined) {
        throw ApiError.badRequest('Products without variants require stock_quantity');
      }
    }
  }

  // ── Build product-level patch
  const fields = {};
  const allowed = [
    'category_id', 'brand_id', 'name', 'description',
    'price', 'promotional_price', 'profit', 'stock_quantity', 'stock_mode',
    'condition', 'color', 'included_accessories', 'duration', 'version', 'is_active',
  ];
  for (const k of allowed) if (input[k] !== undefined) fields[k] = input[k];

  if (product.product_type === 'digital') {
    fields.stock_quantity = null;
    fields.stock_mode = null;
  } else {
    // Physical: always mirror the actual target mode.
    fields.stock_mode = targetHasVariants ? newMode : null;
  }

  await db.transaction(async (conn) => {
    if (Object.keys(fields).length) await repo.update(id, fields);

    // ── Sync variants when the payload explicitly provides them
    if (incoming !== null) {
      // 1) Delete variants removed from the list
      const incomingIds = incoming.filter((v) => v.id).map((v) => v.id);
      const toDelete = [...existingIds].filter((vid) => !incomingIds.includes(vid));
      for (const vid of toDelete) {
        await specsRepo.deleteByVariant(conn, vid);
        await variantsRepo.remove(vid, conn);
      }

      // 2) Insert new + update existing
      for (const v of incoming) {
        const isShared = newMode === 'shared';
        const stock = isShared ? null : (v.stock_quantity ?? 0);

        const payload = {
          name: v.name,
          price: v.price,
          promotional_price: v.promotional_price ?? null,
          profit: v.profit ?? product.profit ?? 0,
          stock_quantity: stock,
          duration: v.duration ?? null,
          version: v.version ?? null,
        };

        let variantId;
        if (v.id && existingIds.has(v.id)) {
          await variantsRepo.update(v.id, payload, conn);
          variantId = v.id;
          // Wipe old overrides — we re-insert fresh below
          await specsRepo.deleteByVariant(conn, v.id);
        } else {
          variantId = await variantsRepo.insert(conn, { product_id: id, ...payload });
        }

        if (v.overrides?.length) {
          await specsRepo.insertOverrides(
            conn, id, variantId,
            v.overrides.map((o, i) => ({
              name: o.name,
              value: o.value,
              display_order: o.display_order ?? i,
            }))
          );
        }
      }
    } else if (
      targetHasVariants &&
      newMode === 'shared' &&
      product.stock_mode !== 'shared'
    ) {
      // No incoming list, but switching existing variants to shared → nullify.
      await variantsRepo.nullifyStockByProduct(conn, id);
    }

    // ── Usages / base specs / images — unchanged
    if (input.usages !== undefined) {
      await repo.deleteUsages(conn, id);
      if (input.usages.length) await repo.insertUsages(conn, id, input.usages);
    }

    if (input.specifications !== undefined) {
      await specsRepo.deleteBaseByProduct(conn, id);
      if (input.specifications.length) {
        await specsRepo.insertOverrides(
          conn, id, null,
          input.specifications.map((s, i) => ({
            name: s.name, value: s.value, display_order: s.display_order ?? i,
          }))
        );
      }
    }

    if (input.images !== undefined) {
      await repo.deleteImages(conn, id);
      if (input.images.length) await repo.insertImages(conn, id, input.images);
    }
  });

  return getAdminById(id);
}

async function setStatus(id, is_active) {
  const product = await repo.findById(id);
  if (!product) throw ApiError.notFound('Product not found');
  await repo.setStatus(id, is_active);
  return getAdminById(id);
}

module.exports = {
  create,
  update,
  setStatus,
  listAdmin,
  listPublic,
  getAdminById,
  getPublicById,
};