// src/components/ui/Toast.jsx
import { useEffect, useState, useSyncExternalStore } from 'react'
import { createRoot } from 'react-dom/client'
import {
  LuCircleCheck,
  LuCircleX,
  LuTriangleAlert,
  LuInfo,
  LuX,
} from 'react-icons/lu'

/* ================================================================
   Store — module-level, no context, no provider
   ================================================================ */
let toasts = []
let id = 0
const listeners = new Set()
const emit = () => listeners.forEach((l) => l())

export const toast = {
  show({ variant = 'info', title, message, duration = 4000 }) {
    const t = { id: ++id, variant, title, message }
    toasts = [...toasts, t]
    emit()
    if (duration > 0) setTimeout(() => toast.dismiss(t.id), duration)
    return t.id
  },
  dismiss(tid) {
    toasts = toasts.filter((t) => t.id !== tid)
    emit()
  },
  success(title, opts) { return toast.show({ ...opts, variant: 'success', title }) },
  error(title, opts)   { return toast.show({ ...opts, variant: 'error',   title }) },
  warning(title, opts) { return toast.show({ ...opts, variant: 'warning', title }) },
  info(title, opts)    { return toast.show({ ...opts, variant: 'info',    title }) },
}

const subscribe = (fn) => { listeners.add(fn); return () => listeners.delete(fn) }
const getSnapshot = () => toasts

/* ================================================================
   Visuals
   ================================================================ */
const VARIANTS = {
  success: { Icon: LuCircleCheck,   bar: 'bg-success',    iconWrap: 'bg-success/10 text-success' },
  error:   { Icon: LuCircleX,       bar: 'bg-danger',     iconWrap: 'bg-danger/10 text-danger'   },
  warning: { Icon: LuTriangleAlert, bar: 'bg-warning',    iconWrap: 'bg-warning/10 text-warning' },
  info:    { Icon: LuInfo,          bar: 'bg-brand-500',  iconWrap: 'bg-brand-50 text-brand-600' },
}

function ToastCard({ t }) {
  const v = VARIANTS[t.variant] ?? VARIANTS.info
  const { Icon } = v
  return (
    <div
      role={t.variant === 'error' || t.variant === 'warning' ? 'alert' : 'status'}
      className="toast-enter relative flex items-start gap-3 overflow-hidden rounded-card border border-surface-border bg-white px-4 py-3 text-sm shadow-[0_8px_24px_-12px_rgb(15_23_42_/_0.18)]"
    >
      <span aria-hidden className={`absolute inset-y-0 left-0 w-1 ${v.bar}`} />
      <span aria-hidden className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${v.iconWrap}`}>
        <Icon className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1 pt-0.5">
        {t.title && <p className="font-medium leading-snug text-ink-900">{t.title}</p>}
        {t.message && (
          <div className={`text-ink-600 leading-snug ${t.title ? 'mt-0.5' : ''}`}>
            {t.message}
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={() => toast.dismiss(t.id)}
        aria-label="Dismiss"
        className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ink-400 transition-colors hover:bg-surface-subtle hover:text-ink-700"
      >
        <LuX className="h-3.5 w-3.5" />
      </button>
    </div>
  )
}

function ToastHost() {
  const items = useSyncExternalStore(subscribe, getSnapshot)
  if (!items.length) return null
  return (
    <div
      className="pointer-events-none fixed inset-x-4 bottom-20 z-[100] flex flex-col items-stretch gap-2 sm:inset-x-auto sm:bottom-4 sm:right-4 sm:max-w-sm"
      aria-live="polite"
      aria-atomic="true"
    >
      {items.map((t) => (
        <div key={t.id} className="pointer-events-auto">
          <ToastCard t={t} />
        </div>
      ))}
    </div>
  )
}

/* ================================================================
   Auto-mount — no <Toaster /> needed anywhere
   ================================================================ */
let mounted = false
export function mountToast() {
  if (mounted || typeof window === 'undefined') return
  mounted = true
  const el = document.createElement('div')
  el.id = 'toast-root'
  document.body.appendChild(el)
  createRoot(el).render(<ToastHost />)
}

/** Optional default export — mount manually if you prefer. */
export default function Toast() {
  useEffect(() => { mountToast() }, [])
  return null
}