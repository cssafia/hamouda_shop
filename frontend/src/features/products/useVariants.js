// src/features/products/useVariants.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { productKeys } from './keys'
import * as api from './api'

/* --------------------------------------------------------------
   Query
   -------------------------------------------------------------- */

/**
 * List all variants (active + inactive) of a product.
 * Returns: array of variants.
 */
export function useVariants(productId) {
  return useQuery({
    queryKey: productKeys.variants(productId),
    queryFn: () => api.listVariants(productId),
    enabled: !!productId,
    staleTime: 0,
  })
}

/* --------------------------------------------------------------
   Shared invalidation helper
   -------------------------------------------------------------- */
function invalidateVariantsFamily(qc, productId) {
  // Variant list for this product
  qc.invalidateQueries({ queryKey: productKeys.variants(productId) })
  // Product detail (admin + public) — specs, price_range, stock change
  qc.invalidateQueries({ queryKey: productKeys.adminDetail(productId) })
  qc.invalidateQueries({ queryKey: productKeys.publicDetail(productId) })
  // Lists (admin + public) — price_range / stock display
  qc.invalidateQueries({ queryKey: ['products', 'admin', 'list'] })
  qc.invalidateQueries({ queryKey: ['products', 'public', 'list'] })
}

/* --------------------------------------------------------------
   Mutations
   -------------------------------------------------------------- */

export function useCreateVariant(productId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.createVariant(productId, payload),
    onSuccess: () => invalidateVariantsFamily(qc, productId),
  })
}

export function useUpdateVariant(productId, variantId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.updateVariant(productId, variantId, payload),
    onSuccess: () => invalidateVariantsFamily(qc, productId),
  })
}

export function useToggleVariantStatus(productId, variantId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (is_active) => api.toggleVariantStatus(productId, variantId, is_active),
    onSuccess: () => invalidateVariantsFamily(qc, productId),
  })
}

export function useReplaceVariantSpecs(productId, variantId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (specifications) =>
      api.replaceVariantSpecs(productId, variantId, specifications),
    onSuccess: () => invalidateVariantsFamily(qc, productId),
  })
}