// src/features/categories/useAdminCategories.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { categoryKeys } from './keys'
import * as api from './api'

/* ---------- Query ---------- */
export function useAdminCategories() {
  return useQuery({
    queryKey: categoryKeys.adminTree(),
    queryFn: api.listAdminCategories,
    staleTime: 0,
  })
}

/* ---------- Mutations ---------- */
export function useCreateCategory() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.createCategory,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.adminTree() })
      qc.invalidateQueries({ queryKey: categoryKeys.publicTree() })
    },
  })
}

export function useUpdateCategory(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.updateCategory(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.adminTree() })
      qc.invalidateQueries({ queryKey: categoryKeys.publicTree() })
    },
  })
}

export function useToggleCategoryStatus(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (is_active) => api.toggleCategoryStatus(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: categoryKeys.adminTree() })
      qc.invalidateQueries({ queryKey: categoryKeys.publicTree() })
    },
  })
}