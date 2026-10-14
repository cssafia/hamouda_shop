// src/components/admin/requests/RequestRow.jsx
import { useNavigate } from 'react-router-dom'
import { LuMessageCircle } from 'react-icons/lu'

import { formatRelative, formatPhoneForWhatsApp } from '../../../utils/format'
import {
  SERVICE_REQUEST_STATUS_LABELS,
  SERVICE_REQUEST_STATUS_TONES,
} from '../../../constants/serviceRequests'
import StatusPill from '../../ui/StatusPill'

function buildMessage(status, name, service) {
  if (status === 'cancelled') {
    return `السلام عليكم ${name}، للأسف ما قدرناش نديرو طلبك. نعتذر على الإزعاج.`
  }
  return `السلام عليكم ${name}، وصلنا طلبك بخصوص "${service}". راح نتواصلو معاك للتأكيد.`
}

export default function RequestRow({ request }) {
  const navigate = useNavigate()
  const tone = SERVICE_REQUEST_STATUS_TONES[request.status] ?? 'neutral'
  const label = SERVICE_REQUEST_STATUS_LABELS[request.status] ?? request.status

  const openWhatsApp = (e) => {
    e.stopPropagation()
    const phone = formatPhoneForWhatsApp(request.customer_phone)
    const text = encodeURIComponent(
      buildMessage(request.status, request.customer_name, request.service_name)
    )
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener')
  }

  return (
    <tr
      onClick={() => navigate(`/admin/requests/${request.id}`)}
      className="cursor-pointer hover:bg-surface-subtle transition-colors"
    >
      <td className="px-4 py-3 align-top">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink-900 truncate">
            {request.customer_name}
          </p>
          <p className="text-xs text-ink-600 font-mono">
            {request.customer_phone}
          </p>
        </div>
      </td>

      <td className="px-4 py-3 align-top">
        <p className="text-sm text-ink-900 truncate max-w-[280px]">
          {request.service_name}
        </p>
      </td>

      <td className="px-4 py-3 align-top">
        <StatusPill tone={tone}>{label}</StatusPill>
        <p className="text-xs text-ink-400 mt-1">
          {formatRelative(request.created_at)}
        </p>
      </td>

      <td className="px-4 py-3 align-top text-right">
        <button
          type="button"
          onClick={openWhatsApp}
          aria-label="Contacter sur WhatsApp"
          title="WhatsApp"
          className="inline-flex items-center justify-center w-9 h-9 rounded-full text-[#25D366] hover:bg-[#25D366]/10 transition-colors"
        >
          <LuMessageCircle size={18} />
        </button>
      </td>
    </tr>
  )
}