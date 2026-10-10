
const { pool } = require('../../config/database');

// ─── Reads ─────────────────────────────────────────────

async function findById(id) {
  const [rows] = await pool.execute(`SELECT * FROM products WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}



async function listAdmin({ page, limit, search, category_id, brand_id, product_type, is_active, sort }) {
  const where = [];
  const params = [];

  if (search) {
    where.push(`(p.name LIKE ? OR p.description LIKE ?)`);
    const like = `%${search}%`;
    params.push(like, like);
  }
  if (category_id) { where.push(`p.category_id = ?`); params.push(category_id); }
  if (brand_id)    { where.push(`p.brand_id = ?`);    params.push(brand_id); }
  if (product_type) { where.push(`p.product_type = ?`); params.push(product_type); }
  if (is_active === true)  where.push(`p.is_active = 1`);
  if (is_active === false) where.push(`p.is_active = 0`);

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  const sortMap = {
    newest:     'p.created_at DESC',
    name:       'p.name ASC',
    price_asc:  'p.price ASC',
    price_desc: 'p.price DESC',
    stock_asc:  'p.stock_quantity ASC',
    stock_desc: 'p.stock_quantity DESC',
  };
  const orderBy = sortMap[sort] || 'p.created_at DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.execute(
    `SELECT p.*, c.name AS category_name, b.name AS brand_name
       FROM products p
       JOIN categories c ON c.id = p.category_id
       LEFT JOIN brands b ON b.id = p.brand_id
       ${whereSql}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM products p ${whereSql}`,
    params
  );

  return { rows, total: countRows[0].total };
}

async function listPublic({
  page, limit, category_id, brand_id, usage, price_min, price_max,
  availability, product_type, search, sort,
}) {
  const where = ['p.is_active = 1'];
  const params = [];

  if (category_id) { where.push(`p.category_id = ?`); params.push(category_id); }
  if (brand_id)    { where.push(`p.brand_id = ?`);    params.push(brand_id); }
  if (product_type && product_type !== 'all') {
    where.push(`p.product_type = ?`);
    params.push(product_type);
  }
  if (search) {
    where.push(`(p.name LIKE ? OR p.description LIKE ?)`);
    const like = `%${search}%`;
    params.push(like, like);
  }

  const usageJoin = usage
    ? `JOIN product_usages pu ON pu.product_id = p.id AND pu.usage_key = ?`
    : '';
  const usageParam = usage ? [usage] : [];

  const variantStatsJoin = `
    LEFT JOIN (
      SELECT product_id,
             MIN(CASE WHEN stock_quantity > 0 THEN price END) AS min_avail_price,
             MIN(price) AS min_price,
             MAX(price) AS max_price,
             SUM(stock_quantity) AS total_stock,
             COUNT(*) AS variant_count
        FROM product_variants
       WHERE is_active = 1
       GROUP BY product_id
    ) v ON v.product_id = p.id
  `;

  const priceExpr = `
    CASE
      WHEN v.variant_count > 0 THEN COALESCE(v.min_avail_price, v.min_price)
      ELSE p.price
    END
  `;

  const availabilityExpr = `
    CASE
      WHEN p.product_type = 'digital' THEN 1
      WHEN p.stock_mode = 'shared' THEN (p.stock_quantity > 0)
      WHEN v.variant_count > 0 THEN (v.min_avail_price IS NOT NULL)
      WHEN p.stock_quantity > 0 THEN 1
      ELSE 0
    END
  `;

  // Outer filters applied after the subquery — this is where MariaDB can see the aliases.
  const outerWhere = [];
  const outerParams = [];
  if (price_min !== undefined) { outerWhere.push(`effective_price >= ?`); outerParams.push(price_min); }
  if (price_max !== undefined) { outerWhere.push(`effective_price <= ?`); outerParams.push(price_max); }
  if (availability === 'available')    outerWhere.push(`is_available = 1`);
  if (availability === 'out_of_stock') outerWhere.push(`is_available = 0`);
  const outerWhereSql = outerWhere.length ? `WHERE ${outerWhere.join(' AND ')}` : '';

  const sortMap = {
    newest:     'created_at DESC',
    price_asc:  'effective_price ASC',
    price_desc: 'effective_price DESC',
    name_asc:   'name ASC',
    name_desc:  'name DESC',
  };
  const orderBy = sortMap[sort] || 'created_at DESC';
  const offset = (page - 1) * limit;

  const innerSql = `
    SELECT
      p.id, p.name, p.product_type,
      p.condition, p.color, p.included_accessories,
      p.duration, p.version, p.promotional_price,
      p.created_at,
      c.id AS category_id, c.name AS category_name,
      b.id AS brand_id, b.name AS brand_name,
      ${priceExpr} AS effective_price,
      (v.variant_count > 0) AS has_variants,
      ${availabilityExpr} AS is_available
    FROM products p
    JOIN categories c ON c.id = p.category_id
    LEFT JOIN brands b ON b.id = p.brand_id
    ${usageJoin}
    ${variantStatsJoin}
    WHERE ${where.join(' AND ')}
  `;

  const sql = `
    SELECT * FROM (${innerSql}) t
    ${outerWhereSql}
    ORDER BY ${orderBy}
    LIMIT ? OFFSET ?
  `;

  const [rows] = await pool.execute(sql, [
    ...usageParam,
    ...params,
    ...outerParams,
    limit,
    offset,
  ]);

  const countSql = `
    SELECT COUNT(*) AS total FROM (${innerSql}) t
    ${outerWhereSql}
  `;
  const [countRows] = await pool.execute(countSql, [
    ...usageParam,
    ...params,
    ...outerParams,
  ]);

  return { rows, total: countRows[0].total };
}

// ─── Writes ────────────────────────────────────────────

async function insert(conn, data) {
  const {
    category_id, brand_id, name, product_type, description,
    price, promotional_price, profit, stock_quantity,
    condition, color, included_accessories, duration, version,
  } = data;

  const [result] = await conn.execute(
    `INSERT INTO products
      (category_id, brand_id, name, product_type, description,
       price, promotional_price, profit, stock_quantity,
       \`condition\`, color, included_accessories,
       duration, version, is_active)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
    [
      category_id, brand_id, name, product_type, description ?? null,
      price ?? 0, promotional_price ?? null, profit ?? 0, stock_quantity ?? null,
      condition ?? null, color ?? null, included_accessories ?? null,
      duration ?? null, version ?? null,
    ]
  );
  return result.insertId;
}

async function update(id, fields) {
  const keys = Object.keys(fields);
  if (keys.length === 0) return 0;
  const setClause = keys.map((k) => `\`${k}\` = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  const [result] = await pool.execute(
    `UPDATE products SET ${setClause} WHERE id = ?`,
    [...values, id]
  );
  return result.affectedRows;
}

async function setStatus(id, is_active) {
  const [result] = await pool.execute(
    `UPDATE products SET is_active = ? WHERE id = ?`,
    [is_active ? 1 : 0, id]
  );
  return result.affectedRows;
}

async function insertUsages(conn, productId, usageKeys) {
  if (!usageKeys || usageKeys.length === 0) return;
  const placeholders = usageKeys.map(() => '(?, ?)').join(',');
  await conn.execute(
    `INSERT INTO product_usages (product_id, usage_key) VALUES ${placeholders}`,
    usageKeys.flatMap((k) => [productId, k])
  );
}

async function deleteUsages(conn, productId) {
  await conn.execute(`DELETE FROM product_usages WHERE product_id = ?`, [productId]);
}

async function listUsagesByProduct(productId) {
  const [rows] = await pool.execute(
    `SELECT usage_key FROM product_usages WHERE product_id = ?`,
    [productId]
  );
  return rows.map((r) => r.usage_key);
}

async function listUsagesByProductIds(productIds) {
  if (productIds.length === 0) return [];
  const ph = productIds.map(() => '?').join(',');
  const [rows] = await pool.execute(
    `SELECT product_id, usage_key FROM product_usages WHERE product_id IN (${ph})`,
    productIds
  );
  return rows;
}

async function insertImages(conn, productId, images) {
  if (!images || images.length === 0) return;
  const placeholders = images.map(() => '(?, ?, ?, ?)').join(',');
  await conn.execute(
    `INSERT INTO product_images (product_id, url, is_primary, display_order)
     VALUES ${placeholders}`,
    images.flatMap((img, i) => [
      productId,
      img.url,
      img.is_primary ? 1 : 0,
      img.display_order ?? i,
    ])
  );
}

async function deleteImages(conn, productId) {
  await conn.execute(`DELETE FROM product_images WHERE product_id = ?`, [productId]);
}

async function listImagesByProduct(productId) {
  const [rows] = await pool.execute(
    `SELECT id, url, is_primary, display_order
       FROM product_images
      WHERE product_id = ?
      ORDER BY is_primary DESC, display_order ASC, id ASC`,
    [productId]
  );
  return rows;
}

async function listPrimaryImagesByProductIds(productIds) {
  if (productIds.length === 0) return [];
  const ph = productIds.map(() => '?').join(',');
  const [rows] = await pool.execute(
    `SELECT product_id, url FROM product_images
      WHERE product_id IN (${ph}) AND is_primary = 1`,
    productIds
  );
  return rows;
}

module.exports = {
  findById,
  listAdmin,
  listPublic,
  insert,
  update,
  setStatus,
  insertUsages,
  deleteUsages,
  listUsagesByProduct,
  listUsagesByProductIds,
  insertImages,
  deleteImages,
  listImagesByProduct,
  listPrimaryImagesByProductIds,
};