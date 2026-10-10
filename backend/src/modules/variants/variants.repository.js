const { pool } = require('../../config/database');

async function listByProduct(productId, includeInactive = false) {
  const where = includeInactive ? '' : 'AND is_active = 1';
  const [rows] = await pool.execute(
    `SELECT id, product_id, name, price, promotional_price, profit,
            stock_quantity, duration, version, is_active,
            created_at, updated_at
       FROM product_variants
      WHERE product_id = ? ${where}
      ORDER BY price ASC, id ASC`,
    [productId]
  );
  return rows;
}

async function listByProductIds(productIds, includeInactive = false) {
  if (!productIds.length) return [];
  const ph = productIds.map(() => '?').join(',');
  const where = includeInactive ? '' : 'AND is_active = 1';
  const [rows] = await pool.execute(
    `SELECT id, product_id, name, price, promotional_price, profit,
            stock_quantity, duration, version, is_active
       FROM product_variants
      WHERE product_id IN (${ph}) ${where}
      ORDER BY price ASC, id ASC`,
    productIds
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT * FROM product_variants WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function countByProduct(productId, activeOnly = false) {
  const where = activeOnly ? 'AND is_active = 1' : '';
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM product_variants
      WHERE product_id = ? ${where}`,
    [productId]
  );
  return rows[0].total;
}

async function insert(conn, data) {
  const {
    product_id, name, price, promotional_price, profit,
    stock_quantity, duration, version,
  } = data;
  const [result] = await conn.execute(
    `INSERT INTO product_variants
      (product_id, name, price, promotional_price, profit,
       stock_quantity, duration, version, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      product_id, name, price,
      promotional_price ?? null, profit ?? 0,
      stock_quantity ?? null, duration ?? null, version ?? null,
    ]
  );
  return result.insertId;
}

/**
 * Update a variant.
 * @param {number} id
 * @param {object} fields
 * @param {object} [conn] — pass a transaction connection to enlist in a transaction.
 *                          Omit to use the global pool.
 */
async function update(id, fields, conn = null) {
  const keys = Object.keys(fields);
  if (!keys.length) return 0;
  const setClause = keys.map((k) => `\`${k}\` = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  const executor = conn || pool;
  const [result] = await executor.execute(
    `UPDATE product_variants SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return result.affectedRows;
}

/**
 * Delete a single variant.
 * Caller is responsible for deleting dependent rows first (e.g. specs overrides).
 */
async function remove(id, conn = null) {
  const executor = conn || pool;
  const [result] = await executor.execute(
    `DELETE FROM product_variants WHERE id = ?`,
    [id]
  );
  return result.affectedRows;
}

async function setStatus(id, is_active) {
  const [result] = await pool.execute(
    `UPDATE product_variants SET is_active = ? WHERE id = ?`,
    [is_active ? 1 : 0, id]
  );
  return result.affectedRows;
}

async function nullifyStockByProduct(conn, productId) {
  await conn.execute(
    `UPDATE product_variants SET stock_quantity = NULL WHERE product_id = ?`,
    [productId]
  );
}

module.exports = {
  listByProduct,
  listByProductIds,
  findById,
  countByProduct,
  insert,
  update,
  remove,          
  setStatus,
  nullifyStockByProduct,
};