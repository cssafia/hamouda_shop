// src/features/cart/useCart.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartKeys } from './keys'
import * as api from './api'


export function useCart(couponCode) {
  return useQuery({
    queryKey: cartKeys.detail(couponCode),
    queryFn: () => api.getCart({ coupon: couponCode }),
    staleTime: 0,
  })
}

export function useAddCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.addCartItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all }),
  })
}

export function useUpdateCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, quantity }) => api.updateCartItem(id, quantity),
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all }),
  })
}

export function useRemoveCartItem() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.removeCartItem,
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all }),
  })
}

export function useClearCart() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.clearCart,
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all }),
  })
}