// src/features/shipping/useShipping.js
import { useQuery } from '@tanstack/react-query'
import { shippingKeys } from './keys'
import * as api from './api'


export function useWilayas() {
  return useQuery({
    queryKey: shippingKeys.wilayas(),
    queryFn: api.listWilayas,
    staleTime: 60 * 60_000, // 1 hour
  })
}

/**
 * Communes for a given wilaya. Enabled only when wilayaCode is set.
 */
export function useCommunes(wilayaCode) {
  return useQuery({
    queryKey: shippingKeys.communes(wilayaCode),
    queryFn: () => api.listCommunes(wilayaCode),
    enabled: !!wilayaCode,
    staleTime: 60 * 60_000,
  })
}