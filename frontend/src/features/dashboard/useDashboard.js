// src/features/dashboard/useDashboard.js
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { dashboardKeys } from './keys'
import * as api from './api'

/**
 * Priority counters — refreshed every 30 s.
 * { pending_orders, confirmed_orders, stock_issues, new_requests }
 */
export function useDashboardPriority() {
  return useQuery({
    queryKey: dashboardKeys.priority(),
    queryFn: api.getPriority,
    staleTime: 30_000,
    refetchInterval: 30_000,
  })
}

/**
 * Today vs yesterday metrics — refreshed every 60 s.
 * { today: {revenue, orders_count, profit, average_order_value},
 *   yesterday: {…} }
 */
export function useDashboardToday() {
  return useQuery({
    queryKey: dashboardKeys.today(),
    queryFn: api.getToday,
    staleTime: 60_000,
    refetchInterval: 60_000,
  })
}

/**
 * Revenue/profit chart data — refreshed every 5 min.
 * params: { period: '7d'|'30d'|'90d', metric: 'revenue'|'profit' }
 */
export function useDashboardRevenue({ period = '7d', metric = 'revenue' } = {}) {
  return useQuery({
    queryKey: dashboardKeys.revenue({ period, metric }),
    queryFn: () => api.getRevenue({ period, metric }),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
    refetchInterval: 5 * 60_000,
  })
}