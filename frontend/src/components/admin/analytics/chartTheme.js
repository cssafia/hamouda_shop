// src/components/admin/analytics/chartTheme.js
export const CHART_COLORS = {
  revenue:       '#2563eb', // brand-500
  revenueLight:  '#bfdbfe', // brand-200
  profit:        '#16a34a', // success
  profitLight:   '#bbf7d0',
  pending:       '#d97706', // warning
  confirmed:     '#2563eb',
  shipped:       '#1d4ed8',
  completed:     '#16a34a',
  cancelled:     '#94a3b8',
  returned:      '#64748b',
  grid:          '#e2e8f0',
  axis:          '#94a3b8',
}

export const AXIS_STYLE = {
  tick: { fill: '#94a3b8', fontSize: 11 },
  axisLine: false,
  tickLine: false,
}

export const GRID_PROPS = {
  strokeDasharray: '3 3',
  stroke: CHART_COLORS.grid,
  vertical: false,
}

