// src/components/admin/TopBar.jsx
import { LuExternalLink } from 'react-icons/lu'
import { SHOP_NAME, STORE_URL } from '../../constants/config'
import NotificationBell from './notifications/NotificationBell'
import ProfileMenu from './ProfileMenu'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-surface-border">
      <div className="flex items-center gap-3 h-14 px-4 lg:px-8">
        <span className="lg:hidden text-base font-semibold text-ink-900 truncate">
          {SHOP_NAME}
        </span>

        <div className="ml-auto flex items-center gap-1">
          {/* Voir la boutique — opens the storefront in a new tab */}
          <a
            href={STORE_URL}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Voir la boutique"
            title="Voir la boutique"
            className="w-9 h-9 rounded-full text-ink-600 hover:bg-surface-subtle hover:text-ink-900 flex items-center justify-center transition-colors"
          >
            <LuExternalLink size={16} />
          </a>

          <NotificationBell />
          <ProfileMenu />
        </div>
      </div>
    </header>
  )
}