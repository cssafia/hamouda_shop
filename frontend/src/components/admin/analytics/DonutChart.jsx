// src/components/admin/analytics/DonutChart.jsx
import { useMemo } from 'react'
import {
  ResponsiveContainer, PieChart, Pie, Cell, Tooltip,
} from 'recharts'
import ChartTooltip from './ChartTooltip'
import { formatCurrency } from '../../../utils/format'

const PALETTES = {
  brand: [
    '#1e3a8a', '#1d4ed8', '#2563eb', '#3b82f6',
    '#60a5fa', '#93c5fd', '#bfdbfe', '#dbeafe',
  ],
  violet: [
    '#4c1d95', '#5b21b6', '#6d28d9', '#7c3aed',
    '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe',
  ],
  teal: [
    '#134e4a', '#0d9488', '#14b8a6', '#2dd4bf',
    '#5eead4', '#99f6e4', '#ccfbf1', '#f0fdfa',
  ],
}

const MAX_SLICES = 6

export default function DonutChart({
  title,
  items = [],
  nameKey = 'name',
  valueKey = 'value',
  total,
  isLoading,
  tone = 'brand',
  colors,                    // optional: array of hex, or 'auto' to use item.color
  valueFormat = 'currency',  // 'currency' | 'count'
  emptyLabel = 'Pas de données sur cette période.',
}) {
  const palette = PALETTES[tone] ?? PALETTES.brand

  const { chartData, sum } = useMemo(() => {
    const normalized = items
      .map((i) => ({
        name: i[nameKey] ?? '—',
        value: Number(i[valueKey] ?? 0),
        color: i.color,
      }))
      .filter((i) => i.value > 0)
      .sort((a, b) => b.value - a.value)

    let data
    if (colors === 'auto' || Array.isArray(colors)) {
      // preserve given order — no top/autres grouping
      data = normalized
    } else if (normalized.length <= MAX_SLICES) {
      data = normalized
    } else {
      const top = normalized.slice(0, MAX_SLICES - 1)
      const othersSum = normalized
        .slice(MAX_SLICES - 1)
        .reduce((s, i) => s + i.value, 0)
      data = [...top, { name: 'Autres', value: othersSum }]
    }

    return {
      chartData: data,
      sum: data.reduce((s, i) => s + i.value, 0),
    }
  }, [items, nameKey, valueKey, colors])

  const centerTotal = total ?? sum

  const formatValue = (v) => {
    if (v == null) return '—'
    if (valueFormat === 'count') return `${v}`
    return formatCurrency(v)
  }

  const colorFor = (entry, i) => {
    if (colors === 'auto') return entry.color ?? palette[i % palette.length]
    if (Array.isArray(colors)) return colors[i % colors.length] ?? palette[i % palette.length]
    return palette[i % palette.length]
  }

  const centerLabel = valueFormat === 'count' ? 'Total' : 'Total'

  return (
    <section className="card p-5">
      <h2 className="font-medium text-ink-900 mb-4">{title}</h2>

      {isLoading ? (
        <div className="h-48 flex items-center justify-center text-sm text-ink-400">
          Chargement…
        </div>
      ) : chartData.length === 0 ? (
        <div className="h-48 flex items-center justify-center text-sm text-ink-400">
          {emptyLabel}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-center">
          {/* Donut */}
          <div className="relative h-48 sm:h-52 mx-auto w-full max-w-[220px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={chartData}
                  dataKey="value"
                  innerRadius="62%"
                  outerRadius="92%"
                  paddingAngle={2}
                  stroke="none"
                  isAnimationActive={false}
                >
                  {chartData.map((entry, i) => (
                    <Cell key={i} fill={colorFor(entry, i)} />
                  ))}
                </Pie>
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload?.length) return null
                    const p = payload[0].payload
                    const pct =
                      sum > 0 ? ((p.value / sum) * 100).toFixed(1) : '0.0'
                    return (
                      <ChartTooltip>
                        <p className="font-medium text-ink-900">{p.name}</p>
                        <p className="text-ink-600 mt-0.5">
                          {formatValue(p.value)} · {pct}%
                        </p>
                      </ChartTooltip>
                    )
                  }}
                />
              </PieChart>
            </ResponsiveContainer>

            {/* Center label */}
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[10px] uppercase tracking-wide text-ink-400">
                {centerLabel}
              </span>
              <span className="text-sm sm:text-base font-semibold text-ink-900 tabular-nums">
                {formatValue(centerTotal)}
              </span>
            </div>
          </div>

          {/* Legend */}
          <ul className="space-y-2.5">
            {chartData.map((entry, i) => {
              const pct = sum > 0 ? (entry.value / sum) * 100 : 0
              return (
                <li
                  key={`${entry.name}-${i}`}
                  className="flex items-center gap-2.5 text-sm"
                >
                  <span
                    aria-hidden
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ background: colorFor(entry, i) }}
                  />
                  <span className="flex-1 truncate text-ink-700">
                    {entry.name}
                  </span>
                  <span className="font-medium text-ink-900 tabular-nums shrink-0">
                    {pct.toFixed(1)}%
                  </span>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </section>
  )
}