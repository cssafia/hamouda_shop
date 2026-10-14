// src/components/admin/orders/OrderTimeline.jsx
import { ORDER_STATUS_LABELS, CANCELLATION_REASONS } from '../../../constants/orders'
import { formatDate } from '../../../utils/format'

/**
 * Simple timeline built from the order's known timestamps.
 * We only have created_at + updated_at + cancellation from the API,
 * so we render two anchors and the cancellation if present.
 */
export default function OrderTimeline({ order }) {
  const entries = [
    { status: order.status, at: order.updated_at },
    { status: 'pending',    at: order.created_at },
  ]

  return (
    <section className="card overflow-hidden">
      <header className="px-5 py-3.5 border-b border-surface-border">
        <h2 className="font-medium text-ink-900">Historique</h2>
      </header>

      <div className="p-5">
        <ol className="relative space-y-5">
          {entries.map((e, i) => (
            <li key={i} className="relative pl-6">
              {/* Dot */}
              <span
                aria-hidden
                className={`absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full ${
                  i === 0 ? 'bg-brand-500 ring-4 ring-brand-500/15' : 'bg-surface-border'
                }`}
              />
              <p className="text-sm font-medium text-ink-900">
                {ORDER_STATUS_LABELS[e.status] ?? e.status}
              </p>
              <p className="text-xs text-ink-600 mt-0.5">{formatDate(e.at, { withTime: true })}</p>
            </li>
          ))}

          {/* Cancellation detail */}
          {order.cancellation && (
            <li className="relative pl-6">
              <span
                aria-hidden
                className="absolute left-0 top-1.5 w-2.5 h-2.5 rounded-full bg-danger ring-4 ring-danger/15"
              />
              <p className="text-sm font-medium text-danger">Annulée</p>
              <p className="text-xs text-ink-600 mt-0.5">
                {CANCELLATION_REASONS.find((r) => r.value === order.cancellation.reason)?.label
                  || order.cancellation.reason}
              </p>
              {order.cancellation.note && (
                <p className="text-xs text-ink-600 mt-1 italic">
                  « {order.cancellation.note} »
                </p>
              )}
            </li>
          )}
        </ol>
      </div>
    </section>
  )
}