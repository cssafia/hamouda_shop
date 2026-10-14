// src/features/serviceRequests/useAdminServiceRequests.js
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData,
} from '@tanstack/react-query'
import { serviceRequestKeys } from './keys'
import * as api from './api'

//    Queries

/**
 * Admin list.
 * filters: { page, limit, status, search, date_from, date_to, sort }
 * Returns: { items, meta }
 */
export function useAdminServiceRequests(filters = {}) {
  return useQuery({
    queryKey: serviceRequestKeys.adminList(filters),
    queryFn: () => api.listAdminServiceRequests(filters),
    placeholderData: keepPreviousData,
    staleTime: 0,
  })
}

export function useAdminServiceRequest(id) {
  return useQuery({
    queryKey: serviceRequestKeys.adminDetail(id),
    queryFn: () => api.getAdminServiceRequest(id),
    enabled: !!id,
    staleTime: 0,
  })
}

//    Mutations

/**
 * Complete a request (only when status = 'pending').
 * Body: { profit }
 */
export function useCompleteServiceRequest(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => api.completeServiceRequest(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceRequestKeys.adminDetail(id) })
      qc.invalidateQueries({ queryKey: ['service-requests', 'admin', 'list'] })
    },
  })
}

/**
 * Cancel a request (only when status = 'pending').
 * No body.
 */
export function useCancelServiceRequest(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: () => api.cancelServiceRequest(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: serviceRequestKeys.adminDetail(id) })
      qc.invalidateQueries({ queryKey: ['service-requests', 'admin', 'list'] })
    },
  })
}