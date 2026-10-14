// src/utils/analytics.js

/* ---------- Date range presets ---------- */
function toISODate(date) {
  return date.toISOString().slice(0, 10)
}

export const RANGE_PRESETS = [
  { value: '7d',         label: '7 jours' },
  { value: '30d',        label: '30 jours' },
  { value: '90d',        label: '90 jours' },
  { value: 'month',      label: 'Ce mois' },
  { value: 'last_month', label: 'Mois dernier' },
]

export function rangeFromPreset(preset) {
  const today = new Date()
  const from = new Date()

  switch (preset) {
    case '7d':  from.setDate(from.getDate() - 6); break
    case '30d': from.setDate(from.getDate() - 29); break
    case '90d': from.setDate(from.getDate() - 89); break
    case 'month': from.setDate(1); break
    case 'last_month': {
      from.setMonth(from.getMonth() - 1, 1)
      const last = new Date()
      last.setDate(0)
      return { from: toISODate(from), to: toISODate(last) }
    }
    default: from.setDate(from.getDate() - 29)
  }

  return { from: toISODate(from), to: toISODate(today) }
}

/* ---------- Delta formatting ---------- */
export function formatDelta(delta) {
  if (!delta) return { label: '—', tone: 'neutral' }
  const { pct, direction } = delta
  if (pct == null) {
    return direction === 'up'
      ? { label: 'Nouveau', tone: 'success' }
      : { label: '—', tone: 'neutral' }
  }
  const arrow = direction === 'up' ? '↑' : direction === 'down' ? '↓' : '='
  const tone =
    direction === 'up'   ? 'success'
    : direction === 'down' ? 'danger'
    : 'neutral'
  return { label: `${arrow} ${Math.abs(pct).toFixed(1)}%`, tone }
}

/* ---------- Short date for chart axes ---------- */
export function formatChartDate(iso, group) {
  if (!iso) return ''
  if (group === 'month') return iso
  if (group === 'week') return iso.replace(/^(\d{4})-W/, 'S')
  const d = new Date(iso)
  return d.toLocaleDateString('fr-FR', { weekday: 'short' }).slice(0, 3)
}