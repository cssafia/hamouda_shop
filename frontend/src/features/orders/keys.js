// src/features/orders/keys.js
export const orderKeys = {
  all: ['orders'],
  adminList:   (filters = {}) => ['orders', 'admin', 'list', filters],
  adminDetail: (id)           => ['orders', 'admin', 'detail', id],
}