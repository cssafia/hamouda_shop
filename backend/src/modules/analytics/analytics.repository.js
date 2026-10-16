'use strict';

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
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total
       FROM products p
      WHERE p.is_active = 1
        AND p.product_type = 'physical'
        AND (
          COALESCE(p.stock_quantity, 0) +
            COALESCE((SELECT SUM(v.stock_quantity) FROM product_variants v
                       WHERE v.product_id = p.id AND v.is_active = 1), 0) = 0
          OR
          ( p.low_stock_threshold IS NOT NULL
            AND COALESCE(p.stock_quantity, 0) +
              COALESCE((SELECT SUM(v.stock_quantity) FROM product_variants v
                         WHERE v.product_id = p.id AND v.is_active = 1), 0)
              <= p.low_stock_threshold )
        )`
  );
  return Number(rows[0].total);
}

async function countNewRequests() {
  const [rows] = await pool.execute(
    `SELECT COUNT(*) AS total FROM service_requests WHERE status = 'pending'`
  );
  return Number(rows[0].total);
}

/* ─── Dashboard + Reports: merged metrics over a range ─────── */

async function metricsBetween({ from, to }) {
  const [orderRows] = await pool.execute(
    `SELECT
        COALESCE(SUM(total_amount), 0) AS revenue,
        COUNT(*)                       AS orders_count,
        COALESCE(SUM(profit), 0)       AS profit
       FROM orders
      WHERE created_at BETWEEN ? AND ?
        AND status IN (${revenueStatusPlaceholders})`,
    [toMysqlDateTime(from), toMysqlDateTime(to), ...REVENUE_STATUSES]
  );

  const [serviceRows] = await pool.execute(
    `SELECT
        COALESCE(SUM(profit), 0) AS profit,
        COUNT(*)                 AS services_completed
       FROM service_requests
      WHERE completed_at BETWEEN ? AND ?
        AND status = 'completed'`,
    [toMysqlDateTime(from), toMysqlDateTime(to)]
  );

  const o = orderRows[0] || { revenue: 0, orders_count: 0, profit: 0 };
  const s = serviceRows[0] || { profit: 0, services_completed: 0 };

  const orderRevenue = Number(o.revenue);
  const orderProfit  = Number(o.profit);
  const serviceProfit = Number(s.profit);
  const ordersCount = Number(o.orders_count);
  const servicesCompleted = Number(s.services_completed);

  return {
    revenue: orderRevenue + serviceProfit,
    profit:  orderProfit  + serviceProfit,
    orders_count: ordersCount,
    services_completed: servicesCompleted,
    average_order_value: ordersCount > 0
      ? Math.round(orderRevenue / ordersCount)
      : 0,
  };
}

/* ─── Reports: revenue series (merged, sparse) ─────────────── */

async function revenueSeries({ from, to, group }) {
  const orderBucket = bucketExpression(group, 'created_at');
  const serviceBucket = bucketExpression(group, 'completed_at');

  const [orderRows, serviceRows] = await Promise.all([
    pool.execute(
      `SELECT
          ${orderBucket}                 AS bucket,
          COALESCE(SUM(total_amount), 0) AS revenue,
          COALESCE(SUM(profit), 0)       AS profit,
          COUNT(*)                       AS orders_count
         FROM orders
        WHERE created_at BETWEEN ? AND ?
          AND status IN (${revenueStatusPlaceholders})
        GROUP BY bucket
        ORDER BY bucket ASC`,
      [toMysqlDateTime(from), toMysqlDateTime(to), ...REVENUE_STATUSES]
    ).then(([r]) => r),
    pool.execute(
      `SELECT
          ${serviceBucket}         AS bucket,
          COALESCE(SUM(profit), 0) AS profit
         FROM service_requests
        WHERE completed_at BETWEEN ? AND ?
          AND status = 'completed'
        GROUP BY bucket
        ORDER BY bucket ASC`,
      [toMysqlDateTime(from), toMysqlDateTime(to)]
    ).then(([r]) => r),
  ]);

  const byBucket = new Map();

  for (const r of orderRows) {
    byBucket.set(r.bucket, {
      date: r.bucket,
      revenue: Number(r.revenue),
      profit: Number(r.profit),
      orders_count: Number(r.orders_count),
    });
  }

  for (const r of serviceRows) {
    const existing = byBucket.get(r.bucket) || {
      date: r.bucket, revenue: 0, profit: 0, orders_count: 0,
    };
    const sp = Number(r.profit);
    existing.revenue += sp;  // services add to revenue too
    existing.profit  += sp;
    byBucket.set(r.bucket, existing);
  }

  return [...byBucket.values()];
}

/* ─── Reports: order status   ────────────────── */

async function ordersBreakdown({ from, to }) {
  const [rows] = await pool.execute(
    `SELECT
        SUM(CASE WHEN status = 'pending'   THEN 1 ELSE 0 END) AS pending,
        SUM(CASE WHEN status = 'confirmed' THEN 1 ELSE 0 END) AS confirmed,
        SUM(CASE WHEN status = 'shipped'   THEN 1 ELSE 0 END) AS shipped,
        SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled,
        SUM(CASE WHEN status = 'returned'  THEN 1 ELSE 0 END) AS returned
       FROM orders
      WHERE created_at BETWEEN ? AND ?`,
    [toMysqlDateTime(from), toMysqlDateTime(to)]
  );

  const r = rows[0];
  return {
    pending:   Number(r.pending),
    confirmed: Number(r.confirmed),
    shipped:   Number(r.shipped),
    completed: Number(r.completed),
    cancelled: Number(r.cancelled),
    returned:  Number(r.returned),
  };
}

/* ─── Reports: cancellation stats + top reason ─────────────── */

async function cancellationStats({ from, to }) {
  const [rows] = await pool.execute(
    `SELECT
        COUNT(*) AS total_orders,
        SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_orders
       FROM orders
      WHERE created_at BETWEEN ? AND ?`,
    [toMysqlDateTime(from), toMysqlDateTime(to)]
  );

  const [reasonRows] = await pool.execute(
    `SELECT rejection_reason, COUNT(*) AS cnt
       FROM orders
      WHERE created_at BETWEEN ? AND ?
        AND status = 'cancelled'
        AND rejection_reason IS NOT NULL
      GROUP BY rejection_reason
      ORDER BY cnt DESC
      LIMIT 1`,
    [toMysqlDateTime(from), toMysqlDateTime(to)]
  );

  const total = Number(rows[0].total_orders) || 0;
  const cancelled = Number(rows[0].cancelled_orders) || 0;

  return {
    total,
    cancelled,
    cancel_rate: total > 0
      ? Math.round((cancelled / total) * 1000) / 10
      : 0,
    top_cancel_reason: reasonRows[0]?.rejection_reason || null,
  };
}

/* ─── Reports: top lists ───────────────────────────────────── */

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
      LIMIT ${Number(limit)}`,
    [
      toMysqlDateTime(from),
      toMysqlDateTime(to),
      ...REVENUE_STATUSES,
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
        COALESCE(SUM(oi.unit_price * oi.quantity), 0) AS revenue
       FROM order_items oi
       JOIN orders o     ON o.id = oi.order_id
       JOIN products p   ON p.id = oi.product_id
       JOIN categories c ON c.id = p.category_id
      WHERE o.created_at BETWEEN ? AND ?
        AND o.status IN (${revenueStatusPlaceholders})
      GROUP BY c.id, c.name
      ORDER BY revenue DESC
      LIMIT ${Number(limit)}`,
    [
      toMysqlDateTime(from),
      toMysqlDateTime(to),
      ...REVENUE_STATUSES,
    ]
  );

  const total = rows.reduce((s, r) => s + Number(r.revenue), 0);

  return {
    total,
    items: rows.map((r) => ({
      category_id: r.category_id,
      name: r.name,
      revenue: Number(r.revenue),
    })),
  };
}

async function topWilayas({ from, to, limit }) {
  const [rows] = await pool.execute(
    `SELECT
        s.wilaya                        AS wilaya,
        COALESCE(SUM(o.total_amount),0) AS revenue
       FROM orders o
       JOIN shippings s ON s.order_id = o.id
      WHERE o.created_at BETWEEN ? AND ?
        AND o.status IN (${revenueStatusPlaceholders})
      GROUP BY s.wilaya
      ORDER BY revenue DESC
      LIMIT ${Number(limit)}`,
    [
      toMysqlDateTime(from),
      toMysqlDateTime(to),
      ...REVENUE_STATUSES,
    ]
  );

  const total = rows.reduce((s, r) => s + Number(r.revenue), 0);

  return {
    total,
    items: rows.map((r) => ({
      wilaya: r.wilaya,
      revenue: Number(r.revenue),
    })),
  };
}

module.exports = {
  countPendingOrders,
  countConfirmedOrders,
  countStockIssues,
  countNewRequests,
  metricsBetween,
  revenueSeries,
  ordersBreakdown,
  cancellationStats,
  topProducts,
  topCategories,
  topWilayas,
};