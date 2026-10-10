const { pool } = require('../../config/database');

async function findByEmail(email) {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, password_hash, role, is_active
       FROM administrators WHERE email = ? LIMIT 1`,
    [email]
  );
  return rows[0] || null;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT id, full_name, email, password_hash, role, is_active
       FROM administrators WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function updatePassword(id, passwordHash) {
  const [result] = await pool.execute(
    `UPDATE administrators SET password_hash = ? WHERE id = ?`,
    [passwordHash, id]
  );
  return result.affectedRows;
}

module.exports = { findByEmail, findById, updatePassword };