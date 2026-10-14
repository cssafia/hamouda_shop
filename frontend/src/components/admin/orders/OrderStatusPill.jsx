// src/components/admin/orders/OrderStatusPill.jsx
import StatusPill from '../../ui/StatusPill'
import { ORDER_STATUS_LABELS, ORDER_STATUS_TONES } from '../../../constants/orders'

export default function OrderStatusPill({ status }) {
  const tone = ORDER_STATUS_TONES[status] ?? 'neutral'
  const label = ORDER_STATUS_LABELS[status] ?? status
  return <StatusPill tone={tone}>{label}</StatusPill>
}