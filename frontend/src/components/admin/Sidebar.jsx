// src/components/admin/Sidebar.jsx
import { NavLink } from 'react-router-dom'
import { SHOP_NAME } from '../../constants/config'
import { NAV_GROUPS } from '../../constants/nav'
import Badge from '../ui/Badge'

export default function Sidebar() {
  return (
    <aside className="hidden lg:flex fixed inset-y-0 left-0 w-64 flex-col border-r border-surface-border bg-white z-30">
      {/* Brand */}
      <div className="h-14 flex items-center px-5 border-b border-surface-border">
        <span className="text-lg font-semibold text-ink-900">{SHOP_NAME}</span>
      </div>

      {/* Groups */}
      <nav className="flex-1 overflow-y-auto px-3 py-3 space-y-3">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {group.label}
            </p>
            <ul className="space-y-0.5">
              {group.items.map((item) => (
                <li key={item.to}>
                  <SidebarItem item={item} />
                </li>
              ))}
            </ul>
          </div>
        ))}
      </nav>
    </aside>
  )
}

function SidebarItem({ item }) {
  const { to, label, icon: Icon, end } = item
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        `flex items-center gap-3 px-3 py-2 rounded-control text-sm font-medium transition-colors ${
          isActive
            ? 'bg-brand-50 text-brand-600'
            : 'text-ink-600 hover:bg-surface-subtle hover:text-ink-900'
        }`
      }
    >
      <Icon size={18} strokeWidth={2} />
      <span className="flex-1">{label}</span>
      {/* badge placeholder — wire when counts are available */}
      <Badge>{null}</Badge>
    </NavLink>
  )
}