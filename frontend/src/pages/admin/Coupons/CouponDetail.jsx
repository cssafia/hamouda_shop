// src/pages/admin/Coupons/CouponDetail.jsx
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil, Power, PowerOff, Tag, Package, Layers, Percent } from 'lucide-react'

import {
  useAdminCoupon,
  useToggleCouponStatus,
} from '../../../features/coupons/useAdminCoupons'
import { useAdminProducts } from '../../../features/products/useAdminProducts'
import { useCategories } from '../../../features/categories/useCategories'
import { formatCurrency, formatDate } from '../../../utils/format'
import {
  deriveCouponState,
  formatDiscount,
  COUPON_STATE_LABELS,
} from '../../../constants/coupons'
import { toast } from '../../../components/ui/Toast'

import EmptyState from '../../../components/ui/EmptyState'
import Skeleton from '../../../components/ui/Skeleton'
import Button from '../../../components/ui/Button'
import SectionCard from '../../../components/ui/SectionCard'
import CopyButton from '../../../components/ui/CopyButton'
import CouponStatusPill from '../../../components/admin/coupons/CouponStatusPill'

export default function CouponDetail() {
  const { id } = useParams()
  const { data: coupon, isLoading, isError, error } = useAdminCoupon(id)
  const toggle = useToggleCouponStatus(id)

  if (isLoading) return <DetailSkeleton />

  if (isError || !coupon) {
    return (
      <EmptyState
        icon={Tag}
        title="Coupon introuvable"
        description={error?.message || "Ce coupon n'existe pas."}
        action={
          <Link to="/admin/coupons" className="btn-secondary">
            <ArrowLeft size={16} /> Retour aux coupons
          </Link>
        }
      />
    )
  }

  const state = deriveCouponState(coupon)
  const canToggle = state !== 'used_up' && state !== 'expired'

  const handleToggle = () => {
    toggle.mutate(!coupon.is_active, {
      onSuccess: () => toast.success(coupon.is_active ? 'Coupon désactivé' : 'Coupon activé'),
      onError: (err) => toast.error('Échec', { message: err.message }),
    })
  }

  return (
    <>
      <Link
        to="/admin/coupons"
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mb-4"
      >
        <ArrowLeft size={16} /> Coupons
      </Link>

      {/* Header */}
      <div className="card p-5 mb-5">
        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-mono text-xl lg:text-2xl font-bold text-ink-900 tracking-wide">
                {coupon.code}
              </h1>
              <CopyButton value={coupon.code} />
              <CouponStatusPill coupon={coupon} />
            </div>
            <p className="text-sm text-ink-600 mt-1.5">
              {formatDiscount(coupon.discount_type, coupon.discount_value)}
              <span className="text-ink-400 mx-1.5">·</span>
              {coupon.used_count} utilisation{coupon.used_count !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-2">
            {canToggle && (
              <button
                type="button"
                onClick={handleToggle}
                disabled={toggle.isPending}
                className={`inline-flex items-center justify-center gap-2 rounded-control px-4 py-2.5 text-sm font-medium transition-colors disabled:opacity-50 ${
                  coupon.is_active
                    ? 'border border-surface-border bg-white text-ink-900 hover:border-danger/40 hover:text-danger'
                    : 'bg-brand-500 text-white hover:bg-brand-600'
                }`}
              >
                {coupon.is_active ? <PowerOff size={16} /> : <Power size={16} />}
                <span className="hidden sm:inline">
                  {coupon.is_active ? 'Désactiver' : 'Activer'}
                </span>
              </button>
            )}

            <Link to={`/admin/coupons/${coupon.id}/edit`} className="btn-primary">
              <Pencil size={16} />
              <span className="hidden sm:inline">Modifier</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <ConfigCard coupon={coupon} />
          <ScopeCard coupon={coupon} />
        </div>

        <aside className="space-y-5">
          <UsageCard coupon={coupon} />
        </aside>
      </div>
    </>
  )
}

function ConfigCard({ coupon }) {
  return (
    <SectionCard icon={Percent} title="Configuration">
      <dl className="divide-y divide-surface-border -my-2">
        <Row label="Remise">
          <span className="font-medium text-ink-900">
            {formatDiscount(coupon.discount_type, coupon.discount_value)}
          </span>
        </Row>
        <Row label="Minimum d'achat">
          {coupon.minimum_amount != null
            ? formatCurrency(coupon.minimum_amount)
            : <span className="text-ink-400">—</span>}
        </Row>
        <Row label="Limite d'utilisation">
          {coupon.usage_limit != null
            ? `${coupon.usage_limit} utilisation${coupon.usage_limit > 1 ? 's' : ''}`
            : <span className="text-ink-400">Illimité</span>}
        </Row>
        <Row label="Débute le">
          {coupon.starts_at
            ? formatDate(coupon.starts_at)
            : <span className="text-ink-400">—</span>}
        </Row>
        <Row label="Expire le">
          {coupon.expires_at
            ? formatDate(coupon.expires_at)
            : <span className="text-ink-400">—</span>}
        </Row>
      </dl>
    </SectionCard>
  )
}

function Row({ label, children }) {
  return (
    <div className="grid grid-cols-2 gap-4 py-2.5 text-sm">
      <dt className="text-ink-600">{label}</dt>
      <dd className="text-ink-900">{children}</dd>
    </div>
  )
}

function ScopeCard({ coupon }) {
  if (coupon.scope === 'all') {
    return (
      <SectionCard icon={Package} title="Portée">
        <p className="text-sm text-ink-900">
          Tout le panier — aucune restriction.
        </p>
      </SectionCard>
    )
  }

  if (coupon.scope === 'products') {
    return <ProductScopeCard ids={coupon.product_ids ?? []} />
  }

  if (coupon.scope === 'categories') {
    return <CategoryScopeCard ids={coupon.category_ids ?? []} />
  }

  return null
}

function ProductScopeCard({ ids }) {
  const { data, isLoading } = useAdminProducts({ limit: 100 })

  const products = (data?.items ?? []).filter((p) => ids.includes(p.id))
  const missing = ids.length - products.length

  return (
    <SectionCard
      icon={Package}
      title={`Produits concernés (${ids.length})`}
      action={
        <Link
          to="./edit"
          className="text-sm text-brand-600 hover:underline"
        >
          Modifier
        </Link>
      }
    >
      {isLoading ? (
        <Skeleton className="h-20 w-full" />
      ) : (
        <>
          <ul className="divide-y divide-surface-border -my-2">
            {products.map((p) => (
              <li key={p.id} className="py-3 flex items-center gap-3">
                <div className="w-10 h-10 rounded-control bg-surface-subtle border border-surface-border overflow-hidden shrink-0">
                  {p.primary_image ? (
                    <img src={p.primary_image} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-400">
                      <Package size={16} />
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <Link
                    to={`/admin/products/${p.id}`}
                    className="text-sm font-medium text-ink-900 hover:text-brand-600 truncate block"
                  >
                    {p.name}
                  </Link>
                  <p className="text-xs text-ink-600 mt-0.5">{formatCurrency(p.price)}</p>
                </div>
                {!p.is_active && (
                  <span className="text-xs text-warning shrink-0">Inactif</span>
                )}
              </li>
            ))}
          </ul>
          {missing > 0 && (
            <p className="text-xs text-ink-400 mt-3">
              {missing} produit{missing > 1 ? 's' : ''} introuvable{missing > 1 ? 's' : ''}.
            </p>
          )}
        </>
      )}
    </SectionCard>
  )
}

function CategoryScopeCard({ ids }) {
  const { data, isLoading } = useCategories()

  const categories = (data ?? []).filter((c) => ids.includes(c.id))

  return (
    <SectionCard
      icon={Layers}
      title={`Catégories concernées (${ids.length})`}
      action={
        <Link to="./edit" className="text-sm text-brand-600 hover:underline">
          Modifier
        </Link>
      }
    >
      {isLoading ? (
        <Skeleton className="h-10 w-full" />
      ) : categories.length === 0 ? (
        <p className="text-sm text-ink-400 italic">Aucune catégorie trouvée.</p>
      ) : (
        <div className="flex flex-wrap gap-2">
          {categories.map((c) => (
            <span
              key={c.id}
              className="px-3 py-1.5 rounded-full bg-brand-50 text-brand-700 text-sm font-medium"
            >
              {c.name}
            </span>
          ))}
        </div>
      )}
    </SectionCard>
  )
}

function UsageCard({ coupon }) {
  const hasLimit = coupon.usage_limit != null
  const pct = hasLimit
    ? Math.min(100, Math.round((coupon.used_count / coupon.usage_limit) * 100))
    : 0
  const tone =
    pct >= 90 ? 'bg-danger' : pct >= 60 ? 'bg-warning' : 'bg-brand-500'
  const state = deriveCouponState(coupon)

  return (
    <SectionCard icon={Tag} title="Utilisation">
      <div>
        <p className="text-2xl font-semibold text-ink-900">
          {coupon.used_count}
          {hasLimit && <span className="text-ink-400 text-lg"> / {coupon.usage_limit}</span>}
        </p>

        {hasLimit && (
          <div className="mt-3 h-1.5 w-full rounded-full bg-surface-border overflow-hidden">
            <div className={`h-full ${tone}`} style={{ width: `${pct}%` }} />
          </div>
        )}

        <p className="text-xs text-ink-600 mt-3">
          Statut : <span className="font-medium">{COUPON_STATE_LABELS[state]}</span>
        </p>
      </div>
    </SectionCard>
  )
}

function DetailSkeleton() {
  return (
    <>
      <Skeleton className="h-4 w-24 mb-4" />
      <div className="card p-5 mb-5">
        <Skeleton className="h-8 w-40 mb-3" />
        <Skeleton className="h-4 w-56" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        <div className="lg:col-span-2 space-y-5">
          <Skeleton className="h-56 w-full" />
          <Skeleton className="h-48 w-full" />
        </div>
        <div className="space-y-5">
          <Skeleton className="h-48 w-full" />
        </div>
      </div>
    </>
  )
}