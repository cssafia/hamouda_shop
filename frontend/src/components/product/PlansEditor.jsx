import { useEffect, useState } from 'react'
import { ChevronDown, Plus, Trash2 } from 'lucide-react'

import Field from '../ui/Field'
import Select from '../ui/Select'
import Switch from '../ui/Switch'
import { DURATIONS } from '../../constants/product'
import { formatCurrency } from '../../utils/format'

const emptyPlan = () => ({
  duration: '',
  price: '',
  promotional_price: '',
  profit: '',
})

export default function PlansEditor({ value = [], onChange, errors = {} }) {
  const update = (i, patch) =>
    onChange(value.map((p, idx) => (idx === i ? { ...p, ...patch } : p)))
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, emptyPlan()])

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-ink-500 rounded-control border border-dashed border-surface-border px-4 py-3">
          No plans yet — add one below.
        </p>
      )}

      {value.map((plan, i) => (
        <PlanRow
          key={i}
          index={i}
          plan={plan}
          errors={errors}
          onPatch={(p) => update(i, p)}
          onRemove={() => remove(i)}
        />
      ))}

      <button
        type="button"
        onClick={add}
        className="btn-secondary inline-flex items-center gap-1.5 text-sm"
      >
        <Plus size={16} /> Add plan
      </button>
    </div>
  )
}

function PlanRow({ index, plan, errors, onPatch, onRemove }) {
  const key = (f) => `variants.${index}.${f}`
  const err = (f) => errors[key(f)]

  const hasError = Object.keys(errors).some((k) =>
    k.startsWith(`variants.${index}.`)
  )

  const [open, setOpen] = useState(!plan.duration)
  useEffect(() => { if (hasError) setOpen(true) }, [hasError])

  const [advanced, setAdvanced] = useState(
    Boolean(plan.profit && plan.profit !== '')
  )

  return (
    <div className={`rounded-control border bg-white ${hasError ? 'border-danger/50' : 'border-surface-border'}`}>
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 text-left min-w-0"
        >
          <ChevronDown
            size={16}
            className={`shrink-0 text-ink-500 transition-transform ${open ? '' : '-rotate-90'}`}
          />
          <span className="text-sm font-medium text-ink-900 truncate">
            {plan.duration || `Plan ${index + 1}`}
          </span>
          {plan.price !== '' && !Number.isNaN(Number(plan.price)) && (
            <span className="text-xs text-ink-500 shrink-0">
              {formatCurrency(Number(plan.price))}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove plan"
          className="p-1.5 text-ink-400 hover:text-danger"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-3 space-y-4 border-t border-surface-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div data-error-key={key('duration')}>
              <Field label="Duration" required error={err('duration')}>
                <Select
                  value={plan.duration}
                  onChange={(e) => onPatch({ duration: e.target.value })}
                >
                  <option value="">Choose…</option>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div data-error-key={key('price')}>
              <Field label="Price" required error={err('price')}>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={plan.price}
                  onChange={(e) => onPatch({ price: e.target.value })}
                />
              </Field>
            </div>

            <div data-error-key={key('promotional_price')}>
              <Field
                label="Promo price"
                error={err('promotional_price')}
                hint="Optional. Must be below the plan price."
              >
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={plan.promotional_price}
                  onChange={(e) => onPatch({ promotional_price: e.target.value })}
                />
              </Field>
            </div>
          </div>

          <div className="flex items-center justify-between rounded-control border border-surface-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-ink-900">Advanced</p>
              <p className="text-xs text-ink-600">
                Set a specific profit for this plan.
              </p>
            </div>
            <Switch checked={advanced} onChange={setAdvanced} />
          </div>

          {advanced && (
            <div data-error-key={key('profit')}>
              <Field label="Profit" error={err('profit')}>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={plan.profit}
                  onChange={(e) => onPatch({ profit: e.target.value })}
                />
              </Field>
            </div>
          )}
        </div>
      )}
    </div>
  )
}