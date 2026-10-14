// src/components/admin/analytics/DashboardChart.jsx
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, Cell,
} from 'recharts'
import { CHART_COLORS, AXIS_STYLE, GRID_PROPS } from './chartTheme'
import ChartTooltip from './ChartTooltip'
import { formatCurrency } from '../../../utils/format'
import { formatDelta, formatChartDate } from '../../../utils/analytics'

const PERIODS = [
  { value: '7d',  label: '7 jours' },
  { value: '30d', label: '30 jours' },
  { value: '90d', label: '3 mois' },
]

const METRICS = [
  { value: 'revenue', label: 'CA' },
  { value: 'profit',  label: 'Marge' },
]

function TooltipContent({ active, payload }) {
  if (!active || !payload?.length) return null
  const p = payload[0].payload
  return (
    <ChartTooltip>
      <p className="font-medium text-ink-900">{formatCurrency(p.value)}</p>
      <p className="text-[11px] text-ink-600 mt-0.5">
        {p.orders_count} commande{p.orders_count > 1 ? 's' : ''}
      </p>
    </ChartTooltip>
  )
}

function TabGroup({ options, value, onChange }) {
  return (
    <div className="inline-flex rounded-control border border-surface-border p-0.5 bg-surface-subtle">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={`px-3 py-1 text-xs font-medium rounded-[8px] transition-colors ${
            value === o.value
              ? 'bg-white text-ink-900 shadow-sm'
              : 'text-ink-600 hover:text-ink-900'
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  )
}

export default function DashboardChart({
  data,
  period,
  metric,
  onPeriodChange,
  onMetricChange,
}) {
  const color =
    metric === 'profit' ? CHART_COLORS.profit : CHART_COLORS.revenue
  const colorLight =
    metric === 'profit' ? CHART_COLORS.profitLight : CHART_COLORS.revenueLight

  const points = data?.points ?? []
  const lastIdx = points.length - 1
  const delta = data?.delta ? formatDelta(data.delta) : null

  return (
    <section className="card p-5">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <h2 className="font-medium text-ink-900">Ventes</h2>
        <div className="flex gap-2 flex-wrap">
          <TabGroup options={PERIODS} value={period} onChange={onPeriodChange} />
          <TabGroup options={METRICS} value={metric} onChange={onMetricChange} />
        </div>
      </div>

      <div className="h-40 -mx-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={points} margin={{ top: 4, right: 4, bottom: 0, left: 4 }}>
            <defs>
              <linearGradient id="dashBarActive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor={color} stopOpacity={1} />
                <stop offset="100%" stopColor={color} stopOpacity={0.55} />
              </linearGradient>
              <linearGradient id="dashBarInactive" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%"  stopColor={colorLight} stopOpacity={1} />
                <stop offset="100%" stopColor={colorLight} stopOpacity={0.7} />
              </linearGradient>
            </defs>

            <CartesianGrid {...GRID_PROPS} />
            <XAxis
              dataKey="date"
              {...AXIS_STYLE}
              tickFormatter={(v) => formatChartDate(v, data?.group)}
              interval="preserveStartEnd"
            />
            <YAxis hide />
            <Tooltip
              content={<TooltipContent />}
              cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
            />
            <Bar dataKey="value" radius={[6, 6, 0, 0]}>
              {points.map((_, i) => (
                <Cell
                  key={i}
                  fill={i === lastIdx ? 'url(#dashBarActive)' : 'url(#dashBarInactive)'}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {data?.total != null && (
        <div className="mt-4 flex items-baseline gap-2 flex-wrap">
          <span className="text-lg font-semibold text-ink-900 tabular-nums">
            {formatCurrency(data.total)}
          </span>
          {delta && delta.tone !== 'neutral' && (
            <span
              className={`text-xs ${
                delta.tone === 'success' ? 'text-success' : 'text-danger'
              }`}
            >
              {delta.label}
            </span>
          )}
          <span className="text-xs text-ink-400">vs période précédente</span>
        </div>
      )}
    </section>
  )
}