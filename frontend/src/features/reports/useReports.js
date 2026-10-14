// src/features/reports/useReports.js
import { useQuery, keepPreviousData } from '@tanstack/react-query'
import { reportKeys } from './keys'
import * as api from './api'

/**
 * All report hooks accept the same `range` object:
 *   { from: 'YYYY-MM-DD', to: 'YYYY-MM-DD', limit?: number }
 *
 * Reports refresh manually (no polling). Their data is historical.
 * Only invalidate when the user changes the range.
 */

export function useReportSummary(range) {
  return useQuery({
    queryKey: reportKeys.summary(range),
    queryFn: () => api.getSummary(range),
    enabled: !!(range?.from && range?.to),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })
}

export function useReportRevenue(range) {
  return useQuery({
    queryKey: reportKeys.revenue(range),
    queryFn: () => api.getRevenueReport(range),
    enabled: !!(range?.from && range?.to),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })
}

export function useReportOrders(range) {
  return useQuery({
    queryKey: reportKeys.orders(range),
    queryFn: () => api.getOrdersReport(range),
    enabled: !!(range?.from && range?.to),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })
}

export function useReportTopProducts(range) {
  return useQuery({
    queryKey: reportKeys.topProducts(range),
    queryFn: () => api.getTopProducts(range),
    enabled: !!(range?.from && range?.to),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })
}

export function useReportTopCategories(range) {
  return useQuery({
    queryKey: reportKeys.topCategories(range),
    queryFn: () => api.getTopCategories(range),
    enabled: !!(range?.from && range?.to),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })
}

export function useReportTopWilayas(range) {
  return useQuery({
    queryKey: reportKeys.topWilayas(range),
    queryFn: () => api.getTopWilayas(range),
    enabled: !!(range?.from && range?.to),
    placeholderData: keepPreviousData,
    staleTime: 5 * 60_000,
  })
}