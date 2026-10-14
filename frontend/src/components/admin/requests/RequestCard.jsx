// src/components/admin/requests/RequestCard.jsx
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

export default function RequestCard({ request }) {
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
    <li className="card overflow-hidden">
      <div className="p-3.5 flex items-start gap-3">
        <button
          type="button"
          onClick={() => navigate(`/admin/requests/${request.id}`)}
          className="flex-1 min-w-0 text-left"
        >
          <div className="flex items-start justify-between gap-2">
            <p className="text-sm font-medium text-ink-900 truncate">
              {request.customer_name}
            </p>
            <StatusPill tone={tone}>{label}</StatusPill>
          </div>

          <p className="text-xs text-ink-600 font-mono mt-0.5">
            {request.customer_phone}
          </p>

          <p className="text-sm text-ink-900 mt-2 line-clamp-2">
            {request.service_name}
          </p>
          <p className="text-xs text-ink-400 mt-1">
            {formatRelative(request.created_at)}
          </p>
        </button>

        <button
          type="button"
          onClick={openWhatsApp}
          aria-label="Contacter sur WhatsApp"
          title="WhatsApp"
          className="shrink-0 w-10 h-10 rounded-full text-[#25D366] hover:bg-[#25D366]/10 flex items-center justify-center transition-colors"
        >
          <LuMessageCircle size={18} />
        </button>
      </div>
    </li>
  )
}