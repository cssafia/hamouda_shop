// src/components/admin/orders/OrderCardMobile.jsx
import { useNavigate } from 'react-router-dom'
import { LuPhone, LuMessageCircle } from 'react-icons/lu'

import { formatCurrency, formatRelative, formatPhoneForWhatsApp } from '../../../utils/format'
import { ORDER_STATUS_BORDER, getPrimaryAction } from '../../../constants/orders'
import OrderStatusPill from './OrderStatusPill'
import { SHOP_NAME } from '../../../constants/config'

export default function OrderCardMobile({ order, onPrimaryAction, isUpdating }) {
  const navigate = useNavigate()
  const border = ORDER_STATUS_BORDER[order.status] ?? 'border-l-ink-400'
  const action = getPrimaryAction(order.status, order.order_type)
  const phone = formatPhoneForWhatsApp(order.customer_phone)

  const openWhatsApp = (e) => {
    e.stopPropagation()
    const text = encodeURIComponent(
      `Bonjour ${order.customer_name}, c'est ${SHOP_NAME}.\n` +
        `Je vous contacte au sujet de votre commande #${order.id}.`
    )
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener')
  }

  const callCustomer = (e) => {
    e.stopPropagation()
    window.location.href = `tel:+${phone}`
  }

  return (
    <li className={`card overflow-hidden border-l-2 ${border}`}>
      <button
        type="button"
        onClick={() => navigate(`/admin/orders/${order.id}`)}
        className="w-full text-left p-3.5"
      >
        <div className="flex items-start justify-between gap-3">
          <span className="font-mono text-sm font-medium text-ink-900">#{order.id}</span>
          <OrderStatusPill status={order.status} />
        </div>

        <div className="mt-2">
          <p className="text-sm font-medium text-ink-900 truncate">{order.customer_name}</p>
          <p className="text-xs text-ink-600 font-mono">{order.customer_phone}</p>
        </div>

        <div className="mt-3 pt-3 border-t border-surface-border">
          <p className="text-sm text-ink-900 truncate">
            {order.items_preview || `${order.items_count} article${order.items_count > 1 ? 's' : ''}`}
          </p>
          <div className="flex items-center justify-between mt-1">
            <span className="text-sm font-medium text-ink-900">
              {formatCurrency(order.total_amount)}
            </span>
            <span className="text-xs text-ink-400">{formatRelative(order.created_at)}</span>
          </div>
        </div>
      </button>

      <div className="border-t border-surface-border grid grid-cols-3">
        <button
          type="button"
          onClick={callCustomer}
          className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-ink-700 hover:bg-surface-subtle transition-colors border-r border-surface-border"
        >
          <LuPhone size={15} /> Appeler
        </button>

        <button
          type="button"
          onClick={openWhatsApp}
          className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-[#25D366] hover:bg-[#25D366]/5 transition-colors border-r border-surface-border"
        >
          <LuMessageCircle size={15} /> WhatsApp
        </button>

        {action ? (
          <button
            type="button"
            onClick={() => onPrimaryAction?.(order, action.next)}
            disabled={isUpdating}
            className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors disabled:opacity-50"
          >
            {action.label}
          </button>
        ) : (
          <span className="flex items-center justify-center py-3 text-xs text-ink-400">
            Terminée
          </span>
        )}
      </div>
    </li>
  )
}