// src/features/stock/keys.js
export const stockKeys = {
  all: ['stock'],
  list:   (filters = {}) => ['stock', 'list', filters],
  detail: (productId)     => ['stock', 'detail', productId],
}