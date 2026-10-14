// src/pages/admin/Coupons/CouponForm.jsx
import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, X } from 'lucide-react'
import { LuSearch } from 'react-icons/lu'

import {
  useAdminCoupon,
  useCreateCoupon,
  useUpdateCoupon,
} from '../../../features/coupons/useAdminCoupons'
import { useAdminProducts } from '../../../features/products/useAdminProducts'
import { useCategories } from '../../../features/categories/useCategories'
import { useDebounced } from '../../../utils/useDebounced'
import {
  formatCurrency,
  formatDate,
  toBackendStartOfDay,
  toBackendEndOfDay,
  toDateInputValue,
} from '../../../utils/format'
import { COUPON_SCOPES, DISCOUNT_TYPES } from '../../../constants/coupons'
import { toast } from '../../../components/ui/Toast'

import PageHeader from '../../../components/ui/PageHeader'
import Field from '../../../components/ui/Field'
import Input from '../../../components/ui/Input'
import Select from '../../../components/ui/Select'
import Switch from '../../../components/ui/Switch'
import Button from '../../../components/ui/Button'
import Skeleton from '../../../components/ui/Skeleton'
import SectionCard from '../../../components/ui/SectionCard'

const EMPTY = {
  code: '',
  scope: 'all',
  discount_type: 'percentage',
  discount_value: '',
  minimum_amount: '',
  usage_limit: '',
  starts_at: '',
  expires_at: '',
  product_ids: [],
  category_ids: [],
  is_active: true,
}

export default function CouponForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const { data: existing, isLoading: isLoadingExisting } = useAdminCoupon(id)
  const createCoupon = useCreateCoupon()
  const updateCoupon = useUpdateCoupon(id)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [topError, setTopError] = useState('')

  useEffect(() => {
    if (!isEdit || !existing) return
    setForm({
      code: existing.code ?? '',
      scope: existing.scope ?? 'all',
      discount_type: existing.discount_type ?? 'percentage',
      discount_value: existing.discount_value ?? '',
      minimum_amount: existing.minimum_amount ?? '',
      usage_limit: existing.usage_limit ?? '',
      starts_at: toDateInputValue(existing.starts_at),
      expires_at: toDateInputValue(existing.expires_at),
      product_ids: existing.product_ids ?? [],
      category_ids: existing.category_ids ?? [],
      is_active: existing.is_active ?? true,
    })
  }, [isEdit, existing])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const isPending = createCoupon.isPending || updateCoupon.isPending

  const validate = () => {
    const e = {}
    const code = form.code.trim()
    if (!code) e.code = 'Le code est requis'
    else if (!/^[A-Z0-9_-]{2,20}$/.test(code))
      e.code = 'Utilise A-Z, 0-9, tirets ou underscores (2–20 caractères)'

    if (form.discount_value === '' || Number(form.discount_value) <= 0)
      e.discount_value = 'Valeur requise'
    else if (form.discount_type === 'percentage' && Number(form.discount_value) > 100)
      e.discount_value = 'Max 100 %'

    if (form.scope === 'products' && form.product_ids.length === 0)
      e.product_ids = 'Choisis au moins un produit'
    if (form.scope === 'categories' && form.category_ids.length === 0)
      e.category_ids = 'Choisis au moins une catégorie'

    if (form.starts_at && form.expires_at && form.starts_at > form.expires_at)
      e.expires_at = 'La fin doit être après le début'

    return e
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setTopError('')

    const v = validate()
    if (Object.keys(v).length) {
      setErrors(v)
      document
        .querySelector(`[data-error-key="${Object.keys(v)[0]}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    setErrors({})

    const payload = {
      code: form.code.trim().toUpperCase(),
      scope: form.scope,
      discount_type: form.discount_type,
      discount_value: Number(form.discount_value),
      minimum_amount:
        form.minimum_amount === '' ? null : Number(form.minimum_amount),
      usage_limit:
        form.usage_limit === '' ? null : Number(form.usage_limit),
      starts_at: toBackendStartOfDay(form.starts_at),
      expires_at: toBackendEndOfDay(form.expires_at),
      product_ids: form.scope === 'products' ? form.product_ids : [],
      category_ids: form.scope === 'categories' ? form.category_ids : [],
      ...(isEdit && { is_active: form.is_active }),
    }

    try {
      if (isEdit) await updateCoupon.mutateAsync(payload)
      else await createCoupon.mutateAsync(payload)
      toast.success(isEdit ? 'Coupon enregistré' : 'Coupon créé')
      navigate('/admin/coupons')
    } catch (err) {
      if (err.details?.length) {
        const mapped = {}
        err.details.forEach((d) => {
          mapped[d.field] = d.msg
        })
        setErrors(mapped)
      } else {
        setTopError(err.message || "Échec de l'enregistrement")
      }
    }
  }

  if (isEdit && isLoadingExisting) return <FormSkeleton />

  return (
    <form onSubmit={onSubmit} className="pb-28 lg:pb-0">
      <Link
        to={isEdit ? `/admin/coupons/${id}` : '/admin/coupons'}
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mb-4"
      >
        <ArrowLeft size={16} /> {isEdit ? 'Retour au coupon' : 'Coupons'}
      </Link>

      <PageHeader
        title={isEdit ? 'Modifier le coupon' : 'Nouveau coupon'}
        description={
          isEdit
            ? 'Modifie les paramètres du coupon.'
            : 'Crée un code promo pour tes clients.'
        }
      />

      {topError && (
        <div className="mb-5 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {topError}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          {/* Code */}
          <SectionCard title="Code">
            <div data-error-key="code">
              <Field
                label="Code promo"
                htmlFor="code"
                required
                error={errors.code}
                hint="Visible par le client. Majuscules recommandées."
              >
                <Input
                  id="code"
                  className="input font-mono text-lg tracking-wide uppercase"
                  value={form.code}
                  onChange={(e) =>
                    set(
                      'code',
                      e.target.value.replace(/[^a-zA-Z0-9_-]/g, '').toUpperCase()
                    )
                  }
                  placeholder="SUMMER10"
                  maxLength={20}
                  autoFocus
                />
              </Field>
            </div>
          </SectionCard>

          {/* Discount */}
          <SectionCard title="Remise">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Type">
                <Select
                  value={form.discount_type}
                  onChange={(e) => set('discount_type', e.target.value)}
                >
                  {DISCOUNT_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </Select>
              </Field>

              <div data-error-key="discount_value">
                <Field
                  label="Valeur"
                  htmlFor="discount_value"
                  required
                  error={errors.discount_value}
                >
                  <div className="relative">
                    <Input
                      id="discount_value"
                      className="input pr-12"
                      type="number"
                      min="0"
                      value={form.discount_value}
                      onChange={(e) => set('discount_value', e.target.value)}
                      placeholder={
                        form.discount_type === 'percentage' ? '10' : '500'
                      }
                    />
                    <span className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-400 text-sm pointer-events-none">
                      {form.discount_type === 'percentage' ? '%' : 'DA'}
                    </span>
                  </div>
                </Field>
              </div>
            </div>

            <Field
              label="Minimum d'achat"
              htmlFor="min"
              hint="Optionnel. Montant minimum pour utiliser ce coupon."
            >
              <Input
                id="min"
                type="number"
                min="0"
                value={form.minimum_amount}
                onChange={(e) => set('minimum_amount', e.target.value)}
                placeholder="5000"
              />
            </Field>
          </SectionCard>

          {/* Scope */}
          <SectionCard title="Portée">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {COUPON_SCOPES.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  onClick={() => set('scope', s.value)}
                  aria-pressed={form.scope === s.value}
                  className={`text-left rounded-control border p-3.5 transition-colors ${
                    form.scope === s.value
                      ? 'border-brand-500 bg-brand-50'
                      : 'border-surface-border hover:border-brand-500'
                  }`}
                >
                  <p
                    className={`text-sm font-medium ${
                      form.scope === s.value ? 'text-brand-700' : 'text-ink-900'
                    }`}
                  >
                    {s.label}
                  </p>
                  <p className="text-xs text-ink-600 mt-0.5">{s.hint}</p>
                </button>
              ))}
            </div>

            {form.scope === 'products' && (
              <div data-error-key="product_ids">
                <ProductPicker
                  value={form.product_ids}
                  onChange={(ids) => set('product_ids', ids)}
                />
                {errors.product_ids && (
                  <p className="form-error mt-2">{errors.product_ids}</p>
                )}
              </div>
            )}

            {form.scope === 'categories' && (
              <div data-error-key="category_ids">
                <CategoryPicker
                  value={form.category_ids}
                  onChange={(ids) => set('category_ids', ids)}
                />
                {errors.category_ids && (
                  <p className="form-error mt-2">{errors.category_ids}</p>
                )}
              </div>
            )}
          </SectionCard>

          {/* Limits + dates */}
          <SectionCard title="Conditions">
            <Field
              label="Limite d'utilisation"
              htmlFor="limit"
              hint="Optionnel. Nombre maximum d'utilisations."
            >
              <Input
                id="limit"
                type="number"
                min="0"
                value={form.usage_limit}
                onChange={(e) => set('usage_limit', e.target.value)}
                placeholder="Illimité"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Débute le" htmlFor="starts" hint="Optionnel.">
                <Input
                  id="starts"
                  type="date"
                  value={form.starts_at}
                  onChange={(e) => set('starts_at', e.target.value)}
                />
              </Field>

              <div data-error-key="expires_at">
                <Field
                  label="Expire le"
                  htmlFor="expires"
                  error={errors.expires_at}
                  hint="Optionnel."
                >
                  <Input
                    id="expires"
                    type="date"
                    value={form.expires_at}
                    onChange={(e) => set('expires_at', e.target.value)}
                  />
                </Field>
              </div>
            </div>
          </SectionCard>
        </div>

        {/* Sidebar */}
        <aside className="space-y-5">
          <SectionCard title="Aperçu">
            <CouponPreview form={form} />
          </SectionCard>

          {isEdit && (
            <SectionCard title="Statut">
              <Switch
                checked={form.is_active}
                onChange={(v) => set('is_active', v)}
                label={form.is_active ? 'Actif' : 'Désactivé'}
              />
              <p className="text-xs text-ink-600 mt-2">
                Les coupons désactivés ne sont pas utilisables.
              </p>
            </SectionCard>
          )}

          <div className="hidden lg:flex gap-2">
            <Button
              type="button"
              variant="secondary"
              onClick={() => navigate(-1)}
              className="flex-1"
            >
              Annuler
            </Button>
            <Button type="submit" loading={isPending} className="flex-1">
              {isEdit ? 'Enregistrer' : 'Créer'}
            </Button>
          </div>
        </aside>
      </div>

      {/* Mobile sticky save */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-white border-t border-surface-border px-4 py-3 flex gap-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
          className="flex-1"
        >
          Annuler
        </Button>
        <Button type="submit" loading={isPending} className="flex-1">
          {isEdit ? 'Enregistrer' : 'Créer'}
        </Button>
      </div>
    </form>
  )
}

/* ================================================================
   Live preview card
   ================================================================ */
function CouponPreview({ form }) {
  const discountLabel =
    form.discount_value === ''
      ? '—'
      : form.discount_type === 'percentage'
        ? `−${form.discount_value} %`
        : `−${form.discount_value} DA`

  const scopeLabel =
    form.scope === 'all'
      ? 'sur tout le panier'
      : form.scope === 'products'
        ? `sur ${form.product_ids.length} produit${form.product_ids.length > 1 ? 's' : ''}`
        : `sur ${form.category_ids.length} catégorie${form.category_ids.length > 1 ? 's' : ''}`

  return (
    <div className="rounded-card border-2 border-dashed border-brand-500/40 bg-gradient-to-br from-brand-50 to-white p-5">
      <p className="font-mono text-xl font-bold text-ink-900 tracking-wide">
        {form.code || 'CODE'}
      </p>

      <div className="my-3 border-t border-dashed border-surface-border" />

      <p className="text-sm font-medium text-ink-900">
        {discountLabel} {scopeLabel}
      </p>

      {form.minimum_amount !== '' && (
        <p className="text-xs text-ink-600 mt-1.5">
          Minimum : {formatCurrency(Number(form.minimum_amount))}
        </p>
      )}

      {form.expires_at && (
        <p className="text-xs text-ink-600 mt-1.5">
          Valide jusqu'au {formatDate(form.expires_at)}
        </p>
      )}

      {form.usage_limit !== '' && (
        <p className="text-xs text-ink-600 mt-1.5">
          Limité à {form.usage_limit} utilisations
        </p>
      )}
    </div>
  )
}

/* ================================================================
   Product picker
   ================================================================ */
function ProductPicker({ value, onChange }) {
  const [search, setSearch] = useState('')
  const debounced = useDebounced(search, 300)

  const { data: allForResolve } = useAdminProducts({ limit: 100 })
  const { data: results } = useAdminProducts({
    search: debounced || undefined,
    limit: 8,
  })

  const selectedSet = new Set(value)

  const resolved = useMemo(() => {
    if (!allForResolve) return []
    return value
      .map((id) => allForResolve.items?.find((p) => p.id === id))
      .filter(Boolean)
  }, [allForResolve, value])

  const add = (id) => {
    if (selectedSet.has(id)) return
    onChange([...value, id])
    setSearch('')
  }
  const remove = (id) => onChange(value.filter((x) => x !== id))

  const showResults = debounced && results?.items?.length > 0

  return (
    <div>
      <label className="label">Produits concernés</label>

      {resolved.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-3">
          {resolved.map((p) => (
            <span
              key={p.id}
              className="inline-flex items-center gap-1.5 pl-2.5 pr-1 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium"
            >
              {p.name}
              <button
                type="button"
                onClick={() => remove(p.id)}
                aria-label="Retirer"
                className="w-4 h-4 rounded-full hover:bg-brand-500/20 flex items-center justify-center"
              >
                <X size={11} />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <LuSearch
          size={15}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none z-10"
        />
        <Input
          id="product-search"
          className="input pl-9"
          placeholder="Chercher un produit à ajouter…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {showResults && (
        <div className="mt-2 card overflow-hidden max-h-64 overflow-y-auto">
          <ul className="divide-y divide-surface-border">
            {results.items.map((p) => (
              <li key={p.id}>
                <button
                  type="button"
                  onClick={() => add(p.id)}
                  disabled={selectedSet.has(p.id)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left hover:bg-surface-subtle disabled:opacity-50 transition-colors"
                >
                  <div className="w-9 h-9 rounded-control bg-surface-subtle border border-surface-border overflow-hidden shrink-0">
                    {p.primary_image ? (
                      <img
                        src={p.primary_image}
                        alt=""
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-400 text-xs">
                        —
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">
                      {p.name}
                    </p>
                    <p className="text-xs text-ink-600">
                      {formatCurrency(p.price)}
                    </p>
                  </div>
                  {selectedSet.has(p.id) && (
                    <span className="text-xs text-success shrink-0">Ajouté</span>
                  )}
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Category picker
   ================================================================ */
function CategoryPicker({ value, onChange }) {
  const { data: categories, isLoading } = useCategories()
  const selectedSet = new Set(value)

  const toggle = (id) => {
    onChange(
      selectedSet.has(id) ? value.filter((x) => x !== id) : [...value, id]
    )
  }

  return (
    <div>
      <label className="label">Catégories concernées</label>

      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-64 overflow-y-auto">
          {(categories ?? []).map((c) => {
            const active = selectedSet.has(c.id)
            return (
              <button
                key={c.id}
                type="button"
                onClick={() => toggle(c.id)}
                aria-pressed={active}
                className={`text-left rounded-control border px-3 py-2.5 transition-colors ${
                  active
                    ? 'border-brand-500 bg-brand-50 text-brand-700'
                    : 'border-surface-border hover:border-brand-500 text-ink-900'
                }`}
              >
                <span className="text-sm font-medium">{c.name}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Skeleton
   ================================================================ */
function FormSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-56 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-52 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </>
  )
}