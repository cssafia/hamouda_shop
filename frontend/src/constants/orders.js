// src/constants/orders.js

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'shipped',
  'returned',
  'completed',
  'cancelled',
]

export const ORDER_STATUS_LABELS = {
  pending:   'En attente',
  confirmed: 'Confirmée',
  shipped:   'Expédiée',
  returned:  'Retournée',
  completed: 'Livrée',
  cancelled: 'Annulée',
}

export const ORDER_STATUS_TONES = {
  pending:   'warning',
  confirmed: 'info',
  shipped:   'info',
  returned:  'danger',
  completed: 'success',
  cancelled: 'neutral',
}

/* Left accent border per row — literal strings so Tailwind picks them up */
export const ORDER_STATUS_BORDER = {
  pending:   'border-l-warning',
  confirmed: 'border-l-brand-500',
  shipped:   'border-l-brand-700',
  returned:  'border-l-danger',
  completed: 'border-l-success',
  cancelled: 'border-l-ink-400',
}

/* Section header colors when grouping */
export const ORDER_STATUS_SECTION_TONE = {
  pending:   'text-warning',
  confirmed: 'text-brand-600',
  shipped:   'text-brand-700',
  returned:  'text-danger',
  completed: 'text-success',
  cancelled: 'text-ink-400',
}

/**
 * Valid next statuses per current status, per order type.
 * Used to derive the primary action button and the cancel option.
 */
export const STATUS_TRANSITIONS = {
  physical: {
    pending:   ['confirmed', 'cancelled'],
    confirmed: ['shipped', 'cancelled'],
    shipped:   ['completed', 'returned'],
    completed: [],
    cancelled: [],
    returned:  [],
  },
  digital: {
    pending:   ['completed', 'cancelled'],
    completed: [],
    cancelled: [],
    // digital never has these — included for safety
    confirmed: [],
    shipped:   [],
    returned:  [],
  },
}

export const CANCELLATION_REASONS = [
  { value: 'customer_unreachable', label: 'Client injoignable' },
  { value: 'out_of_stock',         label: 'Rupture de stock' },
  { value: 'customer_cancelled',   label: 'Client a annulé' },
  { value: 'order_error',          label: 'Erreur de commande' },
  { value: 'other',                label: 'Autre' },
]

export const COURIERS = [
  'Yalidine',
  'ZR Express',
  'Maystro',
  'Autre',
]

export const SHIPPING_STATUSES = [
  { value: 'pending',    label: 'En préparation' },
  { value: 'in_transit', label: 'En transit' },
  { value: 'delivered',  label: 'Livré' },
  { value: 'returned',   label: 'Retourné' },
]

/**
 * Returns the primary next-step for an order, or null for terminal states.
 * { label, next } or null
 */
export function getPrimaryAction(status, orderType) {
  const map = {
    pending:   {
      label: 'Confirmer',
      next:  orderType === 'digital' ? 'completed' : 'confirmed',
    },
    confirmed: { label: 'Marquer expédiée', next: 'shipped' },
    shipped:   { label: 'Marquer livrée',   next: 'completed' },
  }
  return map[status] ?? null
}