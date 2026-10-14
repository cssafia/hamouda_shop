// src/components/admin/notifications/notificationMeta.js
import {
  ShoppingCart,
  CheckCircle2,
  Truck,
  XCircle,
  AlertTriangle,
  MessageSquare,
} from 'lucide-react'

export const TYPE_META = {
  new_order:       { Icon: ShoppingCart,  cls: 'bg-brand-50 text-brand-600' },
  order_confirmed: { Icon: CheckCircle2,  cls: 'bg-success/10 text-success' },
  order_shipped:   { Icon: Truck,         cls: 'bg-brand-50 text-brand-700' },
  order_cancelled: { Icon: XCircle,       cls: 'bg-danger/10 text-danger' },
  low_stock:       { Icon: AlertTriangle, cls: 'bg-warning/10 text-warning' },
  new_request:     { Icon: MessageSquare, cls: 'bg-brand-50 text-brand-600' },
}

export const NOTIFICATION_NAV = {
  order:   (id) => `/admin/orders/${id}`,
  product: (id) => `/admin/products/${id}`,
  request: (id) => `/admin/requests/${id}`,
  stock:   ()   => `/admin/stock`,
}

export function timeAgo(iso) {
  if (!iso) return ''
  const now = Date.now()
  const then = new Date(iso).getTime()
  const sec = Math.max(0, Math.floor((now - then) / 1000))
  if (sec < 60) return "à l'instant"
  const min = Math.floor(sec / 60)
  if (min < 60) return `il y a ${min} min`
  const h = Math.floor(min / 60)
  if (h < 24) return `il y a ${h} h`
  const d = Math.floor(h / 24)
  if (d === 1) return 'hier'
  if (d < 7) return `il y a ${d} j`
  return new Date(iso).toLocaleDateString('fr-FR')
}