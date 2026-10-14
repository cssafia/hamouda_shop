// src/pages/Notifications/Notifications.jsx
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Bell, CheckCheck } from 'lucide-react'

import EmptyState from '../../../components/ui/EmptyState.jsx'
import Button from '../../../components/ui/Button.jsx'
import NotificationRow from '../../../components/admin/notifications/NotificationRow.jsx'
import { NOTIFICATION_NAV } from '../../../components/admin/notifications/notificationMeta.js'
import {
  useAdminNotifications,
  useUnreadCount,
  useMarkNotificationRead,
  useMarkAllNotificationsRead,
} from '../../../features/notifications/useAdminNotifications.js'

const PAGE_SIZE = 20
const MAX_LIMIT = 100

export default function Notifications() {
  const navigate = useNavigate()
  const [params, setParams] = useSearchParams()

  const unreadOnly = params.get('unread') === 'true'
  const limit = Math.min(Number(params.get('limit')) || PAGE_SIZE, MAX_LIMIT)

  const { data: unread } = useUnreadCount()
  const { data, isLoading } = useAdminNotifications({
    limit,
    ...(unreadOnly && { unread: true }),
  })
  const markRead = useMarkNotificationRead()
  const markAll = useMarkAllNotificationsRead()

  const items = data?.items ?? data?.data ?? []
  const total = data?.meta?.total ?? items.length
  const hasMore = items.length < total && limit < MAX_LIMIT
  const unreadCount = unread?.count ?? 0

  function setTab(nextUnreadOnly) {
    const next = new URLSearchParams(params)
    if (nextUnreadOnly) next.set('unread', 'true')
    else next.delete('unread')
    next.delete('limit')
    setParams(next, { replace: true })
  }

  function handleRowClick(n) {
    if (!n.is_read) markRead.mutate(n.id)
    const build = NOTIFICATION_NAV[n.related_type]
    if (build) navigate(build(n.related_id))
  }

  function loadMore() {
    const next = new URLSearchParams(params)
    next.set('limit', String(Math.min(limit + PAGE_SIZE, MAX_LIMIT)))
    setParams(next, { replace: true })
  }

  return (
    <div className="max-w-3xl mx-auto pb-24 lg:pb-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-4">
        <Link
          to="/admin/dashboard"
          className="w-9 h-9 -ml-1 rounded-full flex items-center justify-center text-ink-600 hover:bg-surface-subtle lg:hidden"
          aria-label="Retour"
        >
          <ArrowLeft size={18} />
        </Link>
        <h1 className="text-xl lg:text-2xl font-semibold text-ink-900">
          Notifications
        </h1>
        {unreadCount > 0 && (
          <span className="text-sm text-ink-500">
            {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
          </span>
        )}
        <div className="ml-auto">
          {unreadCount > 0 && (
            <Button
              variant="secondary"
              onClick={() => markAll.mutate()}
              loading={markAll.isPending}
              className="text-xs"
            >
              <CheckCheck size={14} />
              <span className="hidden sm:inline">Tout marquer lu</span>
            </Button>
          )}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 p-1 rounded-control bg-surface-subtle w-fit mb-4">
        <TabButton active={!unreadOnly} onClick={() => setTab(false)}>
          Toutes
        </TabButton>
        <TabButton active={unreadOnly} onClick={() => setTab(true)}>
          Non lues
          {unreadCount > 0 && (
            <span className="ml-1.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full bg-brand-500 text-white">
              {unreadCount}
            </span>
          )}
        </TabButton>
      </div>

      {/* List */}
      <div className="card overflow-hidden">
        {isLoading && <LoadingRows />}

        {!isLoading && items.length === 0 && (
          <EmptyState
            icon={Bell}
            title={unreadOnly ? 'Tout est à jour' : 'Aucune notification'}
            description={
              unreadOnly
                ? "Tu n'as aucune notification non lue."
                : 'Les nouvelles activités apparaîtront ici.'
            }
          />
        )}

        {!isLoading &&
          items.map((n) => (
            <NotificationRow key={n.id} n={n} onClick={() => handleRowClick(n)} />
          ))}
      </div>

      {/* Load more */}
      {hasMore && (
        <div className="mt-4 text-center">
          <Button variant="secondary" onClick={loadMore}>
            Charger plus
          </Button>
        </div>
      )}
    </div>
  )
}

function TabButton({ active, onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`px-3 py-1.5 rounded text-sm font-medium transition-colors ${
        active
          ? 'bg-white text-ink-900 shadow-sm'
          : 'text-ink-600 hover:text-ink-900'
      }`}
    >
      {children}
    </button>
  )
}

function LoadingRows() {
  return (
    <div className="p-4 space-y-3">
      {Array.from({ length: 5 }).map((_, i) => (
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