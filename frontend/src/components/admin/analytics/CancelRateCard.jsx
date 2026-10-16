// src/components/admin/analytics/CancelRateCard.jsx
import { LuCircleX, LuCircleCheck } from 'react-icons/lu'

const REASON_LABELS = {
  customer_unreachable: 'Client injoignable',
  out_of_stock:         'Rupture de stock',
  customer_cancelled:   'Client a annulé',
  order_error:          'Erreur de commande',
  other:                'Autre',
}

export default function CancelRateCard({ data, isLoading }) {
  const totals = data?.totals
  const totalOrders = data?.total ?? 0
  const rate = totals?.cancel_rate
  const hasData = rate != null && totalOrders > 0

  const isBad = hasData && rate > 5
  const rateTone = !hasData
    ? 'text-ink-900'
    : rate > 10 ? 'text-danger'
    : rate > 5  ? 'text-warning'
    : 'text-ink-900'

  return (
    <section className="card p-5 flex flex-col">
      <div className="flex items-center gap-2 mb-4">
        <span
          className={`w-7 h-7 rounded-control flex items-center justify-center ${
            isBad ? 'bg-warning/10 text-warning' : 'bg-success/10 text-success'
          }`}
        >
          {isBad ? <LuCircleX size={14} /> : <LuCircleCheck size={14} />}
        </span>
        <h2 className="font-medium text-ink-900">Annulations</h2>
      </div>

      {isLoading ? (
        <div className="flex-1 flex items-center justify-center text-sm text-ink-400">
          Chargement…
        </div>
      ) : !hasData ? (
        <div className="flex-1 flex items-center justify-center text-sm text-ink-400">
          Pas de commandes sur cette période.
        </div>
      ) : (
        <div className="flex-1 flex flex-col">
          <p className={`text-4xl lg:text-5xl font-semibold tabular-nums ${rateTone}`}>
            {rate}%
          </p>
          <p className="text-sm text-ink-600 mt-2">
            {totals.cancelled} sur {totalOrders} commande
            {totalOrders > 1 ? 's' : ''}
          </p>

          {totals.top_cancel_reason && (
            <div className="mt-auto pt-4 border-t border-surface-border">
              <p className="text-xs text-ink-600">Raison principale</p>
              <p className="text-sm font-medium text-ink-900 mt-0.5">
                {REASON_LABELS[totals.top_cancel_reason] ||
                  totals.top_cancel_reason}
              </p>
            </div>
          )}
        </div>
      )}
    </section>
  )
}