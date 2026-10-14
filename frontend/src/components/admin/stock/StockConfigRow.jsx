// src/components/admin/stock/StockConfigRow.jsx
import { LuPencil, LuCog, LuPackage } from 'react-icons/lu'
import StatusPill from '../../ui/StatusPill'

const STATUS_TONE = { out: 'danger', low: 'warning' }
const STATUS_LABEL = { out: 'Rupture', low: 'Bas' }

function computeStatus(stock, threshold) {
  const n = Number(stock ?? 0)
  if (n === 0) return 'out'
  if (threshold != null && n <= threshold) return 'low'
  return null
}

export default function StockConfigRow({
  product,
  variant,
  stock,
  threshold,
  onAdjust,
  onEditThreshold,
}) {
  const isBase = !variant
  const status = computeStatus(stock, threshold)
  const hasThreshold = threshold != null

  return (
    <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 py-3 px-3 sm:px-4 rounded-control hover:bg-surface-subtle/60 transition-colors">
      {/* Name */}
      <div className="flex items-center gap-2.5 flex-1 min-w-0">
        <span
          aria-hidden
          className="shrink-0 w-6 h-6 flex items-center justify-center text-ink-400"
        >
          {isBase ? <LuCog size={15} /> : <LuPackage size={15} />}
        </span>
        <span className={`truncate ${isBase ? 'text-sm font-medium text-ink-700' : 'text-sm text-ink-900'}`}>
          {isBase ? 'Configuration de base' : variant.name}
        </span>
      </div>

      {/* Stock + threshold */}
      <div className="flex items-center gap-3 sm:gap-4 flex-wrap">
        <span className="text-sm font-semibold text-ink-900 tabular-nums w-14 text-right">
          {stock ?? 0}
        </span>

        {/* Always rendered — falls back to "Définir le seuil" */}
        <button
          type="button"
          onClick={() => onEditThreshold({ product, variant })}
          className={`inline-flex items-center gap-1 text-xs transition-colors whitespace-nowrap ${
            hasThreshold
              ? 'text-ink-400 hover:text-brand-600'
              : 'text-brand-600 hover:text-brand-700 font-medium'
          }`}
          title={hasThreshold ? 'Modifier le seuil' : 'Définir un seuil'}
        >
          {hasThreshold ? `seuil ${threshold}` : 'Définir le seuil'}
          <LuPencil size={11} />
        </button>

        <span className="w-20">
          {status && (
            <StatusPill tone={STATUS_TONE[status]}>
              {STATUS_LABEL[status]}
            </StatusPill>
          )}
        </span>

        <button
          type="button"
          onClick={() => onAdjust({ product, variant })}
          className="btn-secondary px-3 py-1.5 text-xs whitespace-nowrap"
        >
          Ajuster
        </button>
      </div>
    </div>
  )
}