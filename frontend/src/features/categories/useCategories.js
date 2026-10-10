// src/features/categories/useCategories.js
import { useQuery } from '@tanstack/react-query'
import { categoryKeys } from './keys'
import * as api from './api'

/**
 * Public categories (active only).
 * Returns: [{ id, name }]
 */
export function useCategories() {
  return useQuery({
    queryKey: categoryKeys.publicTree(),
    queryFn: api.listPublicCategories,
    staleTime: 5 * 60_000,
  })
}