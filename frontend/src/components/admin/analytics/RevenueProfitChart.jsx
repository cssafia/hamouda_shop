// src/components/admin/analytics/RevenueProfitChart.jsx
import {
  ResponsiveContainer, ComposedChart, Area, Line, XAxis, YAxis,
  Tooltip, CartesianGrid, Legend,
} from 'recharts'
import { CHART_COLORS, AXIS_STYLE, GRID_PROPS } from './chartTheme'
import ChartTooltip from './ChartTooltip'
import { formatCurrency } from '../../../utils/format'
import { formatChartDate } from '../../../utils/analytics'

function TooltipContent({ active, payload, label }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  const margin = p.revenue > 0 ? ((p.profit / p.revenue) * 100).toFixed(1) : '0'
  return (
    <ChartTooltip>
      <p className="font-medium text-ink-900 mb-1">{label}</p>
      <p className="text-brand-600">
        CA : {formatCurrency(p.revenue)}
      </p>
      <p className="text-success">
        Marge : {formatCurrency(p.profit)} · {margin}%
      </p>
      <p className="text-[11px] text-ink-400 mt-1">
        {p.orders_count} commande{p.orders_count > 1 ? 's' : ''}
      </p>
    </ChartTooltip>
  )
}

export default function RevenueProfitChart({ data, isLoading }) {
  const points = data?.points ?? []
  const totals = data?.totals

  return (
    <section className="card p-5">
      <h2 className="font-medium text-ink-900 mb-5">Chiffre d'affaires et marge</h2>

      {isLoading ? (
        <div className="h-56 flex items-center justify-center text-sm text-ink-400">
          Chargement…
        </div>
      ) : points.length === 0 ? (
        <div className="h-56 flex items-center justify-center text-sm text-ink-400">
          Pas de données sur cette période.
        </div>
      ) : (
        <div className="h-56 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart
              data={points}
              margin={{ top: 4, right: 8, bottom: 0, left: 8 }}
            >
              <defs>
                <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%"  stopColor={CHART_COLORS.revenue} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={CHART_COLORS.revenue} stopOpacity={0} />
                </linearGradient>
              </defs>

              <CartesianGrid {...GRID_PROPS} />
              <XAxis
                dataKey="date"
                {...AXIS_STYLE}
                tickFormatter={(v) => formatChartDate(v, data?.group)}
                interval="preserveStartEnd"
                minTickGap={24}
              />
              <YAxis
                {...AXIS_STYLE}
                tickFormatter={(v) => (v >= 1000 ? `${Math.round(v / 1000)}k` : v)}
                width={40}
              />
              <Tooltip content={<TooltipContent />} />

              <Area
                type="monotone"
                dataKey="revenue"
                stroke={CHART_COLORS.revenue}
                strokeWidth={2}
                fill="url(#revenueFill)"
                name="Chiffre d'affaires"
                dot={false}
                activeDot={{ r: 4 }}
              />

              <Line
                type="monotone"
                dataKey="profit"
                stroke={CHART_COLORS.profit}
                strokeWidth={2}
                name="Marge"
                dot={false}
                activeDot={{ r: 4 }}
              />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      )}

      {totals && (
        <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs">
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="w-3 h-3 rounded-full"
              style={{ background: CHART_COLORS.revenue }}
            />
            <span className="text-ink-600">CA</span>
            <span className="font-medium text-ink-900 tabular-nums">
              {formatCurrency(totals.revenue)}
            </span>
          </span>
          <span className="flex items-center gap-2">
            <span
              aria-hidden
              className="w-3 h-3 rounded-full"
              style={{ background: CHART_COLORS.profit }}
            />
            <span className="text-ink-600">Marge</span>
            <span className="font-medium text-ink-900 tabular-nums">
              {formatCurrency(totals.profit)}
            </span>
            <span className="text-ink-400">({totals.margin_pct}%)</span>
          </span>
        </div>
      )}
    </section>
  )
}