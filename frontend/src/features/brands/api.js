// src/features/brands/api.js
import { apiClient } from '../../services/apiClient'

/* ---------- Public ---------- */
export async function listPublicBrands({ category_id } = {}) {
  const { data } = await apiClient.get('/brands', {
    params: category_id ? { category_id } : {},
  })
  return data.data              // [{ id, name }]
}

/* ---------- Admin ---------- */
export async function listAdminBrands() {
  const { data } = await apiClient.get('/admin/brands')
  return data.data              // [{ id, name, is_active, created_at, updated_at }]
}

export async function createBrand({ name }) {
  const { data } = await apiClient.post('/admin/brands', { name })
  return data.data
}

export async function updateBrand(id, { name }) {
  const { data } = await apiClient.patch(`/admin/brands/${id}`, { name })
  return data.data
}

export async function toggleBrandStatus(id, is_active) {
  const { data } = await apiClient.patch(`/admin/brands/${id}/status`, { is_active })
  return data.data
}