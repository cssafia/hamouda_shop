// src/utils/format.js

/* ---------- Currency ---------- */
export function formatCurrency(value) {
  if (value == null || value === '' || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('fr-DZ', {
    style: 'currency',
    currency: 'DZD',
    maximumFractionDigits: 0,
  }).format(Number(value))
}

/* ---------- Plain number ---------- */
export function formatNumber(value) {
  if (value == null || value === '' || Number.isNaN(Number(value))) return '—'
  return new Intl.NumberFormat('fr-DZ').format(Number(value))
}

/* ---------- Date ---------- */
export function formatDate(value, { withTime = false } = {}) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('fr-DZ', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...(withTime && { hour: '2-digit', minute: '2-digit' }),
  })
}

/* ---------- Relative time ("il y a 3 jours") ---------- */
export function formatRelative(value) {
  if (!value) return '—'
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return '—'
  const diff = Math.round((Date.now() - d.getTime()) / 1000)
  const rtf = new Intl.RelativeTimeFormat('fr', { numeric: 'auto' })
  const units = [
    ['year',   60 * 60 * 24 * 365],
    ['month',  60 * 60 * 24 * 30],
    ['day',    60 * 60 * 24],
    ['hour',   60 * 60],
    ['minute', 60],
  ]
  for (const [unit, sec] of units) {
    if (Math.abs(diff) >= sec) return rtf.format(-Math.round(diff / sec), unit)
  }
  return rtf.format(-diff, 'second')
}

/* ---------- Percent off ---------- */
export function discountPercent(price, promo) {
  if (!price || !promo || promo >= price) return 0
  return Math.round(((price - promo) / price) * 100)
}