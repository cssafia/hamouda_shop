// src/constants/product.js

/* Multi-select — used on physical products */
export const USAGES = [
  { key: 'gaming',         label: 'Gaming' },
  { key: 'programming',    label: 'Programming' },
  { key: 'web_dev',        label: 'Web Development' },
  { key: 'studies',        label: 'Studies' },
  { key: 'architecture',   label: 'Architecture' },
  { key: 'graphic_design', label: 'Graphic Design' },
  { key: 'video_editing',  label: 'Video Editing' },
  { key: 'professional',   label: 'Professional Use' },
  { key: 'daily',          label: 'Daily Use' },
]

export function usageLabel(key) {
  return USAGES.find((u) => u.key === key)?.label ?? key
}

/* Condition — refurbished grading */
export const CONDITIONS = [
  '10/10',
  '9/10',
  '8/10',
  '7/10',
  '6/10',
  '5/10',
]

/* Listing sort options (matches backend `sort` enum) */
export const PRODUCT_SORT_OPTIONS = [
  { value: 'newest',     label: 'Newest' },
  { value: 'name',       label: 'Name (A–Z)' },
  { value: 'price_asc',  label: 'Price ↑' },
  { value: 'price_desc', label: 'Price ↓' },
  { value: 'stock_asc',  label: 'Stock ↑' },
  { value: 'stock_desc', label: 'Stock ↓' },
]

/* Product type filter */
export const PRODUCT_TYPES = [
  { value: '',         label: 'All types' },
  { value: 'physical', label: 'Physical' },
  { value: 'digital',  label: 'Digital' },
]

/* Status filter */
export const PRODUCT_STATUSES = [
  { value: '',      label: 'All status' },
  { value: 'true',  label: 'Active' },
  { value: 'false', label: 'Inactive' },
]
export const DURATIONS = [
  '1 month',
  '3 months',
  '6 months',
  '12 months',
]

export const VERSIONS = [
  'Basic',
  'Plus',
  'Pro',
  'Enterprise',
]

export const SORT_OPTIONS = [
  { value: 'newest', label: 'Plus récents' },
  { value: 'price_asc', label: 'Prix croissant' },
  { value: 'price_desc', label: 'Prix décroissant' },
  { value: 'name_asc', label: 'Nom A-Z' },
  { value: 'name_desc', label: 'Nom Z-A' },
];

export const BUDGET_PRESETS = [
  { label: 'Moins de 50 000 DA', price_max: 50000 },
  { label: '50 000 – 100 000 DA', price_min: 50000, price_max: 100000 },
  { label: '100 000 – 200 000 DA', price_min: 100000, price_max: 200000 },
  { label: 'Plus de 200 000 DA', price_min: 200000 },
];