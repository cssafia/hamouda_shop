// src/components/admin/analytics/MetricCard.jsx
import { formatCurrency, formatNumber } from '../../../utils/format'
import { formatDelta } from '../../../utils/analytics'

const TONES = {
  brand:   { wrap: 'bg-brand-50 text-brand-600' },
  success: { wrap: 'bg-success/10 text-success' },
  warning: { wrap: 'bg-warning/10 text-warning' },
  danger:  { wrap: 'bg-danger/10 text-danger' },
  violet:  { wrap: 'bg-violet-50 text-violet-600' },
}

export default function MetricCard({
  icon: Icon,
  label,
  value,
  delta,
  tone = 'brand',
  format = 'currency',       
  variant = 'default',      
  deltaSuffix = 'vs hier',
  className = '',
}) {
  const { label: deltaLabel, tone: deltaTone } = formatDelta(delta)
  const formatted =
    value == null
      ? '—'
      : format === 'currency' ? formatCurrency(value) : formatNumber(value)

  const valueClass =
    variant === 'compact'
      ? 'text-lg font-semibold'
      : 'text-2xl font-semibold'

  const deltaClass =
    deltaTone === 'success' ? 'text-success'
    : deltaTone === 'danger'  ? 'text-danger'
    : 'text-ink-400'

  const t = TONES[tone] ?? TONES.brand

  return (
    <div className={`card p-4 ${className}`}>
      <div className="flex items-center gap-2.5 mb-3">
        {Icon && (
          <span className={`shrink-0 w-8 h-8 rounded-control flex items-center justify-center ${t.wrap}`}>
            <Icon size={15} />
          </span>
        )}
        <p className="text-xs text-ink-600 truncate">{label}</p>
      </div>

      <p className={`text-ink-900 tabular-nums ${valueClass}`}>{formatted}</p>

      {delta ? (
        <p className={`mt-1.5 text-xs ${deltaClass}`}>
          {deltaLabel}
          <span className="text-ink-400 ml-1.5">{deltaSuffix}</span>
        </p>
      ) : (
        <p className="mt-1.5 text-xs text-transparent select-none">—</p>
      )}
    </div>
  )
}