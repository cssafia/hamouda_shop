// src/features/products/keys.js
export const productKeys = {
  all: ['products'],

  // Public
  publicList:   (filters = {}) => ['products', 'public', 'list', filters],
  publicDetail: (id)           => ['products', 'public', 'detail', id],

  // Admin
  adminList:    (filters = {}) => ['products', 'admin', 'list', filters],
  adminDetail:  (id)           => ['products', 'admin', 'detail', id],

  // Variants
  variants:     (productId)             => ['products', 'admin', productId, 'variants'],
  variant:      (productId, variantId)  => ['products', 'admin', productId, 'variants', variantId],
}