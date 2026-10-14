// src/components/admin/stock/StockAdjustDialog.jsx
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { LuX, LuMinus, LuPlus, LuTriangleAlert } from 'react-icons/lu'

import { useAdjustStock } from '../../../features/stock/useAdminStock'
import { toast } from '../../ui/Toast'

const REASONS = [
  { value: 'sold_offline', label: 'Vendu hors ligne' },
  { value: 'damage',       label: 'Casse / Perte' },
  { value: 'correction',   label: 'Correction' },
]

export default function StockAdjustDialog({ target, onClose }) {
  const { product, variant } = target
  const currentStock = Number(
    variant ? variant.stock_quantity ?? 0 : product.stock_quantity ?? product.total_stock ?? 0
  )

  const [newStock, setNewStock] = useState(currentStock)
  const [reason, setReason] = useState('')
  const [note, setNote] = useState('')
  const [error, setError] = useState('')

  const adjust = useAdjustStock(product.id)

  useEffect(() => {
    setNewStock(currentStock)
    setReason('')
    setNote('')
    setError('')
  }, [currentStock, product.id, variant?.id])

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !adjust.isPending && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, adjust.isPending])

  const delta = newStock - currentStock
  const isIncrease = delta > 0
  const isDecrease = delta < 0
  const isNoop = delta === 0
  const clamp = (n) => Math.max(0, Number(n) || 0)

  const submit = () => {
    if (isNoop) return
    if (isDecrease && !reason) {
      setError('Choisis une raison')
      return
    }
    setError('')

    adjust.mutate(
      { delta, variantId: variant?.id ?? null },
      {
        onSuccess: () => {
          toast.success(`Stock mis à jour (${currentStock} → ${newStock})`)
          onClose()
        },
        onError: (err) => setError(err.message || 'Échec'),
      }
    )
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/40 animate-fade-in"
        onClick={() => !adjust.isPending && onClose()}
      />

      <div className="relative card w-full max-w-md p-5 space-y-5 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-ink-900">Ajuster le stock</h3>
            <p className="text-sm text-ink-600 mt-0.5 truncate">
              {product.name}
              {variant && (
                <>
                  <span className="text-ink-400 mx-1.5">·</span>
                  <span>{variant.name}</span>
                </>
              )}
              {!variant && product.stock_mode === 'per_variant' && (
                <>
                  <span className="text-ink-400 mx-1.5">·</span>
                  <span className="text-ink-500">Configuration de base</span>
                </>
              )}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={adjust.isPending}
            aria-label="Fermer"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ink-400 hover:bg-surface-subtle hover:text-ink-700 disabled:opacity-50"
          >
            <LuX size={16} />
          </button>
        </div>

        {/* Current */}
        <div className="rounded-control border border-surface-border bg-surface-subtle px-4 py-3">
          <p className="text-xs text-ink-600">Stock actuel</p>
          <p className="text-2xl font-semibold text-ink-900 mt-0.5">
            {currentStock}
            <span className="text-sm text-ink-500 font-normal ml-1.5">unités</span>
          </p>
        </div>

        {/* Stepper */}
        <div>
          <label className="label">Nouveau stock</label>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setNewStock((n) => clamp(n - 1))}
              className="w-11 h-11 rounded-control border border-surface-border bg-white text-ink-700 hover:border-brand-500 hover:text-brand-600 flex items-center justify-center transition-colors"
              aria-label="Diminuer"
            >
              <LuMinus size={16} />
            </button>

            <input
              type="number"
              min="0"
              value={newStock}
              onChange={(e) => setNewStock(clamp(e.target.value))}
              className="input text-center text-lg font-semibold flex-1"
            />

            <button
              type="button"
              onClick={() => setNewStock((n) => n + 1)}
              className="w-11 h-11 rounded-control border border-surface-border bg-white text-ink-700 hover:border-brand-500 hover:text-brand-600 flex items-center justify-center transition-colors"
              aria-label="Augmenter"
            >
              <LuPlus size={16} />
            </button>
          </div>

          <p
            className={`text-xs mt-2 ${
              isIncrease ? 'text-success'
              : isDecrease ? 'text-danger'
              : 'text-ink-400'
            }`}
          >
            {isNoop && 'Aucun changement'}
            {isIncrease && `+${delta} unité${delta > 1 ? 's' : ''} · ${currentStock} → ${newStock}`}
            {isDecrease && `${delta} unité${delta < -1 ? 's' : ''} · ${currentStock} → ${newStock}`}
          </p>
        </div>

        {/* Reason (only on decrement) */}
        {isDecrease && (
          <>
            <div>
              <p className="label">Raison</p>
              <div className="space-y-1.5">
                {REASONS.map((r) => (
                  <label
                    key={r.value}
                    className={`flex items-center gap-2.5 rounded-control border px-3 py-2.5 cursor-pointer transition-colors ${
                      reason === r.value
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-surface-border hover:border-brand-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="adjust-reason"
                      value={r.value}
                      checked={reason === r.value}
                      onChange={(e) => { setReason(e.target.value); setError('') }}
                      className="w-4 h-4 accent-brand-500"
                    />
                    <span className="text-sm text-ink-900">{r.label}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="adjust-note" className="label">
                Note (optionnel)
              </label>
              <textarea
                id="adjust-note"
                rows={2}
                className="input resize-y"
                placeholder="Ex : Écran fissuré"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
          </>
        )}

        {error && (
          <div className="flex items-start gap-2 rounded-control border border-danger/30 bg-danger/5 px-3 py-2.5 text-sm text-danger">
            <LuTriangleAlert size={14} className="shrink-0 mt-0.5" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={adjust.isPending}
            className="inline-flex items-center justify-center rounded-control border border-surface-border bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:border-brand-500 disabled:opacity-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isNoop || adjust.isPending}
            className={`inline-flex items-center justify-center rounded-control px-4 py-2.5 text-sm font-medium text-white transition-colors disabled:opacity-50 disabled:pointer-events-none ${
              isDecrease ? 'bg-danger hover:bg-danger/90' : 'bg-brand-500 hover:bg-brand-600'
            }`}
          >
            {adjust.isPending ? 'Patientez…' : 'Appliquer'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}