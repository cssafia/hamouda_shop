// src/features/coupons/keys.js
export const couponKeys = {
  all: ['coupons'],
  adminList:   (filters = {}) => ['coupons', 'admin', 'list', filters],
  adminDetail: (id)           => ['coupons', 'admin', 'detail', id],
}