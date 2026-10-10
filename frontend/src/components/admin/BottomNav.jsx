// src/components/admin/BottomNav.jsx
import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { MOBILE_NAV } from '../../constants/nav'
import MoreSheet from './MoreSheet'

export default function BottomNav() {
  const [moreOpen, setMoreOpen] = useState(false)
  const { pathname } = useLocation()

  // Close the sheet any time the route changes
  useEffect(() => { setMoreOpen(false) }, [pathname])

  return (
    <>
      <nav className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-surface-border pb-[env(safe-area-inset-bottom)]">
        <ul className="grid grid-cols-5">
          {MOBILE_NAV.map((item) => (
            <li key={item.to}>
              <NavLink
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium transition-colors ${
                    isActive ? 'text-brand-600' : 'text-ink-600'
                  }`
                }
              >
                <item.icon size={20} />
                <span>{item.label}</span>
              </NavLink>
            </li>
          ))}
          <li>
            <button
              onClick={() => setMoreOpen(true)}
              className="w-full flex flex-col items-center justify-center gap-0.5 py-2 text-[11px] font-medium text-ink-600 hover:text-brand-600 transition-colors"
              aria-label="More"
            >
              <MoreHorizontal size={20} />
              <span>More</span>
            </button>
          </li>
        </ul>
      </nav>

      <MoreSheet open={moreOpen} onClose={() => setMoreOpen(false)} />
    </>
  )
}