import { useEffect, useState } from 'react'
import { ChevronDown, Plus, X, Trash2 } from 'lucide-react'

import Field from '../../ui/Field'
import Select from '../../ui/Select'
import Switch from '../../ui/Switch'
import { formatCurrency } from '../../../utils/format'

const emptyVariant = () => ({
  name: '',
  price: '',
  promotional_price: '',
  profit: '',
  stock_quantity: '',
  overrides: [],
})

export default function VariantsEditor({
  stockMode = null,
  baseSpecs = [],
  value = [],
  onChange,
  errors = {},
}) {
  const update = (i, patch) =>
    onChange(value.map((v, idx) => (idx === i ? { ...v, ...patch } : v)))
  const remove = (i) => onChange(value.filter((_, idx) => idx !== i))
  const add = () => onChange([...value, emptyVariant()])

  return (
    <div className="space-y-3">
      {value.length === 0 && (
        <p className="text-sm text-ink-500 rounded-control border border-dashed border-surface-border px-4 py-3">
          No variants yet — add one below.
        </p>
      )}

      {value.map((v, i) => (
        <VariantRow
          key={i}
          index={i}
          variant={v}
          stockMode={stockMode}
          baseSpecs={baseSpecs}
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
        <Plus size={16} /> Add variant
      </button>
    </div>
  )
}

function VariantRow({
  index, variant, stockMode, baseSpecs, errors, onPatch, onRemove,
}) {
  const key = (f) => `variants.${index}.${f}`
  const err = (f) => errors[key(f)]

  const hasError = Object.keys(errors).some((k) =>
    k.startsWith(`variants.${index}.`)
  )

  const [open, setOpen] = useState(!variant.name)
  useEffect(() => { if (hasError) setOpen(true) }, [hasError])

  const [advanced, setAdvanced] = useState(
    Boolean(variant.profit && variant.profit !== '')
  )

  const specOptions = baseSpecs.filter((s) => s.name?.trim())
  const overrides = variant.overrides ?? []

  const setOverride = (j, patch) =>
    onPatch({
      overrides: overrides.map((o, idx) => (idx === j ? { ...o, ...patch } : o)),
    })
  const addOverride = () =>
    onPatch({ overrides: [...overrides, { name: '', value: '' }] })
  const removeOverride = (j) =>
    onPatch({ overrides: overrides.filter((_, idx) => idx !== j) })

  const scrollToSpecs = () =>
    document
      .querySelector('[data-section="specs"]')
      ?.scrollIntoView({ behavior: 'smooth', block: 'start' })

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
            {variant.name || `Variant ${index + 1}`}
          </span>
          {variant.price !== '' && !Number.isNaN(Number(variant.price)) && (
            <span className="text-xs text-ink-500 shrink-0">
              {formatCurrency(Number(variant.price))}
            </span>
          )}
        </button>
        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove variant"
          className="p-1.5 text-ink-400 hover:text-danger"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {open && (
        <div className="px-3 pb-3 pt-1 space-y-4 border-t border-surface-border">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-3">
            <div data-error-key={key('name')}>
              <Field label="Variant name" required error={err('name')} hint='e.g. "16 GB / 512 GB".'>
                <input
                  className="input"
                  value={variant.name}
                  onChange={(e) => onPatch({ name: e.target.value })}
                />
              </Field>
            </div>

            <div data-error-key={key('price')}>
              <Field label="Price" required error={err('price')}>
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={variant.price}
                  onChange={(e) => onPatch({ price: e.target.value })}
                />
              </Field>
            </div>

            <div data-error-key={key('promotional_price')}>
              <Field
                label="Promo price"
                error={err('promotional_price')}
                hint="Optional. Must be below the variant price."
              >
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={variant.promotional_price}
                  onChange={(e) => onPatch({ promotional_price: e.target.value })}
                />
              </Field>
            </div>

            {stockMode === 'per_variant' && (
              <div data-error-key={key('stock_quantity')}>
                <Field label="Stock for this variant" required error={err('stock_quantity')}>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={variant.stock_quantity}
                    onChange={(e) => onPatch({ stock_quantity: e.target.value })}
                  />
                </Field>
              </div>
            )}
          </div>

          <div>
            <span className="label">Overrides</span>
            <p className="text-xs text-ink-600 mt-0.5 mb-2">
              Only what differs from the base specifications.
            </p>

            {overrides.map((o, j) => (
              <div key={j} className="flex items-start gap-2 mb-2">
                <div data-error-key={key(`overrides.${j}.name`)} className="w-2/5 shrink-0">
                  <Select
                    value={o.name}
                    onChange={(e) => setOverride(j, { name: e.target.value })}
                  >
                    <option value="">Spec…</option>
                    {specOptions.map((s) => (
                      <option key={s.name} value={s.name}>{s.name}</option>
                    ))}
                  </Select>
                </div>
                <input
                  className="input"
                  value={o.value}
                  onChange={(e) => setOverride(j, { value: e.target.value })}
                  placeholder="Value"
                />
                <button
                  type="button"
                  onClick={() => removeOverride(j)}
                  aria-label="Remove override"
                  className="p-2 text-ink-400 hover:text-danger"
                >
                  <X size={15} />
                </button>
              </div>
            ))}

            {specOptions.length > 0 ? (
              <button
                type="button"
                onClick={addOverride}
                className="inline-flex items-center gap-1 text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                <Plus size={14} /> Add override
              </button>
            ) : (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  disabled
                  className="inline-flex items-center gap-1 text-sm font-medium text-ink-400 cursor-not-allowed"
                >
                  <Plus size={14} /> Add override
                </button>
                <button
                  type="button"
                  onClick={scrollToSpecs}
                  className="text-xs text-brand-600 hover:underline"
                >
                  Add base specifications first
                </button>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between rounded-control border border-surface-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-ink-900">Advanced</p>
              <p className="text-xs text-ink-600">
                Set a specific profit for this variant (defaults to the product profit).
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
                  value={variant.profit}
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