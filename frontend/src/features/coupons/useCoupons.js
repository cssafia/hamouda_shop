// src/features/coupons/useCoupons.js
import { useMutation } from '@tanstack/react-query'
import * as api from './api'

/**
 * Validates a coupon code for the current cart session.
 * Returns: { valid, discount, message, coupon }
 */
export function useValidateCoupon() {
  return useMutation({ mutationFn: api.validateCoupon })
}