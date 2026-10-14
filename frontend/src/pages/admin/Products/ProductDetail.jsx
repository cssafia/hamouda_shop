// src/pages/admin/Products/ProductDetail.jsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Package,
  Tag,
  Percent,
  Boxes,
  Layers,
  ImageIcon,
  Sparkles,
  Power,
  PowerOff,
  Info,
} from 'lucide-react'

import {
  useAdminProduct,
  useToggleProductStatus,
} from '../../../features/products/useAdminProducts'
import { formatCurrency, discountPercent } from '../../../utils/format'
import { usageLabel } from '../../../constants/product'
import { toast } from '../../../components/ui/Toast'

import EmptyState from '../../../components/ui/EmptyState'
import StatusPill from '../../../components/ui/StatusPill'
import Skeleton from '../../../components/ui/Skeleton'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'
import SectionCard from '../../../components/ui/SectionCard'

export default function ProductDetail() {
  const { id } = useParams()
  const { data: product, isLoading, isError, error } = useAdminProduct(id)
  const toggleStatus = useToggleProductStatus(id)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isLoading) return <DetailSkeleton />

  if (isError || !product) {
    return (
      <EmptyState
        icon={Package}
        title="Couldn't load this product"
        description={error?.message || 'The product may have been removed.'}
        action={
          <Link to="/admin/products" className="btn-secondary">
            <ArrowLeft size={16} /> Back to products
          </Link>
        }
      />
    )
  }

  const isActive = product.is_active

  const handleToggleClick = () => {
    if (isActive) setConfirmOpen(true)
    else {
      toggleStatus.mutate(true, {
        onSuccess: () => toast.success('Product activated'),
        onError: (err) => toast.error('Failed to activate', { message: err.message }),
      })
    }
  }

  const confirmDeactivate = () => {
    toggleStatus.mutate(false, {
      onSuccess: () => {
        toast.success('Product deactivated')
        setConfirmOpen(false)
      },
      onError: (err) => {
        toast.error('Failed to deactivate', { message: err.message })
        setConfirmOpen(false)
      },
    })
  }

  return (
    <>
      <Link
        to="/admin/products"
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mb-4"
      >
        <ArrowLeft size={16} /> Products
      </Link>

      {/* ============ HEADER ============ */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <ProductThumb product={product} />

        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-xl lg:text-2xl font-semibold text-ink-900 truncate">
              {product.name}
            </h1>
            <StatusPill tone={isActive ? 'success' : 'neutral'}>
              {isActive ? 'Active' : 'Inactive'}
            </StatusPill>
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm text-ink-600">
            <span className="capitalize">{product.product_type}</span>
            {product.category?.name && (
              <>
                <span className="text-ink-400">·</span>
                <span>{product.category.name}</span>
              </>
            )}
            {product.brand?.name && (
              <>
                <span className="text-ink-400">·</span>
                <span>{product.brand.name}</span>
              </>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={handleToggleClick}
            disabled={toggleStatus.isPending}
            className={`inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 disabled:pointer-events-none ${
              isActive
                ? 'border border-surface-border bg-white text-ink-900 hover:border-danger/40 hover:text-danger'
                : 'bg-brand-500 text-white hover:bg-brand-600'
            }`}
          >
            {isActive ? <PowerOff size={16} /> : <Power size={16} />}
            <span className="hidden sm:inline">
              {isActive ? 'Deactivate' : 'Activate'}
            </span>
          </button>

          <Link to={`/admin/products/${product.id}/edit`} className="btn-primary">
            <Pencil size={16} />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </div>
      </div>

      {/* ============ BODY ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <aside className="order-1 lg:order-2 space-y-5">
          <PricingCard product={product} />
          <ImagesCard product={product} />
        </aside>

        <div className="order-2 lg:order-1 lg:col-span-2 space-y-5">
          <OverviewCard product={product} />
          <SpecsCard product={product} />
          <StockCard product={product} />
        </div>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => !toggleStatus.isPending && setConfirmOpen(false)}
        onConfirm={confirmDeactivate}
        title="Deactivate this product?"
        description={`"${product.name}" will be hidden from the storefront. You can reactivate it at any time.`}
        confirmLabel="Deactivate"
        cancelLabel="Keep active"
        variant="danger"
        loading={toggleStatus.isPending}
      />
    </>
  )
}

/* ================================================================
   Header thumb
   ================================================================ */
function ProductThumb({ product }) {
  const primary =
    (product.images ?? []).find((i) => i.is_primary) ?? product.images?.[0]

  return (
    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-card overflow-hidden border border-surface-border bg-surface-subtle shrink-0">
      {primary ? (
        <img src={primary.url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-ink-400">
          <Package size={24} />
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Cards
   ================================================================ */

function OverviewCard({ product }) {
  const rows = [
    ['Condition', product.condition],
    ['Color', product.color],
    ['Included accessories', product.included_accessories],
  ].filter(([, v]) => v)

  const usages = product.usages ?? []

  return (
    <SectionCard icon={Sparkles} title="Overview">
      {product.description ? (
        <p className="text-sm text-ink-700 whitespace-pre-line">{product.description}</p>
      ) : (
        <p className="text-sm text-ink-400 italic">No description.</p>
      )}

      {rows.length > 0 && (
        <dl className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 text-sm">
          {rows.map(([k, v]) => (
            <div key={k}>
              <dt className="text-ink-600">{k}</dt>
              <dd className="text-ink-900 font-medium mt-0.5">{v}</dd>
            </div>
          ))}
        </dl>
      )}

      {usages.length > 0 && (
        <div className="mt-5">
          <p className="text-sm text-ink-600 mb-2">Usages</p>
          <div className="flex flex-wrap gap-1.5">
            {usages.map((u) => (
              <span
                key={u}
                className="px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs font-medium"
              >
                {usageLabel(u)}
              </span>
            ))}
          </div>
        </div>
      )}
    </SectionCard>
  )
}

function PricingCard({ product }) {
  const hasPromo =
    product.promotional_price != null &&
    product.promotional_price < product.price
  const off = discountPercent(product.price, product.promotional_price)

  return (
    <SectionCard icon={Tag} title="Pricing">
      <div className="space-y-3">
        <div>
          <p className="text-xs text-ink-600 mb-1">Price</p>
          {hasPromo ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-2xl font-semibold text-ink-900">
                {formatCurrency(product.promotional_price)}
              </span>
              <span className="text-sm text-ink-400 line-through">
                {formatCurrency(product.price)}
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-medium text-success bg-success/10 px-2 py-0.5 rounded-full">
                <Percent size={12} /> -{off}%
              </span>
            </div>
          ) : (
            <p className="text-2xl font-semibold text-ink-900">
              {formatCurrency(product.price)}
            </p>
          )}
        </div>

        {product.profit != null && (
          <div className="pt-3 border-t border-surface-border">
            <p className="text-xs text-ink-600 mb-1">Profit (admin)</p>
            <p className="text-sm font-medium text-ink-900">
              {formatCurrency(product.profit)}
            </p>
          </div>
        )}
      </div>
    </SectionCard>
  )
}

function ImagesCard({ product }) {
  const images = product.images ?? []

  return (
    <SectionCard icon={ImageIcon} title={`Images (${images.length})`}>
      {images.length === 0 ? (
        <p className="text-sm text-ink-400 italic">No images.</p>
      ) : (
        <div className="grid grid-cols-3 gap-2">
          {images.map((img) => (
            <div
              key={img.id}
              className="relative aspect-square rounded-control overflow-hidden border border-surface-border bg-surface-subtle"
            >
              <img
                src={img.url}
                alt=""
                className="w-full h-full object-cover"
                loading="lazy"
              />
              {img.is_primary && (
                <span className="absolute top-1 left-1 px-1.5 py-0.5 text-[10px] font-semibold rounded bg-brand-500 text-white">
                  ★
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

function SpecsCard({ product }) {
  const specs = product.specifications ?? []

  return (
    <SectionCard icon={Layers} title="Specifications">
      {specs.length === 0 ? (
        <p className="text-sm text-ink-400 italic">No specifications.</p>
      ) : (
        <dl className="divide-y divide-surface-border -my-2">
          {specs.map((s) => (
            <div key={s.id} className="grid grid-cols-2 gap-4 py-2.5 text-sm">
              <dt className="text-ink-600">{s.name}</dt>
              <dd className="text-ink-900 font-medium">{s.value}</dd>
            </div>
          ))}
        </dl>
      )}
    </SectionCard>
  )
}

/* ================================================================
   Stock / Variants card — adapts to the stock_mode
   ================================================================ */
function StockCard({ product }) {
  const variants = product.variants ?? []
  const hasVariants = variants.length > 0
  const mode = product.stock_mode
  const baseStock = Number(product.stock_quantity ?? 0)

  // ── Single mode: one stock number, no variants
  if (!hasVariants) {
    return (
      <SectionCard icon={Boxes} title="Stock">
        <StockStat value={baseStock} label="Quantity in stock" />
      </SectionCard>
    )
  }

  // ── Shared mode: show pool + variants (no per-variant stock column)
  if (mode === 'shared') {
    return (
      <SectionCard
        icon={Boxes}
        title="Stock · shared pool"
        action={
          <Link
            to={`/admin/products/${product.id}/edit`}
            className="text-sm text-brand-600 hover:underline"
          >
            Manage
          </Link>
        }
      >
        <StockStat value={baseStock} label="Shared across all variants" />

        <div className="mt-4 flex items-start gap-2 rounded-control border border-surface-border bg-surface-subtle px-3 py-2 text-xs text-ink-600">
          <Info size={14} className="shrink-0 mt-0.5 text-ink-400" aria-hidden="true" />
          <span>
            Any variant sale deducts from this single pool. Variants do not track their own stock.
          </span>
        </div>

        <VariantList variants={variants} showStock={false} />
      </SectionCard>
    )
  }

  // ── Per-variant mode: base + each variant + total
  const variantTotal = variants.reduce((s, v) => s + Number(v.stock_quantity || 0), 0)
  const grandTotal = baseStock + variantTotal

  return (
    <SectionCard
      icon={Boxes}
      title={`Variants (${variants.length})`}
      action={
        <Link
          to={`/admin/products/${product.id}/edit`}
          className="text-sm text-brand-600 hover:underline"
        >
          Manage
        </Link>
      }
    >
      <div className="grid grid-cols-2 gap-3">
        <StockStat value={baseStock} label="Default config" compact />
        <StockStat value={grandTotal} label="Total (all options)" compact />
      </div>

      <VariantList variants={variants} showStock />
    </SectionCard>
  )
}

function StockStat({ value, label, compact = false }) {
  return (
    <div>
      <p
        className={`font-semibold ${compact ? 'text-xl' : 'text-3xl'} ${
          value === 0 ? 'text-danger' : 'text-ink-900'
        }`}
      >
        {value}
      </p>
      <p className="text-xs text-ink-600 mt-0.5">{label}</p>
    </div>
  )
}

function VariantList({ variants, showStock }) {
  return (
    <>
      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto -mx-4 sm:-mx-5 mt-4">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-ink-600 text-xs uppercase tracking-wide">
              <th className="px-4 sm:px-5 py-2 text-left font-medium">Name</th>
              <th className="px-3 py-2 text-right font-medium">Price</th>
              {showStock && <th className="px-3 py-2 text-right font-medium">Stock</th>}
              <th className="px-4 sm:px-5 py-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {variants.map((v) => (
              <tr key={v.id}>
                <td className="px-4 sm:px-5 py-3 text-ink-900 font-medium">{v.name}</td>
                <td className="px-3 py-3 text-right">
                  <VariantPrice variant={v} />
                </td>
                {showStock && (
                  <td
                    className={`px-3 py-3 text-right font-medium ${
                      (v.stock_quantity ?? 0) === 0 ? 'text-danger' : 'text-ink-900'
                    }`}
                  >
                    {v.stock_quantity ?? 0}
                  </td>
                )}
                <td className="px-4 sm:px-5 py-3 text-right">
                  <StatusPill tone={v.is_active ? 'success' : 'neutral'}>
                    {v.is_active ? 'Active' : 'Inactive'}
                  </StatusPill>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile: cards */}
      <ul className="md:hidden space-y-3 mt-4">
        {variants.map((v) => (
          <li
            key={v.id}
            className="rounded-control border border-surface-border bg-surface-subtle p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-ink-900">{v.name}</p>
              <StatusPill tone={v.is_active ? 'success' : 'neutral'}>
                {v.is_active ? 'Active' : 'Inactive'}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <VariantPrice variant={v} />
              {showStock && (
                <span
                  className={`text-xs font-medium ${
                    (v.stock_quantity ?? 0) === 0 ? 'text-danger' : 'text-ink-600'
                  }`}
                >
                  Stock: {v.stock_quantity ?? 0}
                </span>
              )}
            </div>
          </li>
        ))}
      </ul>
    </>
  )
}

function VariantPrice({ variant }) {
  const hasPromo =
    variant.promotional_price != null &&
    variant.promotional_price < variant.price
  return hasPromo ? (
    <span className="text-ink-900 font-medium">
      {formatCurrency(variant.promotional_price)}
      <span className="text-xs text-ink-400 line-through ml-1.5">
        {formatCurrency(variant.price)}
      </span>
    </span>
  ) : (
    <span className="text-ink-900 font-medium">
      {formatCurrency(variant.price)}
    </span>
  )
}

/* ================================================================
   Skeleton
   ================================================================ */
function DetailSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="mb-6 flex gap-5">
        <Skeleton className="w-20 h-20" />
        <div className="flex-1 space-y-3">
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-40" />
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="order-1 lg:order-2 space-y-5">
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        <div className="order-2 lg:order-1 lg:col-span-2 space-y-5">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </>
  )
}