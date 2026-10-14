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

/* ---------- Phone for WhatsApp deep links ---------- */

export function formatPhoneForWhatsApp(phone) {
  if (!phone) return ''
  const digits = String(phone).replace(/\D/g, '')
  if (digits.startsWith('00213')) return digits.slice(2)
  if (digits.startsWith('213') && digits.length >= 12) return digits
  if (digits.startsWith('0') && digits.length === 10) return '213' + digits.slice(1)
  if (digits.length === 9) return '213' + digits
  return digits
}

/* ---------- Backend date-time formatting ---------- */
/**
 * Converts a date input value (YYYY-MM-DD) to the backend format
 * "YYYY-MM-DD HH:MM:SS".
 *   startOfDay  → "2026-10-10 00:00:00"
 *   endOfDay    → "2026-10-10 23:59:59"
 * Returns null when the input is empty.
 */
export function toBackendStartOfDay(dateStr) {
  if (!dateStr) return null
  return `${dateStr} 00:00:00`
}

export function toBackendEndOfDay(dateStr) {
  if (!dateStr) return null
  return `${dateStr} 23:59:59`
}

/**
 * Extracts the "YYYY-MM-DD" part from either backend format.
 * Works for "2026-10-10 00:00:00" AND "2026-10-10T00:00:00.000Z".
 */
export function toDateInputValue(dateStr) {
  if (!dateStr) return ''
  return String(dateStr).slice(0, 10)
}