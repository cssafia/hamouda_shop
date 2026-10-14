// src/pages/client/PlanCard.jsx
import { formatCurrency } from '../../utils/format.js'

export default function PlanCard({ plan, selected, isBest, savings, onSelect }) {
  const hasPromo =
    plan.promotional_price != null && plan.promotional_price < plan.price

  return (
    <button
      type="button"
      onClick={onSelect}
      aria-pressed={selected}
      className={`relative rounded-control border p-3 text-left transition-colors ${
        selected
          ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500/20'
          : 'border-surface-border bg-white hover:border-brand-500'
      }`}
    >
      {isBest && (
        <span className="absolute -top-2 left-3 text-[10px] font-semibold bg-success text-white px-2 py-0.5 rounded-full">
          Meilleure offre
        </span>
      )}

      <p className="text-sm font-semibold text-ink-900">{plan.label}</p>

      <div className="mt-1.5 flex items-baseline gap-1.5 flex-wrap">
        <span className="text-base font-semibold text-ink-900">
          {formatCurrency(plan.finalPrice)}
        </span>
        {hasPromo && (
          <span className="text-xs text-ink-400 line-through">
            {formatCurrency(plan.price)}
          </span>
        )}
      </div>

      {plan.perMonth != null && (
        <p className="text-[11px] text-ink-500 mt-0.5">
          ≈ {formatCurrency(plan.perMonth)} / mois
        </p>
      )}

      {savings > 0 && (
        <p className="text-[11px] font-medium text-success mt-1">
          Économise {formatCurrency(savings)}
        </p>
      )}
    </button>
  )
}