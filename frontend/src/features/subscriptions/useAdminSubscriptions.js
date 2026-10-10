import { useMutation, useQueryClient } from '@tanstack/react-query'
import { productKeys } from '../products/keys'
import * as subApi from './api'

export function useCreateSubscription() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: subApi.createSubscription,
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['products', 'admin', 'list'] })
      qc.invalidateQueries({ queryKey: ['products', 'public', 'list'] })
    },
  })
}

export function useUpdateSubscription(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (payload) => subApi.updateSubscription(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.adminDetail(id) })
      qc.invalidateQueries({ queryKey: productKeys.publicDetail(id) })
      qc.invalidateQueries({ queryKey: ['products', 'admin', 'list'] })
      qc.invalidateQueries({ queryKey: ['products', 'public', 'list'] })
    },
  })
}

export function useToggleSubscriptionStatus(id) {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (is_active) => subApi.toggleSubscriptionStatus(id, is_active),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: productKeys.adminDetail(id) })
      qc.invalidateQueries({ queryKey: ['products', 'admin', 'list'] })
    },
  })
}