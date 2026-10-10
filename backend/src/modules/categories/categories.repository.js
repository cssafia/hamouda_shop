
const { pool } = require('../../config/database');

async function listActive() {
  const [rows] = await pool.execute(
    `SELECT id, name
       FROM categories
      WHERE is_active = 1
      ORDER BY name ASC`
  );
  return rows;
}

async function listAll() {
  const [rows] = await pool.execute(
    `SELECT id, name, is_active, created_at, updated_at
       FROM categories
      ORDER BY name ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT id, name, is_active, created_at, updated_at
       FROM categories
      WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function nameExists(name, excludeId = null) {
  const [rows] = await pool.execute(
    `SELECT id FROM categories WHERE name = ? AND id <> ? LIMIT 1`,
    [name, excludeId ?? 0]
  );
  return rows.length > 0;
}

async function create(name) {
  const [result] = await pool.execute(
    `INSERT INTO categories (name, is_active) VALUES (?, 1)`,
    [name]
  );
  return result.insertId;
}

async function update(id, name) {
  const [result] = await pool.execute(
    `UPDATE categories SET name = ? WHERE id = ?`,
    [name, id]
  );
  return result.affectedRows;
}

async function setStatus(id, is_active) {
  const [result] = await pool.execute(
    `UPDATE categories SET is_active = ? WHERE id = ?`,
    [is_active ? 1 : 0, id]
  );
  return result.affectedRows;
}

module.exports = {
  listActive,
  listAll,
  findById,
  nameExists,
  create,
  update,
  setStatus,
};