// src/components/ui/ChipGroup.jsx
export default function ChipGroup({ options, value = [], onChange }) {
  const toggle = (key) => {
    const next = value.includes(key)
      ? value.filter((k) => k !== key)
      : [...value, key]
    onChange(next)
  }

  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => {
        const active = value.includes(opt.key)
        return (
          <button
            key={opt.key}
            type="button"
            onClick={() => toggle(opt.key)}
            aria-pressed={active}
            className={`px-3 py-1.5 rounded-full text-sm font-medium border transition-colors ${
              active
                ? 'bg-brand-50 text-brand-600 border-brand-500'
                : 'bg-white text-ink-600 border-surface-border hover:border-brand-500'
            }`}
          >
            {opt.label}
          </button>
        )
      })}
    </div>
  )
}