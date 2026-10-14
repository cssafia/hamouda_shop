// src/features/reports/keys.js
export const reportKeys = {
  all: ['reports'],

  summary:        (range)             => ['reports', 'summary', range],
  revenue:        (range)             => ['reports', 'revenue', range],
  orders:         (range)             => ['reports', 'orders', range],
  topProducts:    (range)             => ['reports', 'top-products', range],
  topCategories:  (range)             => ['reports', 'top-categories', range],
  topWilayas:     (range)             => ['reports', 'top-wilayas', range],
}