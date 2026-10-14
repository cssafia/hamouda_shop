
const { pool } = require('../../config/database');

async function insert(data) {
  const [result] = await pool.execute(
    `INSERT INTO service_requests
      (customer_name, customer_phone, service_name, description, status)
     VALUES (?, ?, ?, ?, 'pending')`,
    [data.customer_name, data.customer_phone, data.service_name, data.description]
  );
  return result.insertId;
}

async function findById(id) {
  const [rows] = await pool.execute(
    `SELECT * FROM service_requests WHERE id = ? LIMIT 1`,
    [id]
  );
  return rows[0] || null;
}

async function list({ page, limit, status, search, date_from, date_to, sort }) {
  const where = [];
  const params = [];

  if (status) { where.push(`status = ?`); params.push(status); }
  if (search) {
    where.push(`(customer_name LIKE ? OR customer_phone LIKE ? OR service_name LIKE ?)`);
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (date_from) { where.push(`created_at >= ?`); params.push(date_from); }
  if (date_to)   { where.push(`created_at <= ?`); params.push(date_to); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';
  const orderBy = sort === 'oldest' ? 'created_at ASC' : 'created_at DESC';
  const offset = (page - 1) * limit;

  const [rows] = await pool.execute(
    `SELECT id, customer_name, customer_phone, service_name, status, created_at
       FROM service_requests
       ${whereSql}
      ORDER BY ${orderBy}
      LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM service_requests ${whereSql}`,
    params
  );

  return { rows, total: Number(countRows[0].total) };
}

async function updateStatus(id, status, profit) {
  const [result] = await pool.execute(
    `UPDATE service_requests SET status = ?, profit = ? WHERE id = ?`,
    [status, profit ?? null, id]
  );
  return result.affectedRows;
}

module.exports = { insert, findById, list, updateStatus };