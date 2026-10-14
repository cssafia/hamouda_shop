// src/constants/coupons.js

export const COUPON_SCOPES = [
  { value: 'all',        label: 'Tout',        hint: 'Sur le panier entier' },
  { value: 'products',   label: 'Produits',    hint: 'Sur des produits choisis' },
  { value: 'categories', label: 'Catégories',  hint: 'Sur des catégories choisies' },
]

export const DISCOUNT_TYPES = [
  { value: 'percentage', label: 'Pourcentage' },
  { value: 'fixed',      label: 'Montant fixe' },
]

export const COUPON_STATE_LABELS = {
  active:    'Active',
  scheduled: 'Programmée',
  expired:   'Expirée',
  disabled:  'Désactivée',
  used_up:   'Épuisée',
}

export const COUPON_STATE_TONES = {
  active:    'success',
  scheduled: 'info',
  expired:   'warning',
  disabled:  'neutral',
  used_up:   'danger',
}

export function deriveCouponState(coupon) {
  if (!coupon) return 'disabled'
  const now = Date.now()

  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
    return 'used_up'
  }
  if (coupon.expires_at && new Date(coupon.expires_at).getTime() < now) {
    return 'expired'
  }
  if (coupon.is_active === false) {
    return 'disabled'
  }
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return 'scheduled'
  }
  return 'active'
}

export function formatDiscount(type, value) {
  if (value == null || value === '') return '—'
  return type === 'percentage' ? `−${value} %` : `−${value} DA`
}

export function formatScopeLabel(scope, count) {
  if (scope === 'all') return 'Tout'
  if (scope === 'products') return `Produits (${count ?? 0})`
  if (scope === 'categories') return `Catégories (${count ?? 0})`
  return '—'
}