// src/components/admin/orders/OrderRow.jsx
import { useNavigate } from 'react-router-dom'
import { LuPhone, LuMessageCircle } from 'react-icons/lu'

import { formatCurrency, formatRelative, formatPhoneForWhatsApp } from '../../../utils/format'
import { ORDER_STATUS_BORDER } from '../../../constants/orders'
import OrderStatusPill from './OrderStatusPill'
import { SHOP_NAME } from '../../../constants/config'

export default function OrderRow({ order }) {
  const navigate = useNavigate()
  const border = ORDER_STATUS_BORDER[order.status] ?? 'border-l-ink-400'
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
    <tr
      onClick={() => navigate(`/admin/orders/${order.id}`)}
      className={`cursor-pointer border-l-2 ${border} hover:bg-surface-subtle transition-colors`}
    >
      <td className="px-4 py-3 align-top">
        <span className="font-mono text-sm font-medium text-ink-900">#{order.id}</span>
      </td>

      <td className="px-4 py-3 align-top">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-900 truncate">{order.customer_name}</p>
          <p className="text-xs text-ink-600 font-mono">{order.customer_phone}</p>
        </div>
      </td>

      <td className="px-4 py-3 align-top">
        <p className="text-sm text-ink-900 truncate max-w-[280px]">
          {order.items_preview || `${order.items_count} article${order.items_count > 1 ? 's' : ''}`}
        </p>
      </td>

      <td className="px-4 py-3 align-top text-right">
        <span className="text-sm font-medium text-ink-900">
          {formatCurrency(order.total_amount)}
        </span>
      </td>

      <td className="px-4 py-3 align-top">
        <OrderStatusPill status={order.status} />
        <p className="text-xs text-ink-400 mt-1">{formatRelative(order.created_at)}</p>
      </td>

      <td className="px-4 py-3 align-top text-right">
        <div className="inline-flex items-center gap-1">
          <button
            type="button"
            onClick={callCustomer}
            aria-label="Appeler le client"
            title="Appeler"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-ink-600 hover:bg-surface-subtle hover:text-ink-900 transition-colors"
          >
            <LuPhone size={16} />
          </button>
          <button
            type="button"
            onClick={openWhatsApp}
            aria-label="Contacter sur WhatsApp"
            title="WhatsApp"
            className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
          >
            <LuMessageCircle size={18} />
          </button>
        </div>
      </td>
    </tr>
  )
}