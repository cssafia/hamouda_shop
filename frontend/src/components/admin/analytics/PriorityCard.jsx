// src/components/admin/analytics/PriorityCard.jsx
import { Link } from 'react-router-dom'
import { LuArrowRight } from 'react-icons/lu'

const TONE = {
  warning: {
    border: 'border-l-warning',
    wrap:   'bg-warning/10 text-warning',
    count:  'text-warning',
  },
  brand: {
    border: 'border-l-brand-500',
    wrap:   'bg-brand-50 text-brand-600',
    count:  'text-brand-600',
  },
  danger: {
    border: 'border-l-danger',
    wrap:   'bg-danger/10 text-danger',
    count:  'text-danger',
  },
  dark: {
    border: 'border-l-brand-700',
    wrap:   'bg-brand-50 text-brand-700',
    count:  'text-brand-700',
  },
}

export default function PriorityCard({
  icon: Icon,
  count,
  label,
  tone = 'brand',
  to,
}) {
  const t = TONE[tone] ?? TONE.brand
  return (
    <Link
      to={to}
      className={`card flex items-center gap-3 p-4 border-l-[3px] ${t.border} hover:shadow-card transition-shadow`}
    >
      <span
        className={`shrink-0 w-10 h-10 rounded-control flex items-center justify-center ${t.wrap}`}
      >
        {Icon && <Icon size={18} />}
      </span>
      <div className="flex-1 min-w-0">
        <p className={`text-xl font-semibold tabular-nums ${t.count}`}>{count}</p>
        <p className="text-xs text-ink-600 mt-0.5 truncate">{label}</p>
      </div>
      <LuArrowRight size={16} className="text-ink-400 shrink-0" />
    </Link>
  )
}