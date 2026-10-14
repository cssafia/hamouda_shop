// src/features/serviceRequests/useServiceRequests.js
import { useMutation } from '@tanstack/react-query'
import * as api from './api'

/**
 * Submit a service request from the storefront.
 * Body: { customer_name, customer_phone, service_name, description }
 * On success: { id, status: 'pending', created_at }
 */
export function useCreateServiceRequest() {
  return useMutation({
    mutationFn: api.createServiceRequest,
  })
}