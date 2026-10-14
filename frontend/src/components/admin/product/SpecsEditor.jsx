// src/components/product/SpecsEditor.jsx
import { Plus, X } from 'lucide-react'

export default function SpecsEditor({ value = [], onChange, emptyHint }) {
  const add = () =>
    onChange([
      ...value,
      { name: '', value: '', display_order: value.length },
    ])

  const remove = (i) =>
    onChange(
      value
        .filter((_, idx) => idx !== i)
        .map((s, idx) => ({ ...s, display_order: idx }))
    )

  const update = (i, key, val) =>
    onChange(
      value.map((s, idx) => (idx === i ? { ...s, [key]: val } : s))
    )

  return (
    <div className="space-y-2">
      {value.length === 0 && emptyHint && (
        <p className="text-sm text-ink-400 italic">{emptyHint}</p>
      )}

      {value.map((spec, i) => (
        <div key={i} className="flex gap-2">
          <input
            className="input flex-1"
            placeholder="Name (e.g. CPU)"
            value={spec.name}
            onChange={(e) => update(i, 'name', e.target.value)}
          />
          <input
            className="input flex-[1.4]"
            placeholder="Value (e.g. Intel i7-1260P)"
            value={spec.value}
            onChange={(e) => update(i, 'value', e.target.value)}
          />
          <button
            type="button"
            onClick={() => remove(i)}
            className="shrink-0 w-10 h-10 rounded-control text-ink-400 hover:text-danger hover:bg-danger/5 flex items-center justify-center transition-colors"
            aria-label="Remove"
          >
            <X size={16} />
          </button>
        </div>
      ))}

      <button
        type="button"
        onClick={add}
        className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
      >
        <Plus size={14} /> Add specification
      </button>
    </div>
  )
}