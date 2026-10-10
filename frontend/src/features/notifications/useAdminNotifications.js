// src/features/notifications/useAdminNotifications.js
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { notificationKeys } from './keys'
import * as api from './api'

/* ---------- Queries ---------- */
export function useAdminNotifications(filters = {}) {
  return useQuery({
    queryKey: notificationKeys.adminList(filters),
    queryFn: () => api.listAdminNotifications(filters),
    staleTime: 0,
  })
}

/**
 * Unread count — poll every 60 s so the sidebar badge stays fresh.
 * Used by the TopBar bell icon and the sidebar "Orders" item.
 */
export function useUnreadCount() {
  return useQuery({
    queryKey: notificationKeys.adminUnreadCount(),
    queryFn: api.getUnreadCount,
    staleTime: 30_000,
    refetchInterval: 60_000,
  })
}

/* ---------- Mutations ---------- */
export function useMarkNotificationRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.markNotificationRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}

export function useMarkAllNotificationsRead() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: api.markAllNotificationsRead,
    onSuccess: () => qc.invalidateQueries({ queryKey: notificationKeys.all }),
  })
}