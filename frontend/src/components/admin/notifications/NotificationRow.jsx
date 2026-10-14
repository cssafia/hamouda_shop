// src/components/admin/notifications/NotificationRow.jsx
import { TYPE_META, NOTIFICATION_NAV, timeAgo } from './notificationMeta.js'

export default function NotificationRow({ n, onClick }) {
  const meta = TYPE_META[n.type] ?? TYPE_META.new_order
  const { Icon } = meta
  const clickable = Boolean(NOTIFICATION_NAV[n.related_type])

  return (
    <button
      type="button"
      onClick={onClick}
      className={`w-full flex items-start gap-3 px-4 py-3 text-left border-b border-surface-border last:border-0 transition-colors ${
        !n.is_read
          ? 'bg-brand-50/40 hover:bg-brand-50/60'
          : 'hover:bg-surface-subtle'
      } ${clickable ? '' : 'cursor-default'}`}
    >
      <span
        className={`shrink-0 w-8 h-8 rounded-full flex items-center justify-center mt-0.5 ${meta.cls}`}
      >
        <Icon size={15} />
      </span>

      <div className="flex-1 min-w-0">
        <div className="flex items-baseline gap-2">
          <p
            className={`text-sm truncate ${
              !n.is_read ? 'font-semibold text-ink-900' : 'font-medium text-ink-900'
            }`}
          >
            {n.title}
          </p>
          {!n.is_read && (
            <span
              aria-hidden
              className="shrink-0 w-1.5 h-1.5 rounded-full bg-brand-500"
            />
          )}
          <span className="ml-auto shrink-0 text-[11px] text-ink-400">
            {timeAgo(n.created_at)}
          </span>
        </div>

        {n.message && (
          <p className="text-xs text-ink-600 line-clamp-2 mt-0.5">
            {n.message}
          </p>
        )}
      </div>
    </button>
  )
}