// src/features/notifications/keys.js
export const notificationKeys = {
  all: ['notifications'],
  adminList:        (filters = {}) => ['notifications', 'admin', 'list', filters],
  adminUnreadCount: ()             => ['notifications', 'admin', 'unread-count'],
}