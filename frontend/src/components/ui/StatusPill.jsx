// src/components/ui/StatusPill.jsx
const TONES = {
  success:  'bg-success/10 text-success',
  warning:  'bg-warning/10 text-warning',
  danger:   'bg-danger/10 text-danger',
  info:     'bg-brand-50 text-brand-600',
  neutral:  'bg-ink-400/10 text-ink-600',
}

export default function StatusPill({ tone = 'neutral', children }) {
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${TONES[tone]}`}>
      <span className="w-1.5 h-1.5 rounded-full bg-current" />
      {children}
    </span>
  )
}