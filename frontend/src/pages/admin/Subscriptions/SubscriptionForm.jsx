// src/pages/admin/Subscriptions/SubscriptionForm.jsx
import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import {
  ArrowLeft, ChevronDown, Plus, Trash2, CalendarClock,
} from 'lucide-react'

import { useAdminProduct } from '../../../features/products/useAdminProducts'
import {
  useCreateSubscription,
  useUpdateSubscription,
} from '../../../features/subscriptions/useAdminSubscriptions'
import { validateSubscription } from '../../../features/subscriptions/validation'

import { useCategories } from '../../../features/categories/useCategories'
import { useCreateCategory } from '../../../features/categories/useAdminCategories'
import { useBrands } from '../../../features/brands/useBrands'
import { useCreateBrand } from '../../../features/brands/useAdminBrands'

import { DURATIONS } from '../../../constants/product'

import PageHeader from '../../../components/ui/PageHeader'
import Field from '../../../components/ui/Field'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'
import Switch from '../../../components/ui/Switch'
import Button from '../../../components/ui/Button'
import Skeleton from '../../../components/ui/Skeleton'
import EntityPicker from '../../../components/ui/EntityPicker'
import { toast } from '../../../components/ui/Toast'
import ImageDropzone from '../../../components/product/ImageDropzone'

const BASE_PATH = '/admin/subscriptions'

const EMPTY = {
  name: '',
  description: '',
  category_id: '',
  brand_id: '',
  is_active: true,

  /* base plan — always required */
  duration: '',
  price: '',
  promotional_price: '',
  profit: '',

  /* extra plans — optional, additive */
  variants: [],
}

const emptyExtraPlan = () => ({
  duration: '',
  price: '',
  promotional_price: '',
  profit: '',
})

export default function SubscriptionForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const { data: existing, isLoading: isLoadingExisting } = useAdminProduct(id)
  const createSub = useCreateSubscription()
  const updateSub = useUpdateSubscription(id)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [topError, setTopError] = useState('')

  const [images, setImages] = useState([])
  const [keepUrls, setKeepUrls] = useState([])
  const [primaryIndex, setPrimaryIndex] = useState(0)

  /* ---------- categories ---------- */
  const { data: catList, isLoading: catLoading } = useCategories()
  const createCategory = useCreateCategory()
  const categoryOptions = useMemo(
    () => (catList ?? []).map((c) => ({ value: c.id, label: c.name })),
    [catList]
  )

  /* ---------- brands (filtered by category) ---------- */
  const { data: brandList, isLoading: brandLoading } = useBrands(
    form.category_id || undefined
  )
  const createBrand = useCreateBrand()
  const brandOptions = useMemo(
    () => (brandList ?? []).map((b) => ({ value: b.id, label: b.name })),
    [brandList]
  )

  /* ---------- hydrate on edit ---------- */
  useEffect(() => {
    if (!isEdit || !existing) return

    setForm({
      name: existing.name ?? '',
      description: existing.description ?? '',
      category_id: existing.category_id ?? '',
      brand_id: existing.brand_id ?? '',
      is_active: existing.is_active ?? true,

      // base plan
      duration: existing.duration ?? '',
      price: existing.price ?? '',
      promotional_price: existing.promotional_price ?? '',
      profit: existing.profit ?? '',

      // extra plans (all variants here are the extras)
      variants: (existing.variants ?? []).map((v) => ({
        duration: v.duration ?? v.name ?? '',
        price: v.price ?? '',
        promotional_price: v.promotional_price ?? '',
        profit: v.profit ?? '',
      })),
    })

    setKeepUrls((existing.images ?? []).map((i) => i.url))
    setPrimaryIndex(
      Math.max(0, (existing.images ?? []).findIndex((i) => i.is_primary))
    )
  }, [isEdit, existing])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const isPending = createSub.isPending || updateSub.isPending

  /* ---------- extra plan helpers ---------- */
  const addExtraPlan = () =>
    set('variants', [...form.variants, emptyExtraPlan()])
  const updateExtraPlan = (i, patch) =>
    set(
      'variants',
      form.variants.map((p, idx) => (idx === i ? { ...p, ...patch } : p))
    )
  const removeExtraPlan = (i) =>
    set('variants', form.variants.filter((_, idx) => idx !== i))

  /* ---------- scroll to first error ---------- */
  const scrollToFirstError = (v) => {
    const firstKey = Object.keys(v)[0]
    const tryScroll = () =>
      document
        .querySelector(`[data-error-key="${firstKey}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (firstKey.startsWith('variants.')) setTimeout(tryScroll, 150)
    else tryScroll()
  }

  /* ---------- submit ---------- */
  const onSubmit = async (e) => {
    e.preventDefault()
    setTopError('')

    const v = validateSubscription(form)
    if (Object.keys(v).length) {
      setErrors(v)
      scrollToFirstError(v)
      return
    }
    setErrors({})

    try {
      const data = {
        category_id: Number(form.category_id),
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        name: form.name.trim(),
        description: form.description.trim() || null,

        // base plan
        duration: form.duration,
        price: Number(form.price) || 0,
        promotional_price:
          form.promotional_price === '' ? null : Number(form.promotional_price),
        profit: Number(form.profit) || 0,

        is_active: form.is_active ?? true,

        primary_image_index: primaryIndex,
        image_order: Array.from(
          { length: keepUrls.length + images.length },
          (_, i) => i
        ),

        // extra plans
        variants: form.variants.map((p) => ({
          duration: p.duration,
          price: Number(p.price) || 0,
          promotional_price:
            p.promotional_price === '' ? null : Number(p.promotional_price),
          profit: p.profit === '' ? null : Number(p.profit),
        })),
      }

      if (isEdit) data.keep_image_urls = keepUrls

      if (isEdit) await updateSub.mutateAsync({ data, images })
      else await createSub.mutateAsync({ data, images })

      toast.success(isEdit ? 'Subscription saved.' : 'Subscription created.')
      navigate(BASE_PATH)
    } catch (err) {
      if (err.details?.length) {
        const mapped = {}
        err.details.forEach((d) => { mapped[d.field] = d.msg })
        setErrors(mapped)
        scrollToFirstError(mapped)
      } else {
        setTopError(err.message || 'Failed to save')
      }
    }
  }

  if (isEdit && isLoadingExisting) return <FormSkeleton />

  const hasExtras = form.variants.length > 0

  return (
    <form onSubmit={onSubmit} className="pb-28 lg:pb-0">
      <Link
        to={isEdit ? `${BASE_PATH}/${id}` : BASE_PATH}
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mb-4"
      >
        <ArrowLeft size={16} /> {isEdit ? 'Back to subscription' : 'Subscriptions'}
      </Link>

      <PageHeader
        title={isEdit ? 'Edit subscription' : 'New subscription'}
        description={
          isEdit
            ? 'Update the subscription details.'
            : 'Add a new subscription to your catalog.'
        }
      />

      {topError && (
        <div className="mb-5 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {topError}
        </div>
      )}

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:items-start">
        <div className="contents lg:col-span-2 lg:row-start-1 lg:block lg:space-y-5">

          {/* ---- 1 · BASICS ---- */}
          <FormSection title="Basics" className="order-1 lg:order-none">
            <div data-error-key="name">
              <Field label="Name" htmlFor="name" required error={errors.name}>
                <input
                  id="name"
                  className="input"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="ChatGPT Plus"
                />
              </Field>
            </div>

            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Shared account, activated within 24 hours."
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div data-error-key="category_id">
                <EntityPicker
                  id="category_id"
                  label="Category"
                  required
                  error={errors.category_id}
                  options={categoryOptions}
                  isLoading={catLoading}
                  value={form.category_id}
                  onChange={(e) => {
                    set('category_id', e.target.value)
                    set('brand_id', '')
                  }}
                  includeAll={false}
                  placeholder="Choose…"
                  allowAdd
                  addTitle="New category"
                  addFields={[
                    { name: 'name', label: 'Name', required: true, placeholder: 'Subscriptions', autoFocus: true },
                  ]}
                  onAdd={(values) => createCategory.mutateAsync({ name: values.name.trim() })}
                  onCreated={(c) => set('category_id', c.id)}
                />
              </div>

              <EntityPicker
                id="brand_id"
                label="Brand"
                options={brandOptions}
                isLoading={brandLoading}
                value={form.brand_id}
                onChange={(e) => set('brand_id', e.target.value)}
                includeAll={false}
                placeholder="Choose…"
                allowAdd
                addTitle="New brand"
                addFields={[
                  { name: 'name', label: 'Name', required: true, placeholder: 'OpenAI', autoFocus: true },
                ]}
                onAdd={(values) => createBrand.mutateAsync({ name: values.name.trim() })}
                onCreated={(b) => set('brand_id', b.id)}
              />
            </div>
          </FormSection>

          {/* ---- 2 · IMAGES (mobile: right after Basics) ---- */}
          <FormSection
            title="Images"
            className="order-2 lg:order-none lg:col-start-3 lg:row-start-1"
          >
            <ImageDropzone
              files={images}
              existingUrls={keepUrls}
              primaryIndex={primaryIndex}
              onFilesChange={setImages}
              onExistingUrlsChange={setKeepUrls}
              onPrimaryIndexChange={setPrimaryIndex}
            />
          </FormSection>

          {/* ---- 3 · BASE PLAN (always required) ---- */}
          <FormSection
            title="Base plan"
            subtitle="What customers see first — the default duration and price."
            className="order-3 lg:order-none"
          >
            <div data-error-key="duration">
              <Field label="Duration" htmlFor="duration" required error={errors.duration}>
                <Select
                  id="duration"
                  value={form.duration}
                  onChange={(e) => set('duration', e.target.value)}
                >
                  <option value="">Choose…</option>
                  {DURATIONS.map((d) => (
                    <option key={d} value={d}>{d}</option>
                  ))}
                </Select>
              </Field>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div data-error-key="price">
                <Field label="Price" required error={errors.price}>
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                  />
                </Field>
              </div>

              <div data-error-key="promotional_price">
                <Field
                  label="Promo price"
                  error={errors.promotional_price}
                  hint="Optional. Must be below the price."
                >
                  <input
                    className="input"
                    type="number"
                    min="0"
                    value={form.promotional_price}
                    onChange={(e) => set('promotional_price', e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <div data-error-key="profit">
              <Field
                label="Profit"
                required
                error={errors.profit}
                hint="Internal only. New extra plans inherit this value."
              >
                <input
                  className="input"
                  type="number"
                  min="0"
                  value={form.profit}
                  onChange={(e) => set('profit', e.target.value)}
                />
              </Field>
            </div>
          </FormSection>

          {/* ---- 4 · EXTRA PLANS (optional, additive) ---- */}
          <FormSection
            title="Extra plans"
            subtitle="Optional. Add more durations on top of the base plan."
            className="order-4 lg:order-none"
          >
            {!hasExtras && (
              <div className="flex items-start gap-3 rounded-control border border-dashed border-surface-border px-4 py-3">
                <CalendarClock size={18} className="shrink-0 mt-0.5 text-ink-400" />
                <div>
                  <p className="text-sm text-ink-900">
                    No extra plans yet.
                  </p>
                  <p className="text-xs text-ink-600 mt-0.5">
                    Customers will only be able to buy the base plan.
                  </p>
                </div>
              </div>
            )}

            {hasExtras && (
              <div className="space-y-3">
                {form.variants.map((plan, i) => (
                  <ExtraPlanRow
                    key={i}
                    index={i}
                    plan={plan}
                    errors={errors}
                    onPatch={(p) => updateExtraPlan(i, p)}
                    onRemove={() => removeExtraPlan(i)}
                  />
                ))}
              </div>
            )}

            <button
              type="button"
              onClick={addExtraPlan}
              className="btn-secondary inline-flex items-center gap-1.5 text-sm"
            >
              <Plus size={16} /> Add extra plan
            </button>
          </FormSection>
        </div>

        {/* ---- STATUS (edit only) ---- */}
        {isEdit && (
          <FormSection
            title="Status"
            className="order-5 lg:order-none lg:col-start-3 lg:row-start-2"
          >
            <Switch
              checked={form.is_active}
              onChange={(v) => set('is_active', v)}
              label={form.is_active ? 'Active' : 'Inactive'}
            />
            <p className="text-xs text-ink-600 mt-2">
              Inactive subscriptions are hidden from the storefront.
            </p>
          </FormSection>
        )}

        {/* ---- Desktop save buttons ---- */}
        <div className="hidden lg:flex lg:col-start-3 lg:row-start-3 lg:self-start gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => navigate(-1)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" loading={isPending} className="flex-1">
            {isEdit ? 'Save changes' : 'Create subscription'}
          </Button>
        </div>
      </div>

      {/* ---- Mobile sticky save ---- */}
      <div className="lg:hidden fixed bottom-16 inset-x-0 z-30 bg-white border-t border-surface-border px-4 py-3 flex gap-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Button
          type="button"
          variant="secondary"
          onClick={() => navigate(-1)}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button type="submit" loading={isPending} className="flex-1">
          {isEdit ? 'Save' : 'Create'}
        </Button>
      </div>
    </form>
  )
}

/* ================================================================
   Local helpers
   ================================================================ */

function FormSection({ title, subtitle, children, className = '' }) {
  return (
    <section className={`card overflow-hidden ${className}`}>
      <header className="px-5 py-3.5 border-b border-surface-border">
        <h2 className="font-medium text-ink-900">{title}</h2>
        {subtitle && <p className="text-xs text-ink-600 mt-0.5">{subtitle}</p>}
      </header>
      <div className="p-5 space-y-4">{children}</div>
    </section>
  )
}

function ExtraPlanRow({ index, plan, errors, onPatch, onRemove }) {
  const key = (f) => `variants.${index}.${f}`
  const err = (f) => errors[key(f)]

  const hasError = Object.keys(errors).some((k) =>
    k.startsWith(`variants.${index}.`)
  )

  const [open, setOpen] = useState(!plan.duration)
  const [advanced, setAdvanced] = useState(
    Boolean(plan.profit && plan.profit !== '')
  )

  useEffect(() => {
    if (hasError) setOpen(true)
  }, [hasError])

  return (
    <div
      className={`rounded-control border bg-white ${
        hasError ? 'border-danger/50' : 'border-surface-border'
      }`}
    >
      {/* Header */}
      <div className="flex items-center gap-1 pr-2">
        <button
          type="button"
          onClick={() => setOpen((o) => !o)}
          aria-expanded={open}
          className="flex-1 flex items-center gap-2 px-3 py-2.5 text-left min-w-0"
        >
          <ChevronDown
            size={16}
            className={`shrink-0 text-ink-500 transition-transform ${
              open ? '' : '-rotate-90'
            }`}
          />
          <span className="text-sm font-medium text-ink-900 truncate">
            {plan.duration || `Extra plan ${index + 1}`}
          </span>
          {plan.price !== '' && !Number.isNaN(Number(plan.price)) && (
            <span className="text-xs text-ink-500 shrink-0">
              · {plan.price} DA
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={onRemove}
          aria-label="Remove extra plan"
          className="p-1.5 text-ink-400 hover:text-danger"
        >
          <Trash2 size={15} />
        </button>
      </div>

      {/* Body */}
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

          {/* Profit inherits from base unless explicitly set */}
          <div className="flex items-center justify-between rounded-control border border-surface-border px-3 py-2.5">
            <div>
              <p className="text-sm font-medium text-ink-900">
                Custom profit
              </p>
              <p className="text-xs text-ink-600">
                Inherits the base plan's profit unless set here.
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

function FormSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-56 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </>
  )
}