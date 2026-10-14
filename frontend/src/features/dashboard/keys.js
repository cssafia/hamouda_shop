// src/features/dashboard/keys.js
export const dashboardKeys = {
  all: ['dashboard'],
  priority: () => ['dashboard', 'priority'],
  today:    () => ['dashboard', 'today'],
  revenue:  (params) => ['dashboard', 'revenue', params],
}