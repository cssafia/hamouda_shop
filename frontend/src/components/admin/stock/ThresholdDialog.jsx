// src/components/admin/stock/ThresholdDialog.jsx
import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'
import { useQueryClient } from '@tanstack/react-query'

import { useUpdateProduct } from '../../../features/products/useAdminProducts'
import { useUpdateVariant } from '../../../features/products/useVariants'
import { stockKeys } from '../../../features/stock/Keys'
import { toast } from '../../ui/Toast'

export default function ThresholdDialog({ target, onClose }) {
  const { product, variant } = target
  const currentValue = variant
    ? variant.low_stock_threshold
    : product.low_stock_threshold

  const [value, setValue] = useState(
    currentValue == null ? '' : String(currentValue)
  )
  const qc = useQueryClient()

  // Two hooks — only one fires, depending on the target.
  const updateProduct = useUpdateProduct(product.id)
  const updateVariant = useUpdateVariant(product.id, variant?.id)

  const isPending = updateProduct.isPending || updateVariant.isPending

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !isPending && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, isPending])

  const submit = () => {
    const trimmed = String(value).trim()
    const n = trimmed === '' ? null : Number(trimmed)
    if (n !== null && (n < 0 || !Number.isInteger(n))) {
      toast.error('Nombre invalide')
      return
    }

    const onSuccess = () => {
      qc.invalidateQueries({ queryKey: stockKeys.all })
      qc.invalidateQueries({ queryKey: ['products', 'admin', product.id] })
      toast.success('Seuil mis à jour')
      onClose()
    }
    const onError = (err) => toast.error('Échec', { message: err.message })

    if (variant) {
      updateVariant.mutate({ low_stock_threshold: n }, { onSuccess, onError })
    } else {
      // Product updates go through multipart — send only the threshold.
      updateProduct.mutate(
        { data: { low_stock_threshold: n } },
        { onSuccess, onError }
      )
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/40 animate-fade-in"
        onClick={() => !isPending && onClose()}
      />

      <div className="relative card w-full max-w-sm p-5 space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h3 className="font-semibold text-ink-900">Seuil d'alerte</h3>
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
            disabled={isPending}
            aria-label="Fermer"
            className="-mr-1 -mt-1 shrink-0 rounded-full p-1.5 text-ink-400 hover:bg-surface-subtle hover:text-ink-700 disabled:opacity-50"
          >
            <LuX size={16} />
          </button>
        </div>

        <div>
          <label htmlFor="threshold" className="label">
            T'alerter quand le stock atteint :
          </label>
          <div className="relative">
            <input
              id="threshold"
              type="number"
              min="0"
              className="input pr-16"
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="—"
              autoFocus
            />
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm pointer-events-none">
              unités
            </span>
          </div>
          <p className="text-xs text-ink-600 mt-2">
            Laisse vide pour désactiver l'alerte.
          </p>
        </div>

        <div className="flex gap-2 justify-end pt-1">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-control border border-surface-border bg-white px-4 py-2.5 text-sm font-medium text-ink-900 hover:border-brand-500 disabled:opacity-50 transition-colors"
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={submit}
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-control bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Patientez…' : 'Enregistrer'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}