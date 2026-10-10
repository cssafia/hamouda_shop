// src/features/products/useProducts.js
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { productKeys } from './keys'
import * as api from './api'
import { mapProductImages } from '../../utils/media'

/**
 * Public product list (paginated).
 * filters: { page, limit, category_id, brand_id, usage, price_min,
 *            price_max, availability, product_type, search, sort }
 * Returns: { items, meta }
 */
export function useProducts(filters = {}) {
  return useQuery({
    queryKey: productKeys.publicList(filters),
    queryFn: async () => {
      const data = await api.listProducts(filters)
      return {
        ...data,
        items: (data?.items ?? []).map(mapProductImages),
      }
    },
    placeholderData: keepPreviousData,
    staleTime: 60_000,
  })
}

/**
 * Public product detail.
 * Returns: product object (with variants, images, specs, usages).
 */
export function useProduct(id) {
  return useQuery({
    queryKey: productKeys.publicDetail(id),
    queryFn: async () => {
      const data = await api.getProduct(id)
      return mapProductImages(data)
    },
    enabled: !!id,
    staleTime: 60_000,
  })
}