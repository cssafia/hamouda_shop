// src/components/admin/analytics/InsightBanner.jsx
import {
  LuTrendingUp, LuTrendingDown, LuMinus,
  LuTriangleAlert, LuSparkles,
} from 'react-icons/lu'

const REASON_LABELS = {
  customer_unreachable: 'client injoignable',
  out_of_stock:         'rupture de stock',
  customer_cancelled:   'client a annulé',
  order_error:          'erreur de commande',
  other:                'autre',
}

const TONE_CLASSES = {
  success: 'bg-success/10 text-success',
  danger:  'bg-danger/10 text-danger',
  warning: 'bg-warning/10 text-warning',
  brand:   'bg-brand-50 text-brand-600',
  neutral: 'bg-surface-subtle text-ink-600',
}

function buildInsights(summary, orders) {
  if (!summary || !orders?.totals) return []

  const lines = []
  const rev = summary.revenue?.delta
  const cancelRate = orders.totals.cancel_rate
  const topReason = orders.totals.top_cancel_reason
  const services = summary.services_completed

  /* --- Revenue trend --- */
  if (rev) {
    if (rev.pct == null && rev.direction === 'up' && rev.current > 0) {
      lines.push({
        icon: LuSparkles,
        tone: 'brand',
        text: `Premier chiffre d'affaires enregistré sur cette période.`,
      })
    } else if (rev.direction === 'up' && rev.pct >= 5) {
      lines.push({
        icon: LuTrendingUp,
        tone: 'success',
        text: `Chiffre d'affaires en hausse de ${rev.pct.toFixed(1)}% par rapport à la période précédente.`,
      })
    } else if (rev.direction === 'down' && Math.abs(rev.pct) >= 5) {
      lines.push({
        icon: LuTrendingDown,
        tone: 'danger',
        text: `Chiffre d'affaires en baisse de ${Math.abs(rev.pct).toFixed(1)}%.`,
      })
    } else if (rev.current > 0) {
      lines.push({
        icon: LuMinus,
        tone: 'neutral',
        text: `Chiffre d'affaires stable par rapport à la période précédente.`,
      })
    }
  }

  /* --- Cancel alert --- */
  if (cancelRate != null && cancelRate >= 8) {
    const reason = topReason
      ? ` — principalement : ${REASON_LABELS[topReason] || topReason}`
      : ''
    lines.push({
      icon: LuTriangleAlert,
      tone: 'warning',
      text: `${cancelRate}% de commandes annulées${reason}.`,
    })
  }

  /* --- Services highlight --- */
  if (services?.value > 0) {
    const d = services.delta
    if (d && d.pct != null && d.direction === 'up' && d.pct >= 20) {
      lines.push({
        icon: LuSparkles,
        tone: 'brand',
        text: `${services.value} services terminés (+${d.pct.toFixed(0)}% vs période préc.).`,
      })
    }
  }

  return lines
}

export default function InsightBanner({ summary, orders }) {
  const lines = buildInsights(summary, orders)
  if (lines.length === 0) return null

  return (
    <section className="card p-5">
      <ul className="space-y-3">
        {lines.map((line, i) => {
          const Icon = line.icon
          return (
            <li key={i} className="flex items-start gap-3">
              <span
                className={`shrink-0 w-7 h-7 rounded-full flex items-center justify-center ${TONE_CLASSES[line.tone]}`}
              >
                <Icon size={13} />
              </span>
              <p className="text-sm text-ink-700 leading-snug pt-1">
                {line.text}
              </p>
            </li>
          )
        })}
      </ul>
    </section>
  )
}