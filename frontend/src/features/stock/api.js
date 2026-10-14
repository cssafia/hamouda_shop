// src/features/stock/api.js
import { apiClient } from '../../services/apiClient'

export async function listStock(params = {}) {
  const { data } = await apiClient.get('/admin/stock', { params })
  return { items: data.data, meta: data.meta }
}

export async function getStock(productId) {
  const { data } = await apiClient.get(`/admin/stock/${productId}`)
  return data.data
}


export async function adjustStock(productId, { delta, variantId }) {
  const body = { delta }
  if (variantId != null) body.variant_id = variantId
  const { data } = await apiClient.patch(`/admin/stock/${productId}`, body)
  return data.data
}