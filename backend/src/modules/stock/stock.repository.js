
const { pool } = require('../../config/database');

async function list({ page, limit, search, category_id, brand_id, stock_mode, stock_status }) {
  const innerWhere = ["p.product_type = 'physical'"];
  const innerParams = [];

  if (search) { innerWhere.push('p.name LIKE ?'); innerParams.push(`%${search}%`); }
  if (category_id) { innerWhere.push('p.category_id = ?'); innerParams.push(category_id); }
  if (brand_id)    { innerWhere.push('p.brand_id = ?');    innerParams.push(brand_id); }

  if (stock_mode === 'single') innerWhere.push('p.stock_mode IS NULL');
  else if (stock_mode) { innerWhere.push('p.stock_mode = ?'); innerParams.push(stock_mode); }

  const inner = `
    SELECT
      p.id, p.name, p.is_active, p.stock_mode, p.stock_quantity, p.low_stock_threshold,
      c.id AS category_id, c.name AS category_name,
      b.id AS brand_id, b.name AS brand_name,
      (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image,
      CASE
        WHEN p.stock_mode = 'per_variant' THEN
          COALESCE(p.stock_quantity, 0) + COALESCE(
            (SELECT SUM(stock_quantity) FROM product_variants
              WHERE product_id = p.id AND is_active = 1), 0)
        ELSE COALESCE(p.stock_quantity, 0)
      END AS total_stock
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    WHERE ${innerWhere.join(' AND ')}
  `;

  // Filter on a per-product threshold. Products with no threshold are never "low".
  const outerWhere = [];
  if (stock_status === 'out') {
    outerWhere.push('t.total_stock = 0');
  } else if (stock_status === 'low') {
    outerWhere.push('t.low_stock_threshold IS NOT NULL AND t.total_stock > 0 AND t.total_stock <= t.low_stock_threshold');
  } else if (stock_status === 'issues') {
    outerWhere.push('(t.total_stock = 0 OR (t.low_stock_threshold IS NOT NULL AND t.total_stock > 0 AND t.total_stock <= t.low_stock_threshold))');
  }
  const outerWhereSql = outerWhere.length ? `WHERE ${outerWhere.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const sql = `
    SELECT * FROM (${inner}) t
    ${outerWhereSql}
    ORDER BY
      CASE
        WHEN t.total_stock = 0 THEN 0
        WHEN t.low_stock_threshold IS NOT NULL AND t.total_stock <= t.low_stock_threshold THEN 1
        ELSE 2
      END ASC,
      t.total_stock ASC,
      t.id DESC
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(sql, [...innerParams, limit, offset]);

  const countSql = `SELECT COUNT(*) AS total FROM (${inner}) t ${outerWhereSql}`;
  const [countRows] = await pool.execute(countSql, innerParams);

  return { rows, total: countRows[0].total };
}

async function listVariantsForProductIds(productIds) {
  if (!productIds.length) return {};
  const ph = productIds.map(() => '?').join(',');
  const [rows] = await pool.execute(
    `SELECT id, product_id, name, stock_quantity, is_active, low_stock_threshold
       FROM product_variants
      WHERE product_id IN (${ph}) AND is_active = 1
      ORDER BY product_id, id`,
    productIds
  );
  const grouped = {};
  for (const r of rows) {
    (grouped[r.product_id] ||= []).push(r);
  }
  return grouped;
}

async function findProductStock(productId) {
  const [rows] = await pool.execute(
    `SELECT p.id, p.name, p.is_active, p.product_type, p.stock_mode,
            p.stock_quantity, p.low_stock_threshold,
            (SELECT url FROM product_images WHERE product_id = p.id AND is_primary = 1 LIMIT 1) AS primary_image
       FROM products p WHERE p.id = ? LIMIT 1`,
    [productId]
  );
  return rows[0] || null;
}

async function findVariantsByProduct(productId) {
  const [rows] = await pool.execute(
    `SELECT id, name, stock_quantity, is_active, low_stock_threshold
       FROM product_variants
      WHERE product_id = ? AND is_active = 1
      ORDER BY id`,
    [productId]
  );
  return rows;
}

async function lockProduct(conn, productId) {
  const [rows] = await conn.execute(
    `SELECT id, name, product_type, stock_mode, stock_quantity, low_stock_threshold
       FROM products WHERE id = ? FOR UPDATE`,
    [productId]
  );
  return rows[0] || null;
}

async function lockVariant(conn, variantId) {
  const [rows] = await conn.execute(
    `SELECT id, product_id, name, stock_quantity, is_active, low_stock_threshold
       FROM product_variants WHERE id = ? FOR UPDATE`,
    [variantId]
  );
  return rows[0] || null;
}

async function setProductStock(conn, productId, qty) {
  await conn.execute(
    `UPDATE products SET stock_quantity = ? WHERE id = ?`,
    [qty, productId]
  );
}

async function setVariantStock(conn, variantId, qty) {
  await conn.execute(
    `UPDATE product_variants SET stock_quantity = ? WHERE id = ?`,
    [qty, variantId]
  );
}

async function sumActiveVariantStocks(conn, productId) {
  const exec = conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
  const [rows] = await exec(
    `SELECT COALESCE(SUM(stock_quantity), 0) AS total
       FROM product_variants
      WHERE product_id = ? AND is_active = 1`,
    [productId]
  );
  return Number(rows[0].total);
}

module.exports = {
  list, listVariantsForProductIds,
  findProductStock, findVariantsByProduct,
  lockProduct, lockVariant,
  setProductStock, setVariantStock,
  sumActiveVariantStocks,
};