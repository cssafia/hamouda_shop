// src/features/stock/useAdminStock.js
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { stockKeys } from './Keys'
import * as api from './api'
import { mapProductImages, mapProductList } from '../../utils/media'

export function useAdminStock(filters = {}) {
  return useQuery({
    queryKey: stockKeys.list(filters),
    queryFn: async () => {
      const data = await api.listStock(filters)
      return mapProductList(data)
    },
    placeholderData: keepPreviousData,
    staleTime: 0,
  })
}

export function useStockProduct(productId) {
  return useQuery({
    queryKey: stockKeys.detail(productId),
    queryFn: async () => {
      const data = await api.getStock(productId)
      return mapProductImages(data)
    },
    enabled: !!productId,
    staleTime: 0,
  })
}

export function useAdjustStock(productId) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.adjustStock(productId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: stockKeys.detail(productId) })
      qc.invalidateQueries({ queryKey: ['stock', 'list'] })
    },
  })
}