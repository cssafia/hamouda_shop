// src/components/admin/analytics/RangePicker.jsx
import { RANGE_PRESETS, rangeFromPreset } from '../../../utils/analytics'

export default function RangePicker({ value, onChange }) {
  const activePreset = RANGE_PRESETS.find((p) => {
    const r = rangeFromPreset(p.value)
    return r.from === value.from && r.to === value.to
  })

  return (
    <section className="card p-4">
      <div className="flex flex-wrap gap-2 mb-4">
        {RANGE_PRESETS.map((p) => (
          <button
            key={p.value}
            type="button"
            onClick={() => onChange(rangeFromPreset(p.value))}
            className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
              activePreset?.value === p.value
                ? 'border-brand-500 bg-brand-50 text-brand-700'
                : 'border-surface-border text-ink-600 hover:border-brand-500'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label htmlFor="range-from" className="label text-xs">Du</label>
          <input
            id="range-from"
            type="date"
            className="input"
            value={value.from}
            onChange={(e) => onChange({ ...value, from: e.target.value })}
          />
        </div>
        <div>
          <label htmlFor="range-to" className="label text-xs">Au</label>
          <input
            id="range-to"
            type="date"
            className="input"
            value={value.to}
            onChange={(e) => onChange({ ...value, to: e.target.value })}
          />
        </div>
      </div>
    </section>
  )
}