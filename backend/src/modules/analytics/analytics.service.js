'use strict';

const repo = require('./analytics.repository');
const {
  parsePeriod,
  parseRange,
  delta,
  fillSeries,
} = require('./analytics.helpers');

/* ─── Dashboard ───────────────────────────────────────────── */

async function getPriority() {
  const [pending_orders, confirmed_orders, stock_issues, new_requests] =
    await Promise.all([
      repo.countPendingOrders(),
      repo.countConfirmedOrders(),
      repo.countStockIssues(),
      repo.countNewRequests(),
    ]);
  return { pending_orders, confirmed_orders, stock_issues, new_requests };
}

async function getToday() {
  const now = new Date();

  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);
  const todayEnd = new Date(now);
  todayEnd.setHours(23, 59, 59, 999);

  const yesterdayStart = new Date(todayStart);
  yesterdayStart.setDate(yesterdayStart.getDate() - 1);
  const yesterdayEnd = new Date(yesterdayStart);
  yesterdayEnd.setHours(23, 59, 59, 999);

  const [today, yesterday] = await Promise.all([
    repo.metricsBetween({ from: todayStart, to: todayEnd }),
    repo.metricsBetween({ from: yesterdayStart, to: yesterdayEnd }),
  ]);

  return { today, yesterday };
}

async function getDashboardRevenue({ period = '7d', metric = 'revenue' }) {
  const { from, to, group, previousFrom, previousTo } = parsePeriod(period);

  const [points, previousPoints] = await Promise.all([
    repo.revenueSeries({ from, to, group }),
    repo.revenueSeries({ from: previousFrom, to: previousTo, group }),
  ]);

  const dense = fillSeries(from, to, group, points, {
    revenue: 0, profit: 0, orders_count: 0,
  });

  const total = dense.reduce((s, p) => s + Number(p[metric]), 0);
  const previous_total = previousPoints.reduce((s, p) => s + Number(p[metric]), 0);

  return {
    period,
    metric,
    group,
    total,
    previous_total,
    delta: delta(total, previous_total),
    points: dense.map((p) => ({
      date: p.date,
      value: Number(p[metric]),
      orders_count: p.orders_count,
    })),
  };
}

/* ─── Reports ─────────────────────────────────────────────── */

async function getReportsSummary({ from, to }) {
  const range = parseRange(from, to);

  const [current, previous] = await Promise.all([
    repo.metricsBetween({ from: range.from, to: range.to }),
    repo.metricsBetween({ from: range.previousFrom, to: range.previousTo }),
  ]);

  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    group: range.group,
    summary: {
      revenue:              { value: current.revenue,              previous: previous.revenue,              delta: delta(current.revenue, previous.revenue) },
      profit:               { value: current.profit,               previous: previous.profit,               delta: delta(current.profit, previous.profit) },
      orders_count:         { value: current.orders_count,         previous: previous.orders_count,         delta: delta(current.orders_count, previous.orders_count) },
      average_order_value:  { value: current.average_order_value,  previous: previous.average_order_value,  delta: delta(current.average_order_value, previous.average_order_value) },
      services_completed:   { value: current.services_completed,   previous: previous.services_completed,   delta: delta(current.services_completed, previous.services_completed) },
    },
  };
}

async function getReportsRevenue({ from, to }) {
  const range = parseRange(from, to);

  const [points, previousPoints] = await Promise.all([
    repo.revenueSeries({ from: range.from, to: range.to, group: range.group }),
    repo.revenueSeries({ from: range.previousFrom, to: range.previousTo, group: range.group }),
  ]);

  const dense = fillSeries(range.from, range.to, range.group, points, {
    revenue: 0, profit: 0, orders_count: 0,
  });

  const totalRevenue = dense.reduce((s, p) => s + p.revenue, 0);
  const totalProfit  = dense.reduce((s, p) => s + p.profit, 0);
  const prevRevenue  = previousPoints.reduce((s, p) => s + p.revenue, 0);
  const prevProfit   = previousPoints.reduce((s, p) => s + p.profit, 0);

  const margin_pct = totalRevenue > 0
    ? Math.round((totalProfit / totalRevenue) * 1000) / 10
    : 0;

  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    group: range.group,
    points: dense,
    totals: {
      revenue: totalRevenue,
      profit: totalProfit,
      margin_pct,
      revenue_delta: delta(totalRevenue, prevRevenue),
      profit_delta: delta(totalProfit, prevProfit),
    },
  };
}

async function getReportsOrders({ from, to }) {
  const range = parseRange(from, to);

  const [breakdown, stats] = await Promise.all([
    repo.ordersBreakdown({ from: range.from, to: range.to }),
    repo.cancellationStats({ from: range.from, to: range.to }),
  ]);

  const total = Object.values(breakdown).reduce((s, n) => s + n, 0);

  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    total,
    breakdown,
    totals: {
      cancelled: stats.cancelled,
      cancel_rate: stats.cancel_rate,
      top_cancel_reason: stats.top_cancel_reason,
    },
  };
}

async function getTopProducts({ from, to, limit = 10 }) {
  const range = parseRange(from, to);
  const items = await repo.topProducts({ from: range.from, to: range.to, limit });
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    items,
  };
}

async function getTopCategories({ from, to, limit = 10 }) {
  const range = parseRange(from, to);
  const result = await repo.topCategories({ from: range.from, to: range.to, limit });
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    total: result.total,
    items: result.items,
  };
}

async function getTopWilayas({ from, to, limit = 10 }) {
  const range = parseRange(from, to);
  const result = await repo.topWilayas({ from: range.from, to: range.to, limit });
  return {
    from: range.from.toISOString(),
    to: range.to.toISOString(),
    total: result.total,
    items: result.items,
  };
}

module.exports = {
  getPriority,
  getToday,
  getDashboardRevenue,
  getReportsSummary,
  getReportsRevenue,
  getReportsOrders,
  getTopProducts,
  getTopCategories,
  getTopWilayas,
};