// src/components/admin/analytics/OrdersStatusChart.jsx
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid,
} from 'recharts'
import { CHART_COLORS, AXIS_STYLE, GRID_PROPS } from './chartTheme'
import ChartTooltip from './ChartTooltip'
import { formatChartDate } from '../../../utils/analytics'

const SERIES = [
  { key: 'pending',   label: 'En attente', color: CHART_COLORS.pending },
  { key: 'confirmed', label: 'Confirmées', color: CHART_COLORS.confirmed },
  { key: 'shipped',   label: 'Expédiées',  color: CHART_COLORS.shipped },
  { key: 'completed', label: 'Livrées',    color: CHART_COLORS.completed },
  { key: 'cancelled', label: 'Annulées',   color: CHART_COLORS.cancelled },
]

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null
  return (
    <ChartTooltip>
      <p className="font-medium text-ink-900 mb-1">{label}</p>
      {payload.map((p) => (
        <p key={p.dataKey} className="flex items-center gap-2">
          <span
            className="w-2 h-2 rounded-full"
            style={{ background: p.color }}
          />
          <span className="text-ink-600">{p.name} :</span>
          <span className="font-medium text-ink-900">{p.value}</span>
        </p>
      ))}
    </ChartTooltip>
  )
}

export default function OrdersStatusChart({ data, isLoading }) {
  const points = data?.points ?? []
  const totals = data?.totals

  return (
    <section className="card p-5">
      <div className="flex items-center justify-between gap-3 mb-5">
        <h2 className="font-medium text-ink-900">Commandes par statut</h2>
        {totals && (
          <span className="text-xs text-ink-600">
            {totals.total} au total
          </span>
        )}
      </div>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-sm text-ink-400">
          Chargement…
        </div>
      ) : points.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-ink-400">
          Pas de commandes sur cette période.
        </div>
      ) : (
        <div className="h-48 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={points} margin={{ top: 4, right: 8, bottom: 0, left: 8 }}>
              <CartesianGrid {...GRID_PROPS} />
              <XAxis
                dataKey="date"
                {...AXIS_STYLE}
                tickFormatter={(v) => formatChartDate(v, data?.group)}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis {...AXIS_STYLE} width={32} allowDecimals={false} />
              <Tooltip content={<TooltipContent />} cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }} />
              {SERIES.map((s, i) => (
                <Bar
                  key={s.key}
                  dataKey={s.key}
                  stackId="orders"
                  fill={s.color}
                  name={s.label}
                  radius={i === SERIES.length - 1 ? [4, 4, 0, 0] : 0}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}

      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs">
        {SERIES.map((s) => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span
              aria-hidden
              className="w-3 h-3 rounded-full"
              style={{ background: s.color }}
            />
            <span className="text-ink-600">{s.label}</span>
          </span>
        ))}
      </div>
    </section>
  )
}