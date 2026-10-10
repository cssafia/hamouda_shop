// src/features/notifications/api.js
import { apiClient } from '../../services/apiClient'

export async function listAdminNotifications(params = {}) {
  const { data } = await apiClient.get('/admin/notifications', { params })
  return { items: data.data, meta: data.meta }
}

export async function getUnreadCount() {
  const { data } = await apiClient.get('/admin/notifications/unread-count')
  return data.data.count
}

export async function markNotificationRead(id) {
  await apiClient.patch(`/admin/notifications/${id}/read`)
}

export async function markAllNotificationsRead() {
  await apiClient.patch('/admin/notifications/read-all')
}