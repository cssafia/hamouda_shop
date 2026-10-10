// src/components/admin/MoreSheet.jsx
import { NavLink } from 'react-router-dom'
import Sheet from '../ui/Sheet'
import { NAV_GROUPS } from '../../constants/nav'

export default function MoreSheet({ open, onClose }) {
  return (
    <Sheet open={open} onClose={onClose} title="Menu">
      <div className="space-y-5 py-2">
        {NAV_GROUPS.map((group) => (
          <div key={group.label}>
            <p className="px-3 mb-2 text-xs font-semibold uppercase tracking-wide text-ink-400">
              {group.label}
            </p>
            <ul>
              {group.items.map((item) => (
                <li key={item.to}>
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      `flex items-center gap-3 px-3 py-3 rounded-control text-sm font-medium transition-colors ${
                        isActive
                          ? 'bg-brand-50 text-brand-600'
                          : 'text-ink-700 hover:bg-surface-subtle'
                      }`
                    }
                  >
                    <item.icon size={18} />
                    <span>{item.label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </Sheet>
  )
}