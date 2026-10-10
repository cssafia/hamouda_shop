// src/features/categories/api.js
import { apiClient } from '../../services/apiClient'

/* ---------- Public ---------- */
export async function listPublicCategories() {
  const { data } = await apiClient.get('/categories')
  return data.data                       // [{ id, name }]
}

/* ---------- Admin ---------- */
export async function listAdminCategories() {
  const { data } = await apiClient.get('/admin/categories')
  return data.data                       // [{ id, name, is_active, created_at, updated_at }]
}

export async function createCategory({ name }) {
  const { data } = await apiClient.post('/admin/categories', { name })
  return data.data
}

export async function updateCategory(id, { name }) {
  const { data } = await apiClient.patch(`/admin/categories/${id}`, { name })
  return data.data
}

export async function toggleCategoryStatus(id, is_active) {
  const { data } = await apiClient.patch(
    `/admin/categories/${id}/status`,
    { is_active }
  )
  return data.data
}