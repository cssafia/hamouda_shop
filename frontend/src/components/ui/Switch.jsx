// src/components/ui/Switch.jsx
export default function Switch({ checked, onChange, disabled, label }) {
  return (
    <label className={`inline-flex items-center gap-3 ${disabled ? 'opacity-50' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors ${
          checked ? 'bg-brand-500' : 'bg-ink-400/40'
        }`}
      >
        <span
          className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
            checked ? 'translate-x-[22px]' : 'translate-x-0.5'
          }`}
        />
      </button>
      {label && <span className="text-sm text-ink-700">{label}</span>}
    </label>
  )
}