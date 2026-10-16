// src/components/admin/catalog/CategoryFormModal.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LuX } from 'react-icons/lu'
import Field from '../../ui/Field'

export default function CategoryFormModal({
  isEdit = false,
  initialName = '',
  isPending = false,
  onSubmit,
  onClose,
}) {
  const [name, setName] = useState(initialName)
  const [error, setError] = useState('')

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && !isPending && onClose()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [onClose, isPending])

  const submit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Le nom est requis')
    setError('')
    onSubmit({ name: trimmed })
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/40 animate-fade-in"
        onClick={() => !isPending && onClose()}
      />

      <form
        onSubmit={submit}
        className="relative card w-full max-w-sm p-5 space-y-4"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink-900">
              {isEdit ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
            </h3>
            <p className="text-sm text-ink-600 mt-0.5">
              {isEdit ? 'Renomme la catégorie.' : 'Nom court et clair, par ex. Laptops.'}
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

        <Field label="Nom" htmlFor="category-name" required error={error}>
          <input
            id="category-name"
            type="text"
            className="input"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            placeholder="Laptops"
            autoFocus
            disabled={isPending}
          />
        </Field>

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
            type="submit"
            disabled={isPending}
            className="inline-flex items-center justify-center rounded-control bg-brand-500 px-4 py-2.5 text-sm font-medium text-white hover:bg-brand-600 disabled:opacity-50 transition-colors"
          >
            {isPending ? 'Enregistrement…' : isEdit ? 'Enregistrer' : 'Créer'}
          </button>
        </div>
      </form>
    </div>,
    document.body
  )
}