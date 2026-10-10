// src/features/products/api.js
import { apiClient } from '../../services/apiClient'

//    Helpers
function toProductFormData(data, images) {
  const fd = new FormData()
  fd.append('data', JSON.stringify(data))
  if (images) {
    // Accept File[] OR FileList
    Array.from(images).forEach((file) => fd.append('images', file))
  }
  return fd
}

/* --------------------------------------------------------------
   Public
   -------------------------------------------------------------- */
export async function listProducts(params = {}) {
  const { data } = await apiClient.get('/products', { params })
  return { items: data.data, meta: data.meta }
}

export async function getProduct(id) {
  const { data } = await apiClient.get(`/products/${id}`)
  return data.data
}

/* --------------------------------------------------------------
   Admin — products
   -------------------------------------------------------------- */
export async function listAdminProducts(params = {}) {
  const { data } = await apiClient.get('/admin/products', { params })
  return { items: data.data, meta: data.meta }
}

export async function getAdminProduct(id) {
  const { data } = await apiClient.get(`/admin/products/${id}`)
  return data.data
}

export async function createProduct({ data, images }) {
  const fd = toProductFormData(data, images)
  const res = await apiClient.post('/admin/products', fd)
  return res.data.data
}

export async function updateProduct(id, { data, images }) {
  const fd = toProductFormData(data, images)
  const res = await apiClient.patch(`/admin/products/${id}`, fd)
  return res.data.data
}

export async function toggleProductStatus(id, is_active) {
  const { data } = await apiClient.patch(`/admin/products/${id}/status`, { is_active })
  return data.data
}

/* --------------------------------------------------------------
   Admin — variants
   -------------------------------------------------------------- */
export async function listVariants(productId) {
  const { data } = await apiClient.get(`/admin/products/${productId}/variants`)
  return data.data
}

export async function createVariant(productId, payload) {
  const { data } = await apiClient.post(`/admin/products/${productId}/variants`, payload)
  return data.data
}

export async function updateVariant(productId, variantId, payload) {
  const { data } = await apiClient.patch(
    `/admin/products/${productId}/variants/${variantId}`,
    payload
  )
  return data.data
}

export async function toggleVariantStatus(productId, variantId, is_active) {
  const { data } = await apiClient.patch(
    `/admin/products/${productId}/variants/${variantId}/status`,
    { is_active }
  )
  return data.data
}

export async function replaceVariantSpecs(productId, variantId, specifications) {
  const { data } = await apiClient.put(
    `/admin/products/${productId}/variants/${variantId}/specifications`,
    { specifications }
  )
  return data.data
}