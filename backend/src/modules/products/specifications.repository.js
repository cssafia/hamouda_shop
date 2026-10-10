
const { pool } = require('../../config/database');

// ─── Base specs (variant_id IS NULL) ───────────────────

async function listBaseByProduct(productId) {
  const [rows] = await pool.execute(
    `SELECT id, name, value, display_order
       FROM product_specifications
      WHERE product_id = ? AND variant_id IS NULL
      ORDER BY display_order ASC, id ASC`,
    [productId]
  );
  return rows;
}

async function deleteBaseByProduct(conn, productId) {
  await conn.execute(
    `DELETE FROM product_specifications
      WHERE product_id = ? AND variant_id IS NULL`,
    [productId]
  );
}

// ─── Variant overrides ─────────────────────────────────

async function listByVariant(variantId) {
  const [rows] = await pool.execute(
    `SELECT name, value
       FROM product_specifications
      WHERE variant_id = ?
      ORDER BY display_order ASC, id ASC`,
    [variantId]
  );
  return rows;
}

async function listByVariantIds(variantIds) {
  if (!variantIds.length) return [];
  const ph = variantIds.map(() => '?').join(',');
  const [rows] = await pool.execute(
    `SELECT variant_id, name, value
       FROM product_specifications
      WHERE variant_id IN (${ph})
      ORDER BY display_order ASC, id ASC`,
    variantIds
  );
  return rows;
}

async function deleteByVariant(conn, variantId) {
  await conn.execute(
    `DELETE FROM product_specifications WHERE variant_id = ?`,
    [variantId]
  );
}

async function insertOverrides(conn, productId, variantId, overrides) {
  if (!overrides || overrides.length === 0) return;
  const placeholders = overrides.map(() => '(?, ?, ?, ?, ?)').join(',');
  await conn.execute(
    `INSERT INTO product_specifications
       (product_id, variant_id, name, value, display_order)
     VALUES ${placeholders}`,
    overrides.flatMap((o, i) => [productId, variantId, o.name, o.value, i])
  );
}

module.exports = {
  listBaseByProduct,
  deleteBaseByProduct,
  listByVariant,
  listByVariantIds,
  deleteByVariant,
  insertOverrides,
};