// src/components/admin/catalog/CatalogRow.jsx
import { LuPencil } from 'react-icons/lu'
import StatusPill from '../../ui/StatusPill'

export default function CatalogRow({
  title,
  subtitle,
  badges = [],
  isActive,
  onToggle,
  onEdit,
  isToggling = false,
}) {
  return (
    <div className="p-4 flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4">
      {/* Left: identity */}
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-ink-900 truncate">{title}</p>

        {badges.length > 0 ? (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {badges.map((b) => (
              <span
                key={b}
                className="inline-flex items-center px-2 py-0.5 rounded-full bg-brand-50 text-brand-700 text-[11px] font-medium"
              >
                {b}
              </span>
            ))}
          </div>
        ) : subtitle ? (
          <p className="text-xs text-ink-500 mt-1">{subtitle}</p>
        ) : null}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2 shrink-0 self-start sm:self-auto">
        <button
          type="button"
          onClick={onToggle}
          disabled={isToggling}
          className="disabled:opacity-50 transition-opacity"
          title={isActive ? 'Désactiver' : 'Activer'}
        >
          <StatusPill tone={isActive ? 'success' : 'neutral'}>
            {isActive ? 'Actif' : 'Inactif'}
          </StatusPill>
        </button>

        <button
          type="button"
          onClick={onEdit}
          aria-label="Modifier"
          title="Modifier"
          className="w-9 h-9 rounded-control text-ink-600 hover:bg-surface-subtle hover:text-ink-900 flex items-center justify-center transition-colors"
        >
          <LuPencil size={15} />
        </button>
      </div>
    </div>
  )
}