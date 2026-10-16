// src/features/brands/api.js
import { apiClient } from '../../services/apiClient'

/* ---------- Public ---------- */
export async function listPublicBrands({ category_id } = {}) {
  const params = {}
  if (category_id) params.category_id = category_id
  const { data } = await apiClient.get('/brands', { params })
  return data.data
}

/* ---------- Admin ---------- */
export async function listAdminBrands() {
  const { data } = await apiClient.get('/admin/brands')
  return data.data
}

export async function createBrand({ name, category_ids = [] }) {
  const { data } = await apiClient.post('/admin/brands', { name, category_ids })
  return data.data
}

export async function updateBrand(id, { name, category_ids }) {
  const payload = {}
  if (name !== undefined) payload.name = name
  if (category_ids !== undefined) payload.category_ids = category_ids
  const { data } = await apiClient.patch(`/admin/brands/${id}`, payload)
  return data.data
}

export async function toggleBrandStatus(id, is_active) {
  const { data } = await apiClient.patch(
    `/admin/brands/${id}/status`,
    { is_active }
  )
  return data.data
}