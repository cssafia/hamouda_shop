// src/features/brands/keys.js
export const brandKeys = {
  all:        ['brands'],
  publicList: (categoryId) =>
    ['brands', 'public', 'list', { categoryId: categoryId ?? null }],
  adminList:  () => ['brands', 'admin', 'list'],
}