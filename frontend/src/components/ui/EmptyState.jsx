// src/components/ui/EmptyState.jsx
export default function EmptyState({ icon: Icon, title, description, action }) {
  return (
    <div className="text-center py-16 px-4">
      {Icon && (
        <div className="mx-auto w-12 h-12 rounded-full bg-surface-subtle flex items-center justify-center text-ink-400 mb-4">
          <Icon size={22} />
        </div>
      )}
      <h3 className="font-medium text-ink-900">{title}</h3>
      {description && <p className="text-sm text-ink-600 mt-1 max-w-sm mx-auto">{description}</p>}
      {action && <div className="mt-5 flex justify-center">{action}</div>}
    </div>
  )
}