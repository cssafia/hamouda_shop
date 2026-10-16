// src/components/admin/catalog/BrandFormModal.jsx
import { useState, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { LuX, LuCheck } from 'react-icons/lu'
import Field from '../../ui/Field'

export default function BrandFormModal({
  isEdit = false,
  initialName = '',
  initialCategoryIds = [],
  categories = [],
  isPending = false,
  onSubmit,
  onClose,
}) {
  const [name, setName] = useState(initialName)
  const [categoryIds, setCategoryIds] = useState(initialCategoryIds)
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

  const toggleCategory = (id) => {
    setCategoryIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    )
  }

  const submit = (e) => {
    e.preventDefault()
    const trimmed = name.trim()
    if (!trimmed) return setError('Le nom est requis')
    setError('')
    onSubmit({ name: trimmed, category_ids: categoryIds })
  }

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-ink-900/40 animate-fade-in"
        onClick={() => !isPending && onClose()}
      />

      <form
        onSubmit={submit}
        className="relative card w-full max-w-md p-5 space-y-4 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-start justify-between gap-3">
          <div>
            <h3 className="font-semibold text-ink-900">
              {isEdit ? 'Modifier la marque' : 'Nouvelle marque'}
            </h3>
            <p className="text-sm text-ink-600 mt-0.5">
              {isEdit
                ? 'Renomme ou change les catégories.'
                : 'Crée une marque et lie-la aux catégories.'}
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

        <Field label="Nom" htmlFor="brand-name" required error={error}>
          <input
            id="brand-name"
            type="text"
            className="input"
            value={name}
            onChange={(e) => {
              setName(e.target.value)
              if (error) setError('')
            }}
            placeholder="Dell"
            autoFocus
            disabled={isPending}
          />
        </Field>

        <div>
          <p className="label">Catégories liées</p>

          {categories.length === 0 ? (
            <p className="text-sm text-ink-500 italic">
              Crée d'abord une catégorie.
            </p>
          ) : (
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {categories.map((c) => {
                const checked = categoryIds.includes(c.id)
                return (
                  <label
                    key={c.id}
                    className={`flex items-center gap-3 rounded-control border px-3 py-2.5 cursor-pointer transition-colors ${
                      checked
                        ? 'border-brand-500 bg-brand-50'
                        : 'border-surface-border hover:border-brand-500'
                    }`}
                  >
                    <input
                      type="checkbox"
                      className="sr-only"
                      checked={checked}
                      onChange={() => toggleCategory(c.id)}
                      disabled={isPending}
                    />
                    <span
                      className={`w-4 h-4 rounded flex items-center justify-center shrink-0 ${
                        checked
                          ? 'bg-brand-500 text-white'
                          : 'border border-surface-border bg-white'
                      }`}
                    >
                      {checked && <LuCheck size={12} />}
                    </span>
                    <span className="text-sm text-ink-900">{c.name}</span>
                  </label>
                )
              })}
            </div>
          )}

          <p className="text-xs text-ink-500 mt-2">
            La marque apparaîtra dans les formulaires produits pour ces catégories.
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