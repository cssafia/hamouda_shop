// src/components/ui/ConfirmDialog.jsx
import { useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LuTriangleAlert, LuX } from 'react-icons/lu'

const VARIANTS = {
  danger: {
    iconWrap: 'bg-danger/10 text-danger',
    confirmBtn: 'bg-danger text-white hover:bg-danger/90',
    Icon: LuTriangleAlert,
  },
  warning: {
    iconWrap: 'bg-warning/10 text-warning',
    confirmBtn: 'bg-warning text-white hover:bg-warning/90',
    Icon: LuTriangleAlert,
  },
  info: {
    iconWrap: 'bg-brand-50 text-brand-600',
    confirmBtn: 'bg-brand-500 text-white hover:bg-brand-600',
    Icon: LuTriangleAlert,
  },
}

export default function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  variant = 'danger',
  loading = false,
  children,           
}) {
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && !loading && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open, onClose, loading])

  if (!open) return null

  const v = VARIANTS[variant] ?? VARIANTS.danger
  const { Icon } = v

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/40 animate-fade-in"
        onClick={() => !loading && onClose()}
      />
      <div className="relative card w-full max-w-md p-5 space-y-4">
        <div className="flex items-start gap-3">
          <span
            aria-hidden
            className={`shrink-0 flex h-10 w-10 items-center justify-center rounded-full ${v.iconWrap}`}
          >
            <Icon size={18} />
          </span>
          <div className="flex-1 min-w-0 pt-0.5">
            <h3 className="font-semibold text-ink-900">{title}</h3>
            {description && (
              <p className="text-sm text-ink-600 mt-1 leading-snug">
                {description}
              </p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Close"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ink-400 transition-colors hover:bg-surface-subtle hover:text-ink-700 disabled:opacity-50"
          >
            <LuX size={16} />
          </button>
        </div>

        {/* ── CHILDREN RENDER HERE ── */}
        {children && <div>{children}</div>}

        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="inline-flex items-center justify-center gap-2 rounded-control border border-surface-border bg-white px-4 py-2.5 text-sm font-medium text-ink-900 transition-colors hover:border-brand-500 disabled:opacity-50"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className={`inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${v.confirmBtn}`}
          >
            {loading ? 'Please wait…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}