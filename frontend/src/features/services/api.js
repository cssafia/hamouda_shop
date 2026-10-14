// src/features/serviceRequests/api.js
import { apiClient } from '../../services/apiClient'

/* ---------- Public ---------- */
export async function createServiceRequest(payload) {
  const { data } = await apiClient.post('/service-requests', payload)
  return data.data
  // { id, status: 'pending', created_at }
}

/* ---------- Admin ---------- */
export async function listAdminServiceRequests(params = {}) {
  const { data } = await apiClient.get('/admin/service-requests', { params })
  return { items: data.data, meta: data.meta }
}

export async function getAdminServiceRequest(id) {
  const { data } = await apiClient.get(`/admin/service-requests/${id}`)
  return data.data
}

export async function completeServiceRequest(id, { profit }) {
  const { data } = await apiClient.patch(
    `/admin/service-requests/${id}/complete`,
    { profit }
  )
  return data.data
}

export async function cancelServiceRequest(id) {
  const { data } = await apiClient.patch(
    `/admin/service-requests/${id}/cancel`
  )
  return data.data
}