// src/features/brands/useBrands.js
import { useQuery } from '@tanstack/react-query'
import { brandKeys } from './keys'
import * as api from './api'

/**
 * Public brands. Pass a categoryId to filter to brands that have active
 * products in that category (backend handles subcategory inclusion).
 */
export function useBrands(categoryId) {
  return useQuery({
    queryKey: brandKeys.publicList(categoryId),
    queryFn: () => api.listPublicBrands({ category_id: categoryId }),
    staleTime: 5 * 60_000,
  })
}