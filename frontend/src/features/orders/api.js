// src/features/orders/api.js
import { apiClient } from '../../services/apiClient'
import { getSessionId } from '../../utils/session'

/* ---------- Public ---------- */
export async function placeOrder(payload) {
  const { data } = await apiClient.post('/orders', payload, {
    headers: { 'X-Session-Id': getSessionId() },
  })
  return data.data
  // { id, status, order_type, total_amount, created_at }
}

/* ---------- Admin ---------- */
export async function listAdminOrders(params = {}) {
  const { data } = await apiClient.get('/admin/orders', { params })
  return { items: data.data, meta: data.meta }
}

export async function getAdminOrder(id) {
  const { data } = await apiClient.get(`/admin/orders/${id}`)
  return data.data
}

export async function updateOrderStatus(id, payload) {
  const { data } = await apiClient.patch(`/admin/orders/${id}/status`, payload)
  return data.data
}

export async function updateOrderShipping(id, payload) {
  const { data } = await apiClient.patch(`/admin/orders/${id}/shipping`, payload)
  return data.data
}