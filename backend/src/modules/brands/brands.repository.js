
const { pool } = require('../../config/database');

async function listActive(categoryId = null) {
  if (!categoryId) {
    const [rows] = await pool.execute(
      `SELECT id, name FROM brands WHERE is_active = 1 ORDER BY name ASC`
    );
    return rows;
  }

  const [rows] = await pool.execute(
    `SELECT DISTINCT b.id, b.name
       FROM brands b
       JOIN brand_categories bc ON bc.brand_id = b.id
      WHERE b.is_active = 1
        AND bc.category_id = ?
      ORDER BY b.name ASC`,
    [categoryId]
  );
  return rows;
}

async function listAll() {
  const [rows] = await pool.execute(
    `SELECT id, name, is_active, created_at, updated_at
       FROM brands
      ORDER BY name ASC`
  );
  if (!rows.length) return [];

  const ids = rows.map((r) => r.id);
  const ph = ids.map(() => '?').join(',');
  const [tags] = await pool.execute(
    `SELECT brand_id, category_id
       FROM brand_categories
      WHERE brand_id IN (${ph})`,
    ids
  );

  const byBrand = tags.reduce((acc, t) => {
    (acc[t.brand_id] = acc[t.brand_id] || []).push(t.category_id);
    return acc;
  }, {});

  return rows.map((r) => ({ ...r, category_ids: byBrand[r.id] || [] }));
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT id, name, is_active, created_at, updated_at
       FROM brands
      WHERE id = ? LIMIT 1`,
    [id]
  );
  if (!rows[0]) return null;

  const [tags] = await pool.execute(
    `SELECT category_id FROM brand_categories WHERE brand_id = ?`,
    [id]
  );
  return { ...rows[0], category_ids: tags.map((t) => t.category_id) };
}

async function nameExists(name, excludeId = null) {
  const [rows] = await pool.execute(
    `SELECT id FROM brands WHERE name = ? AND id <> ? LIMIT 1`,
    [name, excludeId ?? 0]
  );
  return rows.length > 0;
}

async function categoryIdsExist(ids) {
  if (!ids.length) return true;
  const ph = ids.map(() => '?').join(',');
  const [rows] = await pool.execute(
    `SELECT id FROM categories WHERE id IN (${ph}) AND is_active = 1`,
    ids
  );
  return rows.length === ids.length;
}

async function create(conn, name, categoryIds) {
  const [result] = await conn.execute(
    `INSERT INTO brands (name, is_active) VALUES (?, 1)`,
    [name]
  );
  const brandId = result.insertId;

  if (categoryIds && categoryIds.length) {
    const placeholders = categoryIds.map(() => '(?, ?)').join(',');
    await conn.execute(
      `INSERT INTO brand_categories (brand_id, category_id)
       VALUES ${placeholders}`,
      categoryIds.flatMap((c) => [brandId, c])
    );
  }
  return brandId;
}

async function update(id, name) {
  const [result] = await pool.execute(
    `UPDATE brands SET name = ? WHERE id = ?`,
    [name, id]
  );
  return result.affectedRows;
}

async function replaceCategories(conn, brandId, categoryIds) {
  await conn.execute(
    `DELETE FROM brand_categories WHERE brand_id = ?`,
    [brandId]
  );
  if (categoryIds && categoryIds.length) {
    const placeholders = categoryIds.map(() => '(?, ?)').join(',');
    await conn.execute(
      `INSERT INTO brand_categories (brand_id, category_id)
       VALUES ${placeholders}`,
      categoryIds.flatMap((c) => [brandId, c])
    );
  }
}

async function setStatus(id, is_active) {
  const [result] = await pool.execute(
    `UPDATE brands SET is_active = ? WHERE id = ?`,
    [is_active ? 1 : 0, id]
  );
  return result.affectedRows;
}

module.exports = {
  listActive,
  listAll,
  findById,
  nameExists,
  categoryIdsExist,
  create,
  update,
  replaceCategories,
  setStatus,
};