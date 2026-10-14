// src/features/reports/api.js
import { apiClient } from '../../services/apiClient'

const BASE = '/admin/analytics/reports'

/* ---------- Summary ---------- */
export async function getSummary({ from, to }) {
  const { data } = await apiClient.get(`${BASE}/summary`, { params: { from, to } })
  return data.data
  // { from, to, group, summary: { revenue, profit, orders_count, average_order_value } }
}

/* ---------- Revenue + Profit over time ---------- */
export async function getRevenueReport({ from, to }) {
  const { data } = await apiClient.get(`${BASE}/revenue`, { params: { from, to } })
  return data.data
  // { from, to, group, points, totals }
}

/* ---------- Orders over time + cancellation ---------- */
export async function getOrdersReport({ from, to }) {
  const { data } = await apiClient.get(`${BASE}/orders`, { params: { from, to } })
  return data.data
  // { from, to, group, points, totals: { total, cancelled, cancel_rate } }
}

/* ---------- Top products ---------- */
export async function getTopProducts({ from, to, limit = 10 }) {
  const { data } = await apiClient.get(`${BASE}/top-products`, {
    params: { from, to, limit },
  })
  return data.data
  // { from, to, items: [{ product_id, name, revenue, profit, orders_count }] }
}

/* ---------- Top categories ---------- */
export async function getTopCategories({ from, to, limit = 10 }) {
  const { data } = await apiClient.get(`${BASE}/top-categories`, {
    params: { from, to, limit },
  })
  return data.data
  // { from, to, items: [{ category_id, name, revenue, orders_count, pct }] }
}

/* ---------- Top wilayas ---------- */
export async function getTopWilayas({ from, to, limit = 10 }) {
  const { data } = await apiClient.get(`${BASE}/top-wilayas`, {
    params: { from, to, limit },
  })
  return data.data
  // { from, to, items: [{ wilaya, orders_count, revenue, pct }] }
}