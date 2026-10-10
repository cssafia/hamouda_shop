// src/features/coupons/api.js
import { apiClient } from '../../services/apiClient'
import { getSessionId } from '../../utils/session'

/* ---------- Public ---------- */
export async function validateCoupon(code) {
  const { data } = await apiClient.post(
    '/coupons/validate',
    { code },
    { headers: { 'X-Session-Id': getSessionId() } }
  )
  return data.data
  // { valid, discount, message, coupon }
}

/* ---------- Admin ---------- */
export async function listAdminCoupons(params = {}) {
  const { data } = await apiClient.get('/admin/coupons', { params })
  return { items: data.data, meta: data.meta }
}

export async function getAdminCoupon(id) {
  const { data } = await apiClient.get(`/admin/coupons/${id}`)
  return data.data
}

export async function createCoupon(payload) {
  const { data } = await apiClient.post('/admin/coupons', payload)
  return data.data
}

export async function updateCoupon(id, payload) {
  const { data } = await apiClient.patch(`/admin/coupons/${id}`, payload)
  return data.data
}

export async function toggleCouponStatus(id, is_active) {
  const { data } = await apiClient.patch(
    `/admin/coupons/${id}/status`,
    { is_active }
  )
  return data.data
}