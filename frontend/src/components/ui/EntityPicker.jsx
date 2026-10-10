// src/components/ui/EntityPicker.jsx
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'         
import { Plus, X } from 'lucide-react'
import Select from './Select'
import Button from './Button'

export default function EntityPicker({
  /* field wrapper */
  label,
  htmlFor,
  required = false,
  error,
  hint,

  /* data */
  options = [],
  isLoading = false,

  /* select */
  id,
  value,
  onChange,
  placeholder = 'All',
  includeAll = true,
  disabled = false,
  className,

  /* quick-add */
  allowAdd = false,
  addTitle = 'Add new',
  addFields = [],
  onAdd,
  onCreated,
}) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState({})
  const [submitting, setSubmitting] = useState(false)
  const [addError, setAddError] = useState('')

  const close = () => {
    setOpen(false)
    setSubmitting(false)
    setAddError('')
  }

  /* Init form values when the modal opens */
  useEffect(() => {
    if (!open) return
    const init = {}
    addFields.forEach((f) => {
      init[f.name] = f.defaultValue ?? ''
    })
    setValues(init)
    setAddError('')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open])                                   // ← only [open], not [addFields]

  /* ESC + body scroll lock */
  useEffect(() => {
    if (!open) return
    const onKey = (e) => e.key === 'Escape' && close()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [open])

  const submit = async (e) => {
    e.preventDefault()
    e.stopPropagation()                        // ← don't bubble to outer form
    setAddError('')

    for (const f of addFields) {
      if (f.required && !String(values[f.name] ?? '').trim()) {
        setAddError(`${f.label} is required`)
        return
      }
    }

    setSubmitting(true)
    try {
      const created = await onAdd(values)
      onCreated?.(created)
      close()
    } catch (err) {
      setAddError(err?.message || 'Failed to create')
      setSubmitting(false)
    }
  }

  /* ---------- Select element ---------- */
  const selectEl = (
    <Select
      id={id}
      className={className}
      value={value ?? ''}
      onChange={onChange}
      disabled={disabled || isLoading}
    >
      {includeAll && <option value="">{placeholder}</option>}
      {options.map((opt) => (
        <option key={opt.value} value={opt.value}>
          {opt.indent ? '\u00A0\u00A0'.repeat(opt.indent) + '└ ' : ''}
          {opt.label}
        </option>
      ))}
    </Select>
  )

  const control = allowAdd ? (
    <div className="flex gap-2">
      <div className="flex-1 min-w-0">{selectEl}</div>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="shrink-0 w-10 h-10 rounded-control border border-surface-border text-ink-600 hover:border-brand-500 hover:text-brand-600 flex items-center justify-center transition-colors"
        title={addTitle}
        aria-label={addTitle}
      >
        <Plus size={16} />
      </button>
    </div>
  ) : (
    selectEl
  )

  /* ---------- Modal (rendered in a portal) ---------- */
  const modal = open
    ? createPortal(
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          onClick={(e) => e.stopPropagation()}
        >
          <div
            className="absolute inset-0 bg-ink-900/40 animate-fade-in"
            onClick={close}
          />
          <form
            onSubmit={submit}
            className="relative card w-full max-w-sm p-5 space-y-4"
          >
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-ink-900">{addTitle}</h3>
              <button
                type="button"
                onClick={close}
                className="p-1 -m-1 text-ink-400 hover:text-ink-900"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {addFields.map((f) => (
              <div key={f.name}>
                <label className="label" htmlFor={`ep-${f.name}`}>
                  {f.label}
                  {f.required && <span className="text-danger ml-0.5">*</span>}
                </label>

                {f.type === 'select' ? (
                  <Select
                    id={`ep-${f.name}`}
                    value={values[f.name] ?? ''}
                    onChange={(e) =>
                      setValues((s) => ({ ...s, [f.name]: e.target.value }))
                    }
                  >
                    {(f.options ?? []).map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </Select>
                ) : (
                  <input
                    id={`ep-${f.name}`}
                    className="input"
                    value={values[f.name] ?? ''}
                    onChange={(e) =>
                      setValues((s) => ({ ...s, [f.name]: e.target.value }))
                    }
                    placeholder={f.placeholder}
                    autoFocus={f.autoFocus}
                  />
                )}
              </div>
            ))}

            {addError && <p className="form-error">{addError}</p>}

            <div className="flex gap-2 justify-end pt-1">
              <Button type="button" variant="secondary" onClick={close}>
                Cancel
              </Button>
              <Button type="submit" loading={submitting}>
                Create
              </Button>
            </div>
          </form>
        </div>,
        document.body                       // ← teleport to body
      )
    : null

  return (
    <>
      {label ? (
        <div>
          <label htmlFor={htmlFor || id} className="label">
            {label}
            {required && <span className="text-danger ml-0.5">*</span>}
          </label>
          {control}
          {error ? (
            <p className="form-error">{error}</p>
          ) : hint ? (
            <p className="text-xs text-ink-400 mt-1">{hint}</p>
          ) : null}
        </div>
      ) : (
        control
      )}

      {modal}
    </>
  )
}