// src/features/orders/useOrders.js
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { cartKeys } from '../cart/keys'
import * as api from './api'

/**
 * Places an order from the current session cart.
 * On success, the backend clears the cart → invalidate cart queries.
 */
export function usePlaceOrder() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.placeOrder,
    onSuccess: () => qc.invalidateQueries({ queryKey: cartKeys.all }),
  })
}