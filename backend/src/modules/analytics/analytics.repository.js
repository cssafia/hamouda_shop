
const { pool } = require('../../config/database');
const {
  bucketExpression,
  toMysqlDateTime,
  REVENUE_STATUSES,
} = require('./analytics.helpers');

const revenueStatusPlaceholders = REVENUE_STATUSES.map(() => '?').join(',');

/* ─── Dashboard: priority counters ─────────────────────────── */

async function countPendingOrders() {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM orders WHERE status = 'pending'`
  );
  return Number(rows[0].total);
}

async function countConfirmedOrders() {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM orders WHERE status = 'confirmed'`
  );
  return Number(rows[0].total);
}

async function countStockIssues() {
  // Physical products whose total stock is 0, OR is at/below their own
  // low_stock_threshold when one is set. Matches the stock module's
  // "issues" filter so dashboard and stock page agree.
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
       FROM products p
      WHERE p.is_active = 1
        AND p.product_type = 'physical'
        AND (
          COALESCE(p.stock_quantity, 0) +
            COALESCE((
              SELECT SUM(v.stock_quantity)
                FROM product_variants v
               WHERE v.product_id = p.id AND v.is_active = 1
            ), 0) = 0
          OR
          (
            p.low_stock_threshold IS NOT NULL
            AND COALESCE(p.stock_quantity, 0) +
              COALESCE((
                SELECT SUM(v.stock_quantity)
                  FROM product_variants v
                 WHERE v.product_id = p.id AND v.is_active = 1
              ), 0) <= p.low_stock_threshold
          )
        )`
  );
  return Number(rows[0].total);
}

async function countNewRequests() {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
       FROM service_requests
      WHERE status = 'pending'`
  );
  return Number(rows[0].total);
}

/* ─── Dashboard: today + yesterday metrics ─────────────────── */

async function metricsBetween({ from, to }) {
  const [rows] = await pool.execute(
    `SELECT
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(*)                       AS orders_count,
        COALESCE(SUM(profit), 0)       AS profit
       FROM orders
      WHERE created_at BETWEEN ? AND ?
        AND status IN (${revenueStatusPlaceholders})`,
    [toMysqlDateTime(from), toMysqlDateTime(to), ...REVENUE_STATUSES]
  );

  const row = rows[0] || { revenue: 0, orders_count: 0, profit: 0 };
  const revenue = Number(row.revenue);
  const orders_count = Number(row.orders_count);
  const profit = Number(row.profit);

  return {
    revenue,
    orders_count,
    profit,
    average_order_value: orders_count > 0 ? Math.round(revenue / orders_count) : 0,
  };
}

/* ─── Dashboard + Reports: revenue series ──────────────────── */

async function revenueSeries({ from, to, group }) {
  const bucket = bucketExpression(group, 'created_at');

  const [rows] = await pool.execute(
    `SELECT
        ${bucket}                      AS bucket,
        COALESCE(SUM(total_amount), 0) AS revenue,
        COALESCE(SUM(profit), 0)       AS profit,
        COUNT(*)                       AS orders_count
       FROM orders
      WHERE created_at BETWEEN ? AND ?
        AND status IN (${revenueStatusPlaceholders})
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [toMysqlDateTime(from), toMysqlDateTime(to), ...REVENUE_STATUSES]
  );

  return rows.map((r) => ({
    date: r.bucket,
    revenue: Number(r.revenue),
    profit: Number(r.profit),
    orders_count: Number(r.orders_count),
  }));
}

/* ─── Reports: order status breakdown ──────────────────────── */

async function ordersByStatusSeries({ from, to, group }) {
  const bucket = bucketExpression(group, 'created_at');

  const [rows] = await pool.execute(
    `SELECT
        ${bucket} AS bucket,
        SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'shipped'   THEN 1 ELSE 0 END) AS shipped,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN status = 'returned'  THEN 1 ELSE 0 END) AS returned
       FROM orders
      WHERE created_at BETWEEN ? AND ?
      GROUP BY bucket
      ORDER BY bucket ASC`,
    [toMysqlDateTime(from), toMysqlDateTime(to)]
  );

  return rows.map((r) => ({
    date: r.bucket,
    pending:   Number(r.pending),
    confirmed: Number(r.confirmed),
    shipped:   Number(r.shipped),
    completed: Number(r.completed),
    cancelled: Number(r.cancelled),
    returned:  Number(r.returned),
  }));
}

async function cancellationStats({ from, to }) {
  const [rows] = await pool.execute(
    `SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders
       FROM orders
      WHERE created_at BETWEEN ? AND ?`,
    [toMysqlDateTime(from), toMysqlDateTime(to)]
  );

  const row = rows[0];
  const total = Number(row.total_orders) || 0;
  const cancelled = Number(row.cancelled_orders) || 0;

  return {
    total,
    cancelled,
    cancel_rate: total > 0
      ? Math.round((cancelled / total) * 1000) / 10
      : 0,
  };
}

/* ─── Reports: top N lists ─────────────────────────────────── */

async function topProducts({ from, to, limit }) {
  const [rows] = await pool.execute(
    `SELECT
        p.id                                          AS product_id,
        p.name                                        AS name,
        COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS revenue,
        COALESCE(SUM(oi.profit * oi.quantity), 0)     AS profit,
        COUNT(DISTINCT o.id)                          AS orders_count
       FROM order_items oi
       JOIN orders o   ON o.id = oi.order_id
       JOIN products p ON p.id = oi.product_id
      WHERE o.created_at BETWEEN ? AND ?
        AND o.status IN (${revenueStatusPlaceholders})
      GROUP BY p.id, p.name
      ORDER BY revenue DESC
      LIMIT ?`,
    [
      toMysqlDateTime(from),
      toMysqlDateTime(to),
      ...REVENUE_STATUSES,
      Number(limit),
    ]
  );

  return rows.map((r) => ({
    product_id: r.product_id,
    name: r.name,
    revenue: Number(r.revenue),
    profit: Number(r.profit),
    orders_count: Number(r.orders_count),
  }));
}

async function topCategories({ from, to, limit }) {
  const [rows] = await pool.execute(
    `SELECT
        c.id                                          AS category_id,
        c.name                                        AS name,
        COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS revenue,
        COUNT(DISTINCT o.id)                          AS orders_count
       FROM order_items oi
       JOIN orders o     ON o.id = oi.order_id
       JOIN products p   ON p.id = oi.product_id
       JOIN categories c ON c.id = p.category_id
      WHERE o.created_at BETWEEN ? AND ?
        AND o.status IN (${revenueStatusPlaceholders})
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
      LIMIT ?`,
    [
      toMysqlDateTime(from),
      toMysqlDateTime(to),
      ...REVENUE_STATUSES,
      Number(limit),
    ]
  );

  const total = rows.reduce((s, r) => s + Number(r.revenue), 0);

  return rows.map((r) => ({
    category_id: r.category_id,
    name: r.name,
    revenue: Number(r.revenue),
    orders_count: Number(r.orders_count),
    pct: total > 0
      ? Math.round((Number(r.revenue) / total) * 1000) / 10
      : 0,
  }));
}

async function topWilayas({ from, to, limit }) {
  const [rows] = await pool.execute(
    `SELECT
        s.wilaya                        AS wilaya,
        COUNT(DISTINCT o.id)            AS orders_count,
        COALESCE(SUM(o.total_amount), 0) AS revenue
       FROM orders o
       JOIN shippings s ON s.order_id = o.id
      WHERE o.created_at BETWEEN ? AND ?
        AND o.status IN (${revenueStatusPlaceholders})
      GROUP BY s.wilaya
      ORDER BY revenue DESC
      LIMIT ?`,
    [
      toMysqlDateTime(from),
      toMysqlDateTime(to),
      ...REVENUE_STATUSES,
      Number(limit),
    ]
  );

  const total = rows.reduce((s, r) => s + Number(r.revenue), 0);

  return rows.map((r) => ({
    wilaya: r.wilaya,
    orders_count: Number(r.orders_count),
    revenue: Number(r.revenue),
    pct: total > 0
      ? Math.round((Number(r.revenue) / total) * 1000) / 10
      : 0,
  }));
}

module.exports = {
  countPendingOrders,
  countConfirmedOrders,
  countStockIssues,
  countNewRequests,
  metricsBetween,
  revenueSeries,
  ordersByStatusSeries,
  cancellationStats,
  topProducts,
  topCategories,
  topWilayas,
};