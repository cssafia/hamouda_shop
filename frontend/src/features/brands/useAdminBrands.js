// src/features/brands/useAdminBrands.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { brandKeys } from './keys'
import * as api from './api'

export function useAdminBrands() {
  return useQuery({
    queryKey: brandKeys.adminList(),
    queryFn: api.listAdminBrands,
    staleTime: 0,
  })
}

export function useCreateBrand() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createBrand,
    onSuccess: () => qc.invalidateQueries({ queryKey: brandKeys.all }),
  })
}

export function useUpdateBrand(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.updateBrand(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: brandKeys.all }),
  })
}

export function useToggleBrandStatus(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (is_active) => api.toggleBrandStatus(id, is_active),
    onSuccess: () => qc.invalidateQueries({ queryKey: brandKeys.all }),
  })
}