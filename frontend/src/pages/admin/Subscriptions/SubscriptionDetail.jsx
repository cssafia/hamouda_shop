// src/pages/admin/Subscriptions/SubscriptionDetail.jsx
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  ArrowLeft,
  Pencil,
  Repeat,
  Percent,
  CalendarClock,
  ImageIcon,
  Sparkles,
  Power,
  PowerOff,
} from 'lucide-react'

import {
  useAdminProduct,
  useToggleProductStatus,
} from '../../../features/products/useAdminProducts'
import { formatCurrency, discountPercent } from '../../../utils/format'
import { toast } from '../../../components/ui/Toast'

import EmptyState from '../../../components/ui/EmptyState'
import StatusPill from '../../../components/ui/StatusPill'
import Skeleton from '../../../components/ui/Skeleton'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'

export default function SubscriptionDetail() {
  const { id } = useParams()
  const { data: product, isLoading, isError, error } = useAdminProduct(id)
  const toggleStatus = useToggleProductStatus(id)
  const [confirmOpen, setConfirmOpen] = useState(false)

  if (isLoading) return <DetailSkeleton />

  if (isError || !product) {
    return (
      <EmptyState
        icon={Repeat}
        title="Couldn't load this subscription"
        description={error?.message || 'The subscription may have been removed.'}
        action={
          <Link to="/admin/subscriptions" className="btn-secondary">
            <ArrowLeft size={16} /> Back to subscriptions
          </Link>
        }
      />
    )
  }

  const isActive = product.is_active
  const basePlan = product.base_plan ?? null
  const extras = product.variants ?? []

  /* -------- toggle handlers -------- */
  const handleToggleClick = () => {
    if (isActive) {
      setConfirmOpen(true)
    } else {
      toggleStatus.mutate(true, {
        onSuccess: () => toast.success('Subscription activated'),
        onError: (err) => toast.error('Failed to activate', { message: err.message }),
      })
    }
  }

  const confirmDeactivate = () => {
    toggleStatus.mutate(false, {
      onSuccess: () => {
        toast.success('Subscription deactivated')
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
        to="/admin/subscriptions"
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mb-4"
      >
        <ArrowLeft size={16} /> Subscriptions
      </Link>

      {/* ============ HEADER ============ */}
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:gap-5">
        <SubscriptionThumb product={product} />

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
            {product.category?.name && <span>{product.category.name}</span>}
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

          <Link
            to={`/admin/subscriptions/${product.id}/edit`}
            className="btn-primary"
          >
            <Pencil size={16} />
            <span className="hidden sm:inline">Edit</span>
          </Link>
        </div>
      </div>

      {/* ============ BODY ============ */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Main */}
        <div className="order-1 lg:order-1 lg:col-span-2 space-y-5">
          <OverviewCard product={product} />
          {basePlan && <BasePlanCard basePlan={basePlan} />}
          <ExtraPlansCard variants={extras} />
        </div>

        {/* Sidebar */}
        <aside className="order-2 lg:order-2 space-y-5">
          <ImagesCard product={product} />
        </aside>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => !toggleStatus.isPending && setConfirmOpen(false)}
        onConfirm={confirmDeactivate}
        title="Deactivate this subscription?"
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
function SubscriptionThumb({ product }) {
  const primary = (product.images ?? []).find((i) => i.is_primary) ?? product.images?.[0]
  return (
    <div className="w-16 h-16 lg:w-20 lg:h-20 rounded-card overflow-hidden border border-surface-border bg-surface-subtle shrink-0">
      {primary ? (
        <img src={primary.url} alt="" className="w-full h-full object-cover" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-ink-400">
          <Repeat size={24} />
        </div>
      )}
    </div>
  )
}

/* ================================================================
   Cards
   ================================================================ */
function Card({ icon: Icon, title, action, children }) {
  return (
    <section className="card overflow-hidden">
      <header className="flex items-center gap-2 px-5 py-3.5 border-b border-surface-border">
        {Icon && <Icon size={16} className="text-ink-400" />}
        <h2 className="font-medium text-ink-900">{title}</h2>
        {action && <div className="ml-auto">{action}</div>}
      </header>
      <div className="p-5">{children}</div>
    </section>
  )
}

function OverviewCard({ product }) {
  return (
    <Card icon={Sparkles} title="Overview">
      {product.description ? (
        <p className="text-sm text-ink-700 whitespace-pre-line">
          {product.description}
        </p>
      ) : (
        <p className="text-sm text-ink-400 italic">No description.</p>
      )}
    </Card>
  )
}

function BasePlanCard({ basePlan }) {
  const hasPromo =
    basePlan.promotional_price != null &&
    basePlan.promotional_price < basePlan.price
  const off = discountPercent(basePlan.price, basePlan.promotional_price)

  return (
    <Card icon={CalendarClock} title="Base plan">
      <dl className="divide-y divide-surface-border -my-2">
        <Row label="Duration">{basePlan.duration || '—'}</Row>

        <Row label="Price">
          {hasPromo ? (
            <span className="flex items-baseline gap-2 flex-wrap">
              <span className="font-medium text-ink-900">
                {formatCurrency(basePlan.promotional_price)}
              </span>
              <span className="text-xs text-ink-400 line-through">
                {formatCurrency(basePlan.price)}
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-success bg-success/10 px-1.5 py-0.5 rounded-full">
                <Percent size={10} /> -{off}%
              </span>
            </span>
          ) : (
            <span className="font-medium text-ink-900">
              {formatCurrency(basePlan.price)}
            </span>
          )}
        </Row>

        <Row label="Profit (admin)">
          {basePlan.profit != null ? (
            <span className="font-medium text-ink-900">
              {formatCurrency(basePlan.profit)}
            </span>
          ) : (
            <span className="text-ink-400">—</span>
          )}
        </Row>
      </dl>
    </Card>
  )
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-2 gap-4 py-2.5 text-sm">
      <dt className="text-ink-600">{label}</dt>
      <dd>{children}</dd>
    </div>
  )
}

function ExtraPlansCard({ variants }) {
  if (!variants.length) {
    return (
      <Card icon={Repeat} title="Extra plans">
        <div className="rounded-control border border-dashed border-surface-border px-4 py-4 text-center">
          <p className="text-sm text-ink-900">No extra plans.</p>
          <p className="text-xs text-ink-600 mt-0.5">
            Customers can only buy the base plan.
          </p>
        </div>
      </Card>
    )
  }

  return (
    <Card
      icon={Repeat}
      title={`Extra plans (${variants.length})`}
      action={
        <Link
          to={`/admin/subscriptions/${variants[0]?.product_id}/edit`}
          className="text-sm text-brand-600 hover:underline"
        >
          Manage
        </Link>
      }
    >
      {/* Desktop: table */}
      <div className="hidden md:block overflow-x-auto -mx-5">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-ink-600 text-xs uppercase tracking-wide">
              <th className="px-5 py-2 text-left font-medium">Duration</th>
              <th className="px-3 py-2 text-right font-medium">Price</th>
              <th className="px-3 py-2 text-right font-medium">Profit</th>
              <th className="px-5 py-2 text-right font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-surface-border">
            {variants.map((v) => (
              <tr key={v.id}>
                <td className="px-5 py-3 text-ink-900 font-medium">
                  {v.duration}
                </td>
                <td className="px-3 py-3 text-right">
                  <VariantPrice variant={v} />
                </td>
                <td className="px-3 py-3 text-right text-ink-600">
                  {v.profit != null ? formatCurrency(v.profit) : '—'}
                </td>
                <td className="px-5 py-3 text-right">
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
      <ul className="md:hidden space-y-3">
        {variants.map((v) => (
          <li
            key={v.id}
            className="rounded-control border border-surface-border bg-surface-subtle p-3"
          >
            <div className="flex items-start justify-between gap-2">
              <p className="font-medium text-ink-900">{v.duration}</p>
              <StatusPill tone={v.is_active ? 'success' : 'neutral'}>
                {v.is_active ? 'Active' : 'Inactive'}
              </StatusPill>
            </div>
            <div className="flex items-center justify-between mt-2 text-sm">
              <VariantPrice variant={v} />
              <span className="text-xs text-ink-600">
                Profit: {v.profit != null ? formatCurrency(v.profit) : '—'}
              </span>
            </div>
          </li>
        ))}
      </ul>
    </Card>
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

function ImagesCard({ product }) {
  const images = product.images ?? []
  return (
    <Card icon={ImageIcon} title={`Images (${images.length})`}>
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
    </Card>
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
        <div className="order-1 lg:order-1 lg:col-span-2 space-y-5">
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-full" />
        </div>
        <div className="order-2 space-y-5">
          <Skeleton className="h-64 w-full" />
        </div>
      </div>
    </>
  )
}