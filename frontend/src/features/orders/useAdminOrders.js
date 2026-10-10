// src/features/orders/useAdminOrders.js
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { orderKeys } from './keys'
import * as api from './api'

/* ---------- Queries ---------- */
export function useAdminOrders(filters = {}) {
  return useQuery({
    queryKey: orderKeys.adminList(filters),
    queryFn: () => api.listAdminOrders(filters),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })
}

export function useAdminOrder(id) {
  return useQuery({
    queryKey: orderKeys.adminDetail(id),
    queryFn: () => api.getAdminOrder(id),
    enabled: !!id,
    staleTime: 0,
  })
}

/* ---------- Mutations ---------- */
export function useUpdateOrderStatus(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.updateOrderStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.adminDetail(id) })
      qc.invalidateQueries({ queryKey: ['orders', 'admin', 'list'] })
    },
  })
}

export function useUpdateOrderShipping(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.updateOrderShipping(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: orderKeys.adminDetail(id) })
      qc.invalidateQueries({ queryKey: ['orders', 'admin', 'list'] })
    },
  })
}