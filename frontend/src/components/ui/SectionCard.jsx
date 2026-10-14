// src/components/ui/SectionCard.jsx
export default function SectionCard({
  icon: Icon,
  title,
  action,
  noPadding = false,
  className = '',
  bodyClassName = '',
  children,
}) {
  const hasHeader = Icon || title || action

  return (
    <section className={`card overflow-hidden ${className}`}>
      {hasHeader && (
        <header className="flex items-center gap-2 px-4 sm:px-5 py-3.5 border-b border-surface-border">
          {Icon && <Icon size={16} className="text-ink-400 shrink-0" />}
          {title && (
            <h2 className="font-medium text-ink-900 truncate">{title}</h2>
          )}
          {action && <div className="ml-auto shrink-0">{action}</div>}
        </header>
      )}
      <div className={`${noPadding ? '' : 'p-4 sm:p-5'} ${bodyClassName}`}>
        {children}
      </div>
    </section>
  )
}