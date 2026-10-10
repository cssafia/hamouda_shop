
const { pool } = require('../../config/database');

async function insert(conn, { type, title, message, related_type, related_id }) {
  const exec = conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
  const [result] = await exec(
    `INSERT INTO notifications (type, title, message, related_type, related_id)
     VALUES (?, ?, ?, ?, ?)`,
    [type, title, message, related_type ?? null, related_id ?? null]
  );
  return result.insertId;
}

async function list({ page = 1, limit = 20, onlyUnread = false }) {
  const offset = (page - 1) * limit;
  const where = onlyUnread ? 'WHERE is_read = 0' : '';
  const [rows] = await pool.execute(
    `SELECT id, type, title, message, related_type, related_id, is_read, created_at
       FROM notifications
       ${where}
       ORDER BY created_at DESC
       LIMIT ? OFFSET ?`,
    [limit, offset]
  );
  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM notifications ${where}`
  );
  return { rows, total: countRows[0].total };
}

async function countUnread() {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM notifications WHERE is_read = 0`
  );
  return Number(rows[0].total);
}

async function markRead(id) {
  const [r] = await pool.execute(
    `UPDATE notifications SET is_read = 1 WHERE id = ?`,
    [id]
  );
  return r.affectedRows;
}

async function markAllRead() {
  const [r] = await pool.execute(
    `UPDATE notifications SET is_read = 1 WHERE is_read = 0`
  );
  return r.affectedRows;
}

module.exports = { insert, list, countUnread, markRead, markAllRead };