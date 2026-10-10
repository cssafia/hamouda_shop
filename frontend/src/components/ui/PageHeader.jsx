// src/components/ui/PageHeader.jsx
export default function PageHeader({ title, description, actions }) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5 lg:mb-6">
      <div className="min-w-0">
        <h1 className="text-xl lg:text-2xl font-semibold text-ink-900 truncate">{title}</h1>
        {description && <p className="text-sm text-ink-600 mt-1">{description}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 shrink-0">{actions}</div>}
    </div>
  )
}