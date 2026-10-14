// src/components/admin/TopBar.jsx
import { SHOP_NAME } from '../../constants/config'
import NotificationBell from '../../components/admin/notifications/NotificationBell'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-surface-border">
      <div className="flex items-center gap-3 h-14 px-4 lg:px-8">
        <span className="lg:hidden text-base font-semibold text-ink-900 truncate">
          {SHOP_NAME}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <NotificationBell />
          <div className="ml-2 w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center select-none">
            A
          </div>
        </div>
      </div>
    </header>
  )
}