// src/features/cart/keys.js
export const cartKeys = {
  all: ['cart'],
  detail: (couponCode) => ['cart', 'detail', { couponCode: couponCode ?? null }],
}