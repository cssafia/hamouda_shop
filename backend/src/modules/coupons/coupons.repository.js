
const { pool } = require('../../config/database');

async function findByCode(code) {
  const [rows] = await pool.execute(
    `SELECT * FROM coupons WHERE code = ? LIMIT 1`,
    [code]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT * FROM coupons WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function list({ page, limit, search, is_active }) {
  const where = [];
  const params = [];
  if (search) { where.push(`code LIKE ?`); params.push(`%${search}%`); }
  if (is_active === true) where.push(`is_active = 1`);
  if (is_active === false) where.push(`is_active = 0`);
  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const offset = (page - 1) * limit;

  const [rows] = await pool.execute(
    `SELECT * FROM coupons ${whereSql} ORDER BY created_at DESC LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM coupons ${whereSql}`,
    params
  );
  return { rows, total: countRows[0].total };
}

async function getProductIds(couponId) {
  const [rows] = await pool.execute(
    `SELECT product_id FROM coupon_products WHERE coupon_id = ?`,
    [couponId]
  );
  return rows.map((r) => r.product_id);
}

async function getCategoryIds(couponId) {
  const [rows] = await pool.execute(
    `SELECT category_id FROM coupon_categories WHERE coupon_id = ?`,
    [couponId]
  );
  return rows.map((r) => r.category_id);
}

async function insert(conn, data) {
  const [result] = await conn.execute(
    `INSERT INTO coupons
       (code, scope, discount_type, discount_value, minimum_amount,
        usage_limit, starts_at, expires_at, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      data.code, data.scope, data.discount_type, data.discount_value,
      data.minimum_amount ?? null, data.usage_limit ?? null,
      data.starts_at ?? null, data.expires_at ?? null,
    ]
  );
  return result.insertId;
}

async function insertProducts(conn, couponId, productIds) {
  if (!productIds?.length) return;
  const ph = productIds.map(() => '(?, ?)').join(',');
  await conn.execute(
    `INSERT INTO coupon_products (coupon_id, product_id) VALUES ${ph}`,
    productIds.flatMap((p) => [couponId, p])
  );
}

async function insertCategories(conn, couponId, categoryIds) {
  if (!categoryIds?.length) return;
  const ph = categoryIds.map(() => '(?, ?)').join(',');
  await conn.execute(
    `INSERT INTO coupon_categories (coupon_id, category_id) VALUES ${ph}`,
    categoryIds.flatMap((c) => [couponId, c])
  );
}

async function deleteProducts(conn, couponId) {
  await conn.execute(`DELETE FROM coupon_products WHERE coupon_id = ?`, [couponId]);
}

async function deleteCategories(conn, couponId) {
  await conn.execute(`DELETE FROM coupon_categories WHERE coupon_id = ?`, [couponId]);
}

async function update(id, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return 0;
  const set = keys.map((k) => `\`${k}\` = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  const [r] = await pool.execute(
    `UPDATE coupons SET ${set} WHERE id = ?`,
    [...values, id]
  );
  return r.affectedRows;
}

async function setStatus(id, is_active) {
  const [r] = await pool.execute(
    `UPDATE coupons SET is_active = ? WHERE id = ?`,
    [is_active ? 1 : 0, id]
  );
  return r.affectedRows;
}

async function incrementUsed(conn, id) {
  await conn.execute(
    `UPDATE coupons SET used_count = used_count + 1 WHERE id = ?`,
    [id]
  );
}

module.exports = {
  findByCode, findById, list,
  getProductIds, getCategoryIds,
  insert, insertProducts, insertCategories,
  deleteProducts, deleteCategories,
  update, setStatus, incrementUsed,
};