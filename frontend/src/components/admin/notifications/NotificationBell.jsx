// src/components/admin/notifications/NotificationBell.jsx
import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Bell } from 'lucide-react'

import EmptyState from '../../ui/EmptyState.jsx'
import NotificationRow from './NotificationRow.jsx'
import { NOTIFICATION_NAV } from './notificationMeta.js'
import {
  useAdminNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../../../features/notifications/useAdminNotifications.js'

const PAGE_SIZE = 10
const MAX_LIMIT = 50
const DESKTOP_MIN_WIDTH = 1024

export default function NotificationBell() {
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [limit, setLimit] = useState(PAGE_SIZE)

  const buttonRef = useRef(null)
  const panelRef = useRef(null)

  const { data: unread } = useUnreadCount()
  const { data, isLoading } = useAdminNotifications({ limit })
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const items = data?.items ?? data?.data ?? []
  const total = data?.meta?.total ?? items.length
  const hasMore = items.length < total && limit < MAX_LIMIT
  const unreadCount = unread?.count ?? 0

  /* Outside click + Escape closes the dropdown */
  useEffect(() => {
    if (!open) return
    function onPointer(e) {
      if (buttonRef.current?.contains(e.target)) return
      if (panelRef.current?.contains(e.target)) return
      setOpen(false)
    }
    function onKey(e) {
      if (e.key === 'Escape') setOpen(false)
    }
    document.addEventListener('mousedown', onPointer)
    document.addEventListener('touchstart', onPointer)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onPointer)
      document.removeEventListener('touchstart', onPointer)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  /* Reset "load more" when closing */
  useEffect(() => {
    if (!open) setLimit(PAGE_SIZE)
  }, [open])

  function handleBellClick() {
    if (window.innerWidth >= DESKTOP_MIN_WIDTH) {
      setOpen((v) => !v)
    } else {
      navigate('/admin/notifications')
    }
  }

  function handleRowClick(n) {
    if (!n.is_read) markRead.mutate(n.id)
    const build = NOTIFICATION_NAV[n.related_type]
    if (build) {
      setOpen(false)
      navigate(build(n.related_id))
    }
  }

  return (
    // 1. THE RELATIVE WRAPPER: Keeps the dropdown anchored to the bell
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={handleBellClick}
        aria-label={
          unreadCount > 0
            ? `Notifications, ${unreadCount} non lue${unreadCount > 1 ? 's' : ''}`
            : 'Notifications'
        }
        aria-expanded={open}
        className={`relative w-9 h-9 rounded-full flex items-center justify-center transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40 ${
          open
            ? 'bg-surface-subtle text-ink-900'
            : 'text-ink-600 hover:bg-surface-subtle hover:text-ink-900'
        }`}
      >
        <Bell size={18} />
        {unreadCount > 0 && (
          <span className="absolute top-0.5 right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-danger text-white text-[10px] font-semibold flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {open && (
        // 2. ABSOLUTE POSITIONING: Anchors below the bell, right-aligned
        <div
          ref={panelRef}
          role="dialog"
          aria-label="Notifications"
          className="
            hidden lg:flex flex-col
            absolute right-0 top-full mt-2 z-[100] bg-white border border-surface-border shadow-xl rounded-card overflow-hidden animate-fade-in
            lg:w-[380px] lg:max-h-[70vh]
          "
        >
          {/* Header */}
          <header className="flex items-center justify-between px-4 py-3 border-b border-surface-border shrink-0">
            <span className="text-sm font-semibold text-ink-900">
              Notifications
              {unreadCount > 0 && (
                <span className="ml-2 text-xs font-medium text-brand-600">
                  {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
                </span>
              )}
            </span>
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={() => markAll.mutate()}
                disabled={markAll.isPending}
                className="text-xs font-medium text-brand-600 hover:text-brand-700 disabled:opacity-50"
              >
                Tout marquer lu
              </button>
            )}
          </header>

          {/* List */}
          <div className="flex-1 overflow-y-auto">
            {isLoading && <LoadingRows />}

            {!isLoading && items.length === 0 && (
              <EmptyState
                icon={Bell}
                title="Aucune notification"
                description="Tout est calme pour l'instant."
              />
            )}

            {!isLoading &&
              items.map((n) => (
                <NotificationRow
                  key={n.id}
                  n={n}
                  onClick={() => handleRowClick(n)}
                />
              ))}
          </div>

          {/* Load more */}
          {hasMore && (
            <div className="shrink-0 border-t border-surface-border p-2">
              <button
                type="button"
                onClick={() =>
                  setLimit((l) => Math.min(l + PAGE_SIZE, MAX_LIMIT))
                }
                className="w-full py-2 text-xs font-medium text-brand-600 hover:bg-brand-50 rounded-control transition-colors"
              >
                Charger plus
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

function LoadingRows() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="flex items-start gap-3 animate-pulse">
          <div className="w-8 h-8 rounded-full bg-surface-subtle shrink-0" />
          <div className="flex-1 space-y-1.5">
            <div className="h-3 w-3/4 bg-surface-subtle rounded" />
            <div className="h-3 w-1/2 bg-surface-subtle rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}