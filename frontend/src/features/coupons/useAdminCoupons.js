// src/features/coupons/useAdminCoupons.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { couponKeys } from './keys'
import * as api from './api'

export function useAdminCoupons(filters = {}) {
  return useQuery({
    queryKey: couponKeys.adminList(filters),
    queryFn: () => api.listAdminCoupons(filters),
    staleTime: 0,
  })
}

export function useAdminCoupon(id) {
  return useQuery({
    queryKey: couponKeys.adminDetail(id),
    queryFn: () => api.getAdminCoupon(id),
    enabled: !!id,
    staleTime: 0,
  })
}

export function useCreateCoupon() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createCoupon,
    onSuccess: () => qc.invalidateQueries({ queryKey: couponKeys.all }),
  })
}

export function useUpdateCoupon(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.updateCoupon(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: couponKeys.adminDetail(id) })
      qc.invalidateQueries({ queryKey: ['coupons', 'admin', 'list'] })
    },
  })
}

export function useToggleCouponStatus(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (is_active) => api.toggleCouponStatus(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: couponKeys.adminDetail(id) })
      qc.invalidateQueries({ queryKey: ['coupons', 'admin', 'list'] })
    },
  })
}