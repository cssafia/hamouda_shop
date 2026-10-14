
const { pool } = require('../../config/database');

async function insert(conn, data) {
  const [result] = await conn.execute(
    `INSERT INTO orders
      (customer_name, customer_phone, order_type, status,
       subtotal, discount_amount, shipping_cost, total_amount, profit,
       coupon_id, note)
     VALUES (?, ?, ?, 'pending', ?, ?, ?, ?, ?, ?, ?)`,
    [
      data.customer_name, data.customer_phone, data.order_type,
      data.subtotal, data.discount_amount, data.shipping_cost,
      data.total_amount, data.profit,
      data.coupon_id ?? null, data.note ?? null,
    ]
  );
  return result.insertId;
}

async function insertItems(conn, orderId, items) {
  const ph = items.map(() => '(?, ?, ?, ?, ?, ?, ?, ?)').join(',');
  await conn.execute(
    `INSERT INTO order_items
      (order_id, product_id, variant_id, product_name, variant_name,
       unit_price, quantity, profit)
     VALUES ${ph}`,
    items.flatMap((it) => [
      orderId, it.product_id, it.variant_id ?? null,
      it.product_name, it.variant_name ?? null,
      it.unit_price, it.quantity, it.profit,
    ])
  );
}

async function insertShipping(conn, orderId, s) {
  await conn.execute(
    `INSERT INTO shippings
      (order_id, delivery_type, wilaya, commune, address, stop_desk_name)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [
      orderId, s.delivery_type, s.wilaya, s.commune,
      s.address ?? null, s.stop_desk_name ?? null,
    ]
  );
}

async function findById(id) {
  const [rows] = await pool.execute(`SELECT * FROM orders WHERE id = ? LIMIT 1`, [id]);
  return rows[0] || null;
}

async function findByIdForUpdate(conn, id) {
  const [rows] = await conn.execute(
    `SELECT * FROM orders WHERE id = ? LIMIT 1 FOR UPDATE`,
    [id]
  );
  return rows[0] || null;
}

async function listItemsByOrder(orderId) {
  const [rows] = await pool.execute(
    `SELECT id, product_id, variant_id, product_name, variant_name,
            unit_price, quantity, profit
       FROM order_items WHERE order_id = ?`,
    [orderId]
  );
  return rows;
}

async function getShipping(orderId) {
  const [rows] = await pool.execute(
    `SELECT * FROM shippings WHERE order_id = ? LIMIT 1`,
    [orderId]
  );
  return rows[0] || null;
}

async function list({ page, limit, status, search, date_from, date_to, sort }) {
  const where = [];
  const params = [];

  if (status) { where.push(`o.status = ?`); params.push(status); }
  if (search) {
    where.push(`(o.customer_name LIKE ? OR o.customer_phone LIKE ? OR CAST(o.id AS CHAR) LIKE ?)`);
    const like = `%${search}%`;
    params.push(like, like, like);
  }
  if (date_from) { where.push(`o.created_at >= ?`); params.push(date_from); }
  if (date_to)   { where.push(`o.created_at <= ?`); params.push(date_to); }

  const whereSql = where.length ? `WHERE ${where.join(' AND ')}` : '';

  // Urgency priority: pending first, then confirmed, shipped, returned, completed, cancelled.
  const statusPriority = `
    FIELD(o.status,
      'pending', 'confirmed', 'shipped', 'returned', 'completed', 'cancelled'
    )
  `;

  const sortMap = {
    newest:      `o.created_at DESC`,
    oldest:      `o.created_at ASC`,
    amount_desc: `o.total_amount DESC`,
    amount_asc:  `o.total_amount ASC`,
  };
  // Default: status priority, then newest within same status.
  const orderBy = sortMap[sort]
    ? `${statusPriority} ASC, ${sortMap[sort]}`
    : `${statusPriority} ASC, o.created_at DESC`;

  const offset = (page - 1) * limit;

  const [rows] = await pool.execute(
    `SELECT o.id, o.customer_name, o.customer_phone, o.status,
            o.total_amount, o.created_at,
            (SELECT COUNT(*) FROM order_items WHERE order_id = o.id) AS items_count
       FROM orders o
       ${whereSql}
       ORDER BY ${orderBy}
       LIMIT ? OFFSET ?`,
    [...params, limit, offset]
  );

  const [countRows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM orders o ${whereSql}`,
    params
  );

  return { rows, total: countRows[0].total };
}

async function listFirstItemsByOrderIds(orderIds, perOrder = 2) {
  if (orderIds.length === 0) return [];
  const ph = orderIds.map(() => '?').join(',');
  const [rows] = await pool.execute(
    `SELECT order_id, product_name, variant_name
       FROM order_items
      WHERE order_id IN (${ph})
      ORDER BY id ASC`,
    orderIds
  );
  // Group in memory, keep first N per order.
  const byOrder = {};
  for (const r of rows) {
    if (!byOrder[r.order_id]) byOrder[r.order_id] = [];
    if (byOrder[r.order_id].length < perOrder) byOrder[r.order_id].push(r);
  }
  return byOrder;
}

async function updateStatus(conn, id, status, extra = {}) {
  const fields = { status, ...extra };
  const keys = Object.keys(fields);
  const set = keys.map((k) => `\`${k}\` = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  const exec = conn ? conn.execute.bind(conn) : pool.execute.bind(pool);
  await exec(`UPDATE orders SET ${set} WHERE id = ?`, [...values, id]);
}

async function updateShipping(orderId, fields) {
  const keys = Object.keys(fields);
  if (!keys.length) return 0;
  const set = keys.map((k) => `\`${k}\` = ?`).join(', ');
  const values = keys.map((k) => fields[k]);
  const [r] = await pool.execute(
    `UPDATE shippings SET ${set} WHERE order_id = ?`,
    [...values, orderId]
  );
  return r.affectedRows;
}

module.exports = {
  insert, insertItems, insertShipping,
  findById, findByIdForUpdate,
  listItemsByOrder, getShipping, list,
  updateStatus, updateShipping, listFirstItemsByOrderIds
};