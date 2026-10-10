// src/features/products/useAdminProducts.js
import { useQuery, useMutation, useQueryClient, keepPreviousData } from '@tanstack/react-query'
import { productKeys } from './keys'
import * as api from './api'
import { mapProductImages } from '../../utils/media'

/* --------------------------------------------------------------
   Queries
   -------------------------------------------------------------- */

/**
 * Admin product list.
 * filters: { page, limit, search, category_id, brand_id,
 *            product_type, is_active, sort }
 * Returns: { items, meta }
 */
export function useAdminProducts(filters = {}) {
  return useQuery({
    queryKey: productKeys.adminList(filters),
    queryFn: async () => {
      const data = await api.listAdminProducts(filters)
      return {
        ...data,
        items: (data?.items ?? []).map(mapProductImages),
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
  })
}

/**
 * Admin product detail (includes profit, stock, sku, inactive variants…).
 * Handles both physical and digital (subscription) shapes.
 */
export function useAdminProduct(id) {
  return useQuery({
    queryKey: productKeys.adminDetail(id),
    queryFn: async () => {
      const data = await api.getAdminProduct(id)
      return mapProductImages(data)
    },
    enabled: !!id,
    staleTime: 0,
  })
}

/* --------------------------------------------------------------
   Mutations
   -------------------------------------------------------------- */

export function useCreateProduct() {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: api.createProduct,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.adminList() })
    },
  })
}

export function useUpdateProduct(id) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (payload) => api.updateProduct(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.adminDetail(id) })
      qc.invalidateQueries({ queryKey: productKeys.publicDetail(id) })
      qc.invalidateQueries({ queryKey: ['products', 'admin', 'list'] })
      qc.invalidateQueries({ queryKey: ['products', 'public', 'list'] })
    },
  })
}

export function useToggleProductStatus(id) {
  const qc = useQueryClient()

  return useMutation({
    mutationFn: (is_active) => api.toggleProductStatus(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.adminDetail(id) })
      qc.invalidateQueries({ queryKey: productKeys.publicDetail(id) })
      qc.invalidateQueries({ queryKey: ['products', 'admin', 'list'] })
      qc.invalidateQueries({ queryKey: ['products', 'public', 'list'] })
    },
  })
}