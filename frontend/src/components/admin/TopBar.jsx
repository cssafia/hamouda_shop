// src/components/admin/TopBar.jsx
import { Search, Bell } from 'lucide-react'
import { SHOP_NAME } from '../../constants/config'

export default function TopBar() {
  return (
    <header className="sticky top-0 z-20 bg-white/85 backdrop-blur border-b border-surface-border">
      <div className="flex items-center gap-3 h-14 px-4 lg:px-8">
        <span className="lg:hidden text-base font-semibold text-ink-900 truncate">
          {SHOP_NAME}
        </span>

        <div className="ml-auto flex items-center gap-1">
          <IconBtn aria-label="Search"><Search size={18} /></IconBtn>
          <IconBtn aria-label="Notifications"><Bell size={18} /></IconBtn>
          <div className="ml-2 w-8 h-8 rounded-full bg-brand-500 text-white text-xs font-semibold flex items-center justify-center select-none">
            {/* initials — wire to admin.name later */}
            A
          </div>
        </div>
      </div>
    </header>
  )
}

function IconBtn({ children, ...rest }) {
  return (
    <button
      className="w-9 h-9 rounded-full text-ink-600 hover:bg-surface-subtle hover:text-ink-900 flex items-center justify-center transition-colors"
      {...rest}
    >
      {children}
    </button>
  )
}