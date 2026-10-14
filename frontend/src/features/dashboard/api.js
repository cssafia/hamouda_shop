// src/features/dashboard/api.js
import { apiClient } from '../../services/apiClient'

export async function getPriority() {
  const { data } = await apiClient.get('/admin/analytics/dashboard/priority')
  return data.data
  // { pending_orders, confirmed_orders, stock_issues, new_requests }
}

export async function getToday() {
  const { data } = await apiClient.get('/admin/analytics/dashboard/today')
  return data.data
  // { today: {...}, yesterday: {...} }
}

export async function getRevenue({ period = '7d', metric = 'revenue' } = {}) {
  const { data } = await apiClient.get('/admin/analytics/dashboard/revenue', {
    params: { period, metric },
  })
  return data.data
  // { period, metric, group, total, previous_total, delta, points }
}