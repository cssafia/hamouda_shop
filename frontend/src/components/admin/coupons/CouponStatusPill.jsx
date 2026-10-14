// src/components/admin/coupons/CouponStatusPill.jsx
import StatusPill from '../../ui/StatusPill'
import {
  deriveCouponState,
  COUPON_STATE_LABELS,
  COUPON_STATE_TONES,
} from '../../../constants/coupons'

export default function CouponStatusPill({ coupon }) {
  const state = deriveCouponState(coupon)
  return (
    <StatusPill tone={COUPON_STATE_TONES[state]}>
      {COUPON_STATE_LABELS[state]}
    </StatusPill>
  )
}