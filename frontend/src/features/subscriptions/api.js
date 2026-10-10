// src/features/subscription/api.js
import { apiClient } from '../../services/apiClient'

export async function createSubscription({ data, images }) {
  const fd = new FormData()
  fd.append('data', JSON.stringify(data))
  ;(images ?? []).forEach((f) => fd.append('images', f))

  const res = await apiClient.post('/admin/subscriptions', fd)
  return res.data.data
}

export async function updateSubscription(id, { data, images }) {
  const fd = new FormData()
  fd.append('data', JSON.stringify(data))
  ;(images ?? []).forEach((f) => fd.append('images', f))

  const res = await apiClient.patch(`/admin/subscriptions/${id}`, fd)
  return res.data.data
}

export async function toggleSubscriptionStatus(id, is_active) {
  const { data } = await apiClient.patch(
    `/admin/subscriptions/${id}/status`,
    { is_active }
  )
  return data.data
}