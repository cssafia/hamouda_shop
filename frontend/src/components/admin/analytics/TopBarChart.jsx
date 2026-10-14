// src/components/admin/analytics/TopBarChart.jsx
import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip,
} from 'recharts'
import ChartTooltip from './ChartTooltip'

/* Gradient pairs per tone */
const GRADIENTS = {
  brand:  { from: '#1d4ed8', to: '#60a5fa' },
  violet: { from: '#6d28d9', to: '#a78bfa' },
  teal:   { from: '#0d9488', to: '#5eead4' },
  success:{ from: '#16a34a', to: '#86efac' },
  warning:{ from: '#d97706', to: '#fbbf24' },
}

export default function TopBarChart({
  title,
  subtitle,
  items = [],
  dataKey = 'orders_count',
  labelKey = 'name',
  tone = 'brand',                 // brand | violet | teal | success | warning
  isLoading,
  emptyLabel = 'Pas de données sur cette période.',
  onItemClick,
  wilayaNames = {},
}) {
  const navigate = useNavigate()
  const gradient = GRADIENTS[tone] ?? GRADIENTS.brand
  const gradId = `topGrad-${tone}`

  const chartData = useMemo(() => {
    return items.map((it) => {
      const rawLabel = it[labelKey]
      const display =
        labelKey === 'wilaya' ? wilayaNames[rawLabel] || rawLabel : rawLabel
      return { ...it, _label: display, _value: Number(it[dataKey] ?? 0) }
    })
  }, [items, labelKey, dataKey, wilayaNames])

  const maxValue = useMemo(
    () => Math.max(1, ...chartData.map((d) => d._value)),
    [chartData]
  )

  const handleClick = (entry) => {
    const it = entry?.payload ?? entry
    if (!it) return
    if (onItemClick) onItemClick(it)
    else if (it.product_id) navigate(`/admin/products/${it.product_id}`)
  }

  return (
    <section className="card p-5">
      <div className="mb-4">
        <h2 className="font-medium text-ink-900">{title}</h2>
        {subtitle && <p className="text-xs text-ink-600 mt-0.5">{subtitle}</p>}
      </div>

      {isLoading ? (
        <div className="h-40 flex items-center justify-center text-sm text-ink-400">
          Chargement…
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-40 flex items-center justify-center text-sm text-ink-400">
          {emptyLabel}
        </div>
      ) : (
        <div
          style={{ height: `${Math.max(chartData.length, 3) * 44}px` }}
          className="-mx-2"
        >
          <ResponsiveContainer width="100%" height="100%">
            <BarChart
              layout="vertical"
              data={chartData}
              margin={{ top: 4, right: 48, bottom: 4, left: 4 }}
              barCategoryGap="22%"
            >
              <defs>
                <linearGradient id={gradId} x1="0" y1="0" x2="1" y2="0">
                  <stop offset="0%"  stopColor={gradient.from} />
                  <stop offset="100%" stopColor={gradient.to} />
                </linearGradient>
              </defs>

              <XAxis type="number" hide domain={[0, maxValue]} />
              <YAxis
                type="category"
                dataKey="_label"
                axisLine={false}
                tickLine={false}
                width={110}
                tick={{ fill: '#0f172a', fontSize: 12 }}
              />

              <Tooltip
                cursor={{ fill: 'rgba(148, 163, 184, 0.08)' }}
                content={({ active, payload }) => {
                  if (!active || !payload?.length) return null
                  const p = payload[0].payload
                  return (
                    <ChartTooltip>
                      <p className="font-medium text-ink-900">{p._label}</p>
                      <p className="text-ink-600 mt-0.5">
                        {p._value} commande{p._value > 1 ? 's' : ''}
                      </p>
                    </ChartTooltip>
                  )
                }}
              />

              <Bar
                dataKey="_value"
                fill={`url(#${gradId})`}
                radius={[6, 6, 6, 6]}
                onClick={handleClick}
                cursor={
                  onItemClick || items.some((i) => i.product_id)
                    ? 'pointer'
                    : 'default'
                }
                label={{
                  position: 'right',
                  formatter: (v) => v,
                  fill: '#0f172a',
                  fontSize: 12,
                  fontWeight: 600,
                }}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      )}
    </section>
  )
}