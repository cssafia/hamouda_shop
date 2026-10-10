// src/pages/admin/Products/ProductForm.jsx
import { useState, useEffect, useMemo } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Package, Layers, Boxes, Sparkles, Info } from 'lucide-react'

import {
  useAdminProduct,
  useCreateProduct,
  useUpdateProduct,
} from '../../../features/products/useAdminProducts'
import { validateProduct, cleanSpecs } from '../../../features/products/validation'

import { useCategories } from '../../../features/categories/useCategories'
import { useCreateCategory } from '../../../features/categories/useAdminCategories'
import { useBrands } from '../../../features/brands/useBrands'
import { useCreateBrand } from '../../../features/brands/useAdminBrands'

import { USAGES, CONDITIONS } from '../../../constants/product'
import { getSpecTemplate } from '../../../constants/specTemplates'

import PageHeader from '../../../components/ui/PageHeader'
import Field from '../../../components/ui/Field'
import Select from '../../../components/ui/Select'
import Textarea from '../../../components/ui/Textarea'
import ChipGroup from '../../../components/ui/ChipGroup'
import Switch from '../../../components/ui/Switch'
import Button from '../../../components/ui/Button'
import Skeleton from '../../../components/ui/Skeleton'
import EntityPicker from '../../../components/ui/EntityPicker'
import { toast } from '../../../components/ui/Toast'

import SpecsEditor from '../../../components/product/SpecsEditor'
import ImageDropzone from '../../../components/product/ImageDropzone'
import VariantsEditor from '../../../components/product/VariantsEditor'

const BASE_PATH = '/admin/products'

const EMPTY = {
  name: '',
  description: '',
  category_id: '',
  brand_id: '',
  price: '',
  promotional_price: '',
  profit: '',
  hasVariants: false,
  stock_mode: null,
  stock_quantity: '',
  specifications: [],
  variants: [],
  is_active: true,
  condition: '',
  color: '',
  included_accessories: '',
  usages: [],
}

const MODE_OPTIONS = [
  {
    value: 'single',
    title: 'One version',
    subtitle: 'Single price, single stock.',
    Icon: Package,
  },
  {
    value: 'per_variant',
    title: 'Versions · own stock each',
    subtitle: 'Base is the default; each variant tracks its own stock.',
    Icon: Layers,
  },
  {
    value: 'shared',
    title: 'Versions · shared stock',
    subtitle: 'One pool — any variant sale deducts from it.',
    Icon: Boxes,
  },
]

/**
 * Dynamic label/hint for the base stock input per mode.
 * Base stock is ALWAYS required — only its meaning changes.
 */
const STOCK_META = {
  single: {
    label: 'Quantity in stock',
    hint: 'Total units available for this product.',
  },
  shared: {
    label: 'Shared stock pool',
    hint: 'Any variant sale deducts from this single pool.',
  },
  per_variant: {
    label: 'Default configuration stock',
    hint: 'The base product is one of the options. Each variant below carries its own stock.',
  },
}

function currentMode(form) {
  if (!form.hasVariants) return 'single'
  return form.stock_mode ?? 'per_variant'
}

export default function ProductForm() {
  const { id } = useParams()
  const isEdit = Boolean(id)
  const navigate = useNavigate()

  const { data: existing, isLoading: isLoadingExisting } = useAdminProduct(id)
  const createProduct = useCreateProduct()
  const updateProduct = useUpdateProduct(id)

  const [form, setForm] = useState(EMPTY)
  const [errors, setErrors] = useState({})
  const [topError, setTopError] = useState('')

  const [images, setImages] = useState([])
  const [keepUrls, setKeepUrls] = useState([])
  const [primaryIndex, setPrimaryIndex] = useState(0)

  const { data: catList, isLoading: catLoading } = useCategories()
  const createCategory = useCreateCategory()
  const categoryOptions = useMemo(
    () => (catList ?? []).map((c) => ({ value: c.id, label: c.name })),
    [catList]
  )

  const { data: brandList, isLoading: brandLoading } = useBrands(form.category_id || undefined)
  const createBrand = useCreateBrand()
  const brandOptions = useMemo(
    () => (brandList ?? []).map((b) => ({ value: b.id, label: b.name })),
    [brandList]
  )

  /* -------- hydrate on edit -------- */
  useEffect(() => {
    if (!isEdit || !existing) return
    setForm({
      name: existing.name ?? '',
      description: existing.description ?? '',
      category_id: existing.category_id ?? '',
      brand_id: existing.brand_id ?? '',
      price: existing.price ?? '',
      promotional_price: existing.promotional_price ?? '',
      profit: existing.profit ?? '',
      hasVariants: existing.variants?.length > 0,
      stock_mode: existing.stock_mode ?? null,
      stock_quantity: existing.stock_quantity ?? '',
      specifications: (existing.specifications ?? []).map((s) => ({
        name: s.name, value: s.value, display_order: s.display_order ?? 0,
      })),
      variants: (existing.variants ?? []).map((v) => ({
        name: v.name,
        price: v.price,
        promotional_price: v.promotional_price ?? '',
        profit: v.profit ?? '',
        stock_quantity: v.stock_quantity ?? '',
        overrides: (v.overrides ?? []).map((o) => ({ name: o.name, value: o.value })),
      })),
      is_active: existing.is_active ?? true,
      condition: existing.condition ?? '',
      color: existing.color ?? '',
      included_accessories: existing.included_accessories ?? '',
      usages: existing.usages ?? [],
    })
    setKeepUrls((existing.images ?? []).map((i) => i.url))
    setPrimaryIndex(Math.max(0, (existing.images ?? []).findIndex((i) => i.is_primary)))
  }, [isEdit, existing])

  const set = (key, val) => setForm((f) => ({ ...f, [key]: val }))
  const isPending = createProduct.isPending || updateProduct.isPending

  const selectMode = (mode) => {
    if (mode === 'single') {
      setForm((f) => ({ ...f, hasVariants: false, stock_mode: null }))
    } else {
      setForm((f) => ({ ...f, hasVariants: true, stock_mode: mode }))
    }
  }

  /* -------- category change: auto-apply template specs if empty -------- */
  const handleCategoryChange = (e) => {
    const newCatId = e.target.value
    const newCat = categoryOptions.find((c) => String(c.value) === String(newCatId))
    set('category_id', newCatId)
    set('brand_id', '')

    if (form.specifications.length === 0 && newCat?.label) {
      const template = getSpecTemplate(newCat.label)
      if (template.length) {
        set('specifications', template)
        toast.success(`Loaded ${template.length} default specs for "${newCat.label}"`)
      }
    }
  }

  const loadTemplateSpecs = () => {
    const cat = categoryOptions.find((c) => String(c.value) === String(form.category_id))
    if (!cat?.label) {
      toast.error('Pick a category first.')
      return
    }
    const template = getSpecTemplate(cat.label)
    if (!template.length) {
      toast.error(`No template available for "${cat.label}".`)
      return
    }
    if (form.specifications.length > 0) {
      if (!window.confirm(`Replace current specs with the "${cat.label}" template?`)) return
    }
    set('specifications', template)
    toast.success(`Loaded ${template.length} default specs.`)
  }

  const scrollToFirstError = (v) => {
    const firstKey = Object.keys(v)[0]
    const tryScroll = () =>
      document.querySelector(`[data-error-key="${firstKey}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' })
    if (firstKey.startsWith('variants.')) setTimeout(tryScroll, 150)
    else tryScroll()
  }

  const onSubmit = async (e) => {
    e.preventDefault()
    setTopError('')

    const v = validateProduct(form)
    if (Object.keys(v).length) {
      setErrors(v)
      scrollToFirstError(v)
      return
    }
    setErrors({})

    try {
      const hasVariants = Boolean(form.hasVariants)
      const stockMode = hasVariants ? form.stock_mode ?? 'per_variant' : null

      const data = {
        product_type: 'physical',
        name: form.name.trim(),
        description: form.description.trim() || null,
        category_id: Number(form.category_id),
        brand_id: form.brand_id ? Number(form.brand_id) : null,
        price: Number(form.price) || 0,
        promotional_price: form.promotional_price === '' ? null : Number(form.promotional_price),
        profit: form.profit === '' ? 0 : Number(form.profit),
        specifications: cleanSpecs(form.specifications),
        is_active: form.is_active ?? true,

        primary_image_index: primaryIndex,
        image_order: Array.from(
          { length: keepUrls.length + images.length },
          (_, i) => i
        ),

        // Base stock is always sent now.
        stock_mode: hasVariants ? stockMode : null,
        stock_quantity: Number(form.stock_quantity) || 0,

        condition: form.condition || null,
        color: form.color.trim() || null,
        included_accessories: form.included_accessories.trim() || null,
        usages: form.usages,
      }

      if (isEdit) data.keep_image_urls = keepUrls

      data.variants = hasVariants
        ? form.variants.map((vv) => {
            const base = {
              name: vv.name.trim(),
              price: Number(vv.price) || 0,
              promotional_price: vv.promotional_price === '' ? null : Number(vv.promotional_price),
              profit: vv.profit === '' ? null : Number(vv.profit),
            }
            if (stockMode === 'per_variant') base.stock_quantity = Number(vv.stock_quantity) || 0
            base.overrides = (vv.overrides ?? [])
              .filter((o) => o.name && o.value?.trim())
              .map((o) => ({ name: o.name, value: o.value.trim() }))
            return base
          })
        : []

      if (isEdit) await updateProduct.mutateAsync({ data, images })
      else await createProduct.mutateAsync({ data, images })

      toast.success(isEdit ? 'Product saved.' : 'Product created.')
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

  const mode = currentMode(form)
  const stockMeta = STOCK_META[mode]

  const selectedCategoryLabel = categoryOptions.find(
    (c) => String(c.value) === String(form.category_id)
  )?.label

  return (
    <form onSubmit={onSubmit} className="pb-32 lg:pb-0">
      <Link
        to={isEdit ? `${BASE_PATH}/${id}` : BASE_PATH}
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mb-4"
      >
        <ArrowLeft size={16} /> {isEdit ? 'Back to product' : 'Products'}
      </Link>

      <PageHeader
        title={isEdit ? 'Edit product' : 'New product'}
        description={isEdit ? 'Update the product details.' : 'Add a new physical product to your catalog.'}
      />

      {topError && (
        <div className="mb-5 rounded-control border border-danger/30 bg-danger/5 px-4 py-3 text-sm text-danger">
          {topError}
        </div>
      )}

      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-3 lg:items-start">
        <div className="contents lg:col-span-2 lg:row-start-1 lg:block lg:space-y-5">

          {/* 1 · BASICS */}
          <FormSection title="Basics" className="order-1 lg:order-none">
            <div data-error-key="name">
              <Field label="Name" htmlFor="name" required error={errors.name}>
                <input
                  id="name" className="input"
                  value={form.name}
                  onChange={(e) => set('name', e.target.value)}
                  placeholder="Dell Latitude 5300"
                />
              </Field>
            </div>

            <Field label="Description" htmlFor="description">
              <Textarea
                id="description"
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                placeholder="Refurbished business laptop in excellent condition…"
              />
            </Field>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div data-error-key="category_id">
                <EntityPicker
                  id="category_id" label="Category" required
                  error={errors.category_id}
                  options={categoryOptions} isLoading={catLoading}
                  value={form.category_id}
                  onChange={handleCategoryChange}
                  includeAll={false} placeholder="Choose…"
                  allowAdd addTitle="New category"
                  addFields={[{ name: 'name', label: 'Name', required: true, placeholder: 'Laptops', autoFocus: true }]}
                  onAdd={(values) => createCategory.mutateAsync({ name: values.name.trim() })}
                  onCreated={(c) => {
                    set('category_id', c.id)
                    if (form.specifications.length === 0) {
                      const tpl = getSpecTemplate(c.name)
                      if (tpl.length) set('specifications', tpl)
                    }
                  }}
                />
              </div>

              <EntityPicker
                id="brand_id" label="Brand"
                options={brandOptions} isLoading={brandLoading}
                value={form.brand_id}
                onChange={(e) => set('brand_id', e.target.value)}
                includeAll={false} placeholder="Choose…"
                allowAdd addTitle="New brand"
                addFields={[{ name: 'name', label: 'Name', required: true, placeholder: 'Dell', autoFocus: true }]}
                onAdd={(values) => createBrand.mutateAsync({ name: values.name.trim() })}
                onCreated={(b) => set('brand_id', b.id)}
              />
            </div>
          </FormSection>

          {/* 2 · IMAGES */}
          <FormSection
            title="Images"
            className="order-2 lg:order-none lg:col-start-3 lg:row-start-1"
          >
            <ImageDropzone
              files={images} existingUrls={keepUrls} primaryIndex={primaryIndex}
              onFilesChange={setImages}
              onExistingUrlsChange={setKeepUrls}
              onPrimaryIndexChange={setPrimaryIndex}
            />
          </FormSection>

          {/* 3 · PHYSICAL DETAILS */}
          <FormSection title="Physical details" className="order-3 lg:order-none">
            <PhysicalDetails form={form} set={set} />
          </FormSection>

          {/* 4 · PRICING */}
          <FormSection
            title="Base pricing"
            className="order-4 lg:order-none"
            subtitle={form.hasVariants ? 'Reference price — each variant can override.' : undefined}
          >
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div data-error-key="price">
                <Field label="Price" htmlFor="price" required error={errors.price}>
                  <input
                    id="price" className="input" type="number" min="0"
                    value={form.price}
                    onChange={(e) => set('price', e.target.value)}
                  />
                </Field>
              </div>

              <div data-error-key="promotional_price">
                <Field
                  label="Promo price" htmlFor="promo"
                  error={errors.promotional_price}
                  hint="Optional. Must be below the price."
                >
                  <input
                    id="promo" className="input" type="number" min="0"
                    value={form.promotional_price}
                    onChange={(e) => set('promotional_price', e.target.value)}
                  />
                </Field>
              </div>
            </div>

            <Field label="Profit" htmlFor="profit" hint="Internal only — never shown to clients.">
              <input
                id="profit" className="input" type="number" min="0"
                value={form.profit}
                onChange={(e) => set('profit', e.target.value)}
              />
            </Field>
          </FormSection>

          {/* 5 · SPECS */}
          <FormSection
            title="Specifications"
            className="order-5 lg:order-none"
            subtitle={
              form.hasVariants
                ? 'Shared specs. Each variant overrides only what differs.'
                : 'Detailed specs shown on the product page.'
            }
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 -mt-1">
              <p className="text-xs text-ink-500">
                {selectedCategoryLabel
                  ? `Tip: load default fields for "${selectedCategoryLabel}".`
                  : 'Pick a category to auto-load its default fields.'}
              </p>
              <button
                type="button"
                onClick={loadTemplateSpecs}
                disabled={!form.category_id}
                className="inline-flex items-center gap-1.5 rounded-control border border-brand-500/40 bg-brand-50 px-3 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100 disabled:opacity-40 disabled:cursor-not-allowed transition-colors self-start sm:self-auto"
              >
                <Sparkles size={14} aria-hidden="true" />
                Load template
              </button>
            </div>

            <div data-section="specs">
              <SpecsEditor
                value={form.specifications}
                onChange={(s) => set('specifications', s)}
                emptyHint="No specifications yet."
              />
            </div>
          </FormSection>

          {/* 6 · STOCK / VARIANTS */}
          <FormSection
            title={form.hasVariants ? 'Versions & stock' : 'Stock'}
            className="order-6 lg:order-none"
          >
            {/* Mode selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {MODE_OPTIONS.map(({ value, title, subtitle, Icon }) => (
                <ModeCard
                  key={value}
                  active={mode === value}
                  onClick={() => selectMode(value)}
                  title={title}
                  subtitle={subtitle}
                  Icon={Icon}
                />
              ))}
            </div>

            {/* Base stock — always visible; label and hint adapt to mode */}
            <div data-error-key="stock_quantity">
              <Field
                label={stockMeta.label}
                htmlFor="base-stock"
                required
                error={errors.stock_quantity}
                hint={stockMeta.hint}
              >
                <input
                  id="base-stock" className="input" type="number" min="0"
                  value={form.stock_quantity}
                  onChange={(e) => set('stock_quantity', e.target.value)}
                  placeholder="0"
                />
              </Field>
            </div>

            {/* Per-variant helper callout */}
            {form.hasVariants && form.stock_mode === 'per_variant' && (
              <div className="flex items-start gap-2 rounded-control border border-surface-border bg-surface-subtle px-3 py-2 text-xs text-ink-600">
                <Info size={14} className="shrink-0 mt-0.5 text-ink-400" aria-hidden="true" />
                <span>
                  Each variant below tracks its own stock.
                  Total stock = base + sum of variants.
                </span>
              </div>
            )}

            {/* Variants editor */}
            {form.hasVariants && (
              <div data-error-key="variants">
                <VariantsEditor
                  stockMode={form.stock_mode}
                  baseSpecs={form.specifications}
                  value={form.variants}
                  onChange={(vv) => set('variants', vv)}
                  errors={errors}
                />
                {errors.variants && <p className="form-error mt-2">{errors.variants}</p>}
              </div>
            )}

            {form.hasVariants && form.variants.length > 0 && (
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Remove all variants? This cannot be undone.'))
                    set('variants', [])
                }}
                className="text-xs text-ink-500 hover:text-danger"
              >
                Remove all variants
              </button>
            )}
          </FormSection>
        </div>

        {isEdit && (
          <FormSection
            title="Status"
            className="order-7 lg:order-none lg:col-start-3 lg:row-start-2"
          >
            <Switch
              checked={form.is_active}
              onChange={(v) => set('is_active', v)}
              label={form.is_active ? 'Active' : 'Inactive'}
            />
            <p className="text-xs text-ink-600 mt-2">
              Inactive products are hidden from the storefront.
            </p>
          </FormSection>
        )}

        <div className="hidden lg:flex lg:col-start-3 lg:row-start-3 lg:self-start gap-2">
          <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">
            Cancel
          </Button>
          <Button type="submit" loading={isPending} className="flex-1">
            {isEdit ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </div>

      {/* Mobile sticky footer */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-40 bg-white/95 backdrop-blur border-t border-surface-border px-4 py-3 flex gap-2 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <Button type="button" variant="secondary" onClick={() => navigate(-1)} className="flex-1">
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
      <header className="px-4 sm:px-5 py-3.5 border-b border-surface-border">
        <h2 className="font-medium text-ink-900">{title}</h2>
        {subtitle && <p className="text-xs text-ink-600 mt-0.5">{subtitle}</p>}
      </header>
      <div className="p-4 sm:p-5 space-y-4">{children}</div>
    </section>
  )
}

function ModeCard({ active, onClick, title, subtitle, Icon }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`text-left rounded-control border p-3.5 transition-colors ${
        active ? 'border-brand-500 bg-brand-50' : 'border-surface-border hover:border-brand-500'
      }`}
    >
      <div className="flex items-start gap-2.5">
        {Icon && (
          <Icon size={18} className={`shrink-0 mt-0.5 ${active ? 'text-brand-600' : 'text-ink-500'}`} />
        )}
        <div className="min-w-0">
          <p className={`text-sm font-medium ${active ? 'text-brand-700' : 'text-ink-900'}`}>{title}</p>
          <p className="text-xs text-ink-600 mt-0.5">{subtitle}</p>
        </div>
      </div>
    </button>
  )
}

function PhysicalDetails({ form, set }) {
  const [showUsages, setShowUsages] = useState((form.usages ?? []).length > 0)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <Field label="Condition" htmlFor="condition">
          <Select
            id="condition"
            value={form.condition}
            onChange={(e) => set('condition', e.target.value)}
          >
            <option value="">Not specified</option>
            {CONDITIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </Select>
        </Field>

        <Field label="Color" htmlFor="color">
          <input
            id="color" className="input"
            value={form.color}
            onChange={(e) => set('color', e.target.value)}
            placeholder="Silver"
          />
        </Field>
      </div>

      <Field label="Included accessories" htmlFor="acc">
        <input
          id="acc" className="input"
          value={form.included_accessories}
          onChange={(e) => set('included_accessories', e.target.value)}
          placeholder="Charger, sleeve"
        />
      </Field>

      {!showUsages ? (
        <button
          type="button"
          onClick={() => setShowUsages(true)}
          className="inline-flex items-center gap-1.5 text-sm font-medium text-brand-600 hover:text-brand-700"
        >
          + Add usage categories
        </button>
      ) : (
        <Field label="Usages" hint="Select the scenarios this product is suitable for.">
          <ChipGroup
            options={USAGES}
            value={form.usages}
            onChange={(v) => set('usages', v)}
          />
          <button
            type="button"
            onClick={() => { set('usages', []); setShowUsages(false) }}
            className="mt-2 text-xs text-ink-500 hover:text-danger"
          >
            Remove usages
          </button>
        </Field>
      )}
    </>
  )
}

function FormSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-24 mb-4" />
      <Skeleton className="h-8 w-56 mb-6" />
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-64 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </>
  )
}