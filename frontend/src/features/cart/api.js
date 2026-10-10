// src/features/cart/api.js
import { apiClient } from '../../services/apiClient'
import { getSessionId } from '../../utils/session'

const withSession = () => ({ headers: { 'X-Session-Id': getSessionId() } })

export async function getCart({ coupon } = {}) {
  const params = {}
  if (coupon) params.coupon = coupon
  const { data } = await apiClient.get('/cart', { ...withSession(), params })
  return data.data
}

export async function addCartItem({ product_id, variant_id, quantity = 1 }) {
  const body = { product_id, quantity }
  if (variant_id) body.variant_id = variant_id
  const { data } = await apiClient.post('/cart/items', body, withSession())
  return data.data
}

export async function updateCartItem(id, quantity) {
  const { data } = await apiClient.patch(
    `/cart/items/${id}`,
    { quantity },
    withSession()
  )
  return data.data
}

export async function removeCartItem(id) {
  const { data } = await apiClient.delete(`/cart/items/${id}`, withSession())
  return data.data
}

export async function clearCart() {
  const { data } = await apiClient.delete('/cart', withSession())
  return data.data
}