// src/pages/client/Subscriptions/SubscriptionDetail.jsx
import { useEffect, useMemo, useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { LuArrowLeft, LuPackage, LuShoppingCart } from 'react-icons/lu'

import { useProduct, useProducts } from '../../../features/products/useProducts.js'
import { useAddCartItem } from '../../../features/cart/useCart.js'
import { cartUI } from '../../../features/cart/uiStore.js'
import { toast } from '../../../components/ui/Toast.jsx'
import EmptyState from '../../../components/ui/EmptyState.jsx'
import Skeleton from '../../../components/ui/Skeleton.jsx'
import ProductGrid from '../../../components/client/ProductGrid.jsx'
import PlanCard from '../../../components/client/PlanCard.jsx'
import { formatCurrency } from '../../../utils/format.js'

const STEPS = [
  { n: 1, title: 'Tu commandes', text: 'Paiement à la livraison ou en ligne.' },
  { n: 2, title: 'On t\u2019envoie les accès', text: 'Par WhatsApp ou email, sous 24h.' },
  { n: 3, title: 'Profite', text: 'On reste dispo si t\u2019as un souci.' },
]

/* ─── Duration helpers ─── */
function parseDuration(duration) {
  if (!duration) return null
  const d = String(duration).toLowerCase()
  const m = d.match(/(\d+)/)
  if (!m) return null
  const n = Number(m[1])
  if (d.includes('year') || d.includes('an')) return n * 12
  if (d.includes('month') || d.includes('mois')) return n
  if (d.includes('week') || d.includes('semaine')) return n / 4
  if (d.includes('day') || d.includes('jour')) return n / 30
  return null
}

function formatDuration(duration) {
  if (!duration) return 'Base'
  const months = parseDuration(duration)
  if (months == null) return duration
  if (months === 1) return '1 mois'
  if (Number.isInteger(months)) return `${months} mois`
  return duration
}

function buildPlan({ id, duration, price, promotional_price, availability }) {
  const total = Number(price ?? 0)
  const promo = promotional_price != null ? Number(promotional_price) : null
  const finalPrice = promo ?? total
  const months = parseDuration(duration)
  const perMonth = months && months > 0 ? Math.round(finalPrice / months) : null

  return {
    id,
    duration,
    label: formatDuration(duration),
    price: total,
    promotional_price: promo,
    finalPrice,
    months,
    perMonth,
    availability,
  }
}

export default function SubscriptionDetail() {
  const { id } = useParams()
  const { data: product, isLoading, isError } = useProduct(id)

  const [selectedVariantId, setSelectedVariantId] = useState(null)
  const addCartItem = useAddCartItem()

  useEffect(() => {
    if (!product) return
    setSelectedVariantId(product.default_variant_id ?? null)
  }, [product?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  const { data: related } = useProducts(
    product
      ? { product_type: 'digital', category_id: product.category?.id, limit: 7 }
      : null,
    { enabled: Boolean(product) }
  )

  /* Build plans list — base plan (id=null) + variants */
  const plans = useMemo(() => {
    if (!product) return []
    const basePlan = buildPlan({
      id: null,
      duration: product.duration,
      price: product.price,
      promotional_price: product.promotional_price,
      availability: product.availability,
    })
    const variantPlans = (product.variants ?? []).map((v) =>
      buildPlan({
        id: v.id,
        duration: v.duration ?? v.name,
        price: v.price,
        promotional_price: v.promotional_price,
        availability: v.availability,
      })
    )
    return [basePlan, ...variantPlans]
  }, [product])

  /* Baseline = cheapest per-month rate across all plans */
  const baselineRate = useMemo(() => {
    const rates = plans
      .map((p) => p.perMonth)
      .filter((r) => r != null && r > 0)
    return rates.length ? Math.min(...rates) : 0
  }, [plans])

  /* Savings per plan — plan.id -> amount saved */
  const savingsByPlan = useMemo(() => {
    const map = new Map()
    for (const p of plans) {
      if (!p.months || p.months <= 1 || !baselineRate) {
        map.set(p.id, 0)
        continue
      }
      const wouldPay = baselineRate * p.months
      map.set(p.id, Math.max(0, Math.round(wouldPay - p.finalPrice)))
    }
    return map
  }, [plans, baselineRate])

  /* Best value = lowest per-month price (only badge, not auto-selected) */
  const bestPlanId = useMemo(() => {
    let best = null
    for (const p of plans) {
      if (p.perMonth == null) continue
      if (!best || p.perMonth < best.perMonth) best = p
    }
    return best?.id ?? null
  }, [plans])

  if (isLoading) return <DetailSkeleton />

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={LuPackage}
          title="Abonnement introuvable"
          description="Cet abonnement n'existe plus ou a été retiré."
          action={
            <Link to="/subscriptions" className="btn-secondary">
              Retour aux abonnements
            </Link>
          }
        />
      </div>
    )
  }

  const selectedPlan = plans.find((p) => p.id === selectedVariantId) || plans[0]
  const isOutOfStock =
    selectedPlan?.availability === 'out_of_stock' ||
    product.availability === 'out_of_stock'

  const hasPromo =
    selectedPlan.promotional_price != null &&
    selectedPlan.promotional_price < selectedPlan.price
  const displayPrice = selectedPlan.finalPrice
  const primaryImage =
    product.images?.find((i) => i.is_primary)?.url || product.images?.[0]?.url

  function handleAddToCart() {
    addCartItem.mutate(
      {
        product_id: product.id,
        variant_id: selectedPlan?.id ?? null,
        quantity: 1,
      },
      {
        onSuccess: (data) => {
          const added = data?.items?.find(
            (i) =>
              i.product_id === product.id &&
              (i.variant_id ?? null) === (selectedPlan?.id ?? null)
          )
          cartUI.open(added?.id ?? null)
        },
        onError: (err) => toast.error(err?.message || "Erreur lors de l'ajout"),
      }
    )
  }

  const buyDisabled = isOutOfStock || addCartItem.isPending
  const relatedItems = (related?.items ?? []).filter((p) => p.id !== product.id)

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-32 lg:pb-10">
        {/* Breadcrumb */}
        <nav aria-label="Fil d'Ariane" className="hidden lg:block text-sm text-ink-600 mb-6">
          <Link to="/" className="hover:text-brand-600">Accueil</Link>
          {' / '}
          <Link to="/subscriptions" className="hover:text-brand-600">
            Abonnements
          </Link>
          {product.category && (
            <>
              {' / '}
              <Link
                to={`/products?product_type=digital&category_id=${product.category.id}`}
                className="hover:text-brand-600"
              >
                {product.category.name}
              </Link>
            </>
          )}
          {' / '}
          <span className="text-ink-900">{product.name}</span>
        </nav>

        <Link
          to="/subscriptions"
          className="lg:hidden inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900 mb-4"
        >
          <LuArrowLeft size={14} /> Retour
        </Link>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
          {/* Hero image */}
          <div className="lg:col-span-6">
            <div className="aspect-square rounded-card bg-gradient-to-br from-brand-50 via-brand-50/60 to-brand-100/40 border border-brand-500/10 overflow-hidden flex items-center justify-center">
              {primaryImage ? (
                <img
                  src={primaryImage}
                  alt={product.name}
                  className="w-full h-full object-contain p-6 lg:p-10"
                />
              ) : (
                <div className="flex flex-col items-center justify-center text-brand-500 gap-3 p-8">
                  <LuPackage size={64} aria-hidden="true" />
                  <span className="text-sm font-medium text-center">
                    {product.name}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Details */}
          <div className="lg:col-span-6 space-y-5">
            {/* Title */}
            <div>
              <div className="flex items-center gap-2 flex-wrap text-xs">
                <span className="font-semibold bg-brand-500 text-white px-2 py-1 rounded-full uppercase tracking-wide">
                  Abonnement
                </span>
                {product.category?.name && (
                  <span className="text-ink-500">{product.category.name}</span>
                )}
                {product.brand?.name && (
                  <>
                    <span className="text-ink-400">·</span>
                    <span className="text-ink-500">{product.brand.name}</span>
                  </>
                )}
              </div>
              <h1 className="text-2xl lg:text-3xl font-semibold text-ink-900 mt-3">
                {product.name}
              </h1>
            </div>

            {/* Duration + price block */}
            <div className="rounded-card border border-surface-border bg-surface-subtle/60 p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <p className="text-[11px] uppercase tracking-wide text-ink-500">
                    Durée
                  </p>
                  <p className="text-xl lg:text-2xl font-semibold text-ink-900 mt-0.5">
                    {selectedPlan.label}
                  </p>
                  {selectedPlan.perMonth != null && selectedPlan.months > 1 && (
                    <p className="text-xs text-ink-500 mt-1">
                      ≈ {formatCurrency(selectedPlan.perMonth)} / mois
                    </p>
                  )}
                </div>

                <div className="text-right shrink-0">
                  <div className="flex items-baseline gap-2 justify-end flex-wrap">
                    <span className="text-2xl lg:text-3xl font-semibold text-ink-900">
                      {formatCurrency(displayPrice)}
                    </span>
                    {hasPromo && (
                      <span className="text-sm text-ink-400 line-through">
                        {formatCurrency(selectedPlan.price)}
                      </span>
                    )}
                  </div>
                  {!isOutOfStock && (
                    <p className="text-xs text-success mt-1 inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      Disponible
                    </p>
                  )}
                  {isOutOfStock && (
                    <p className="text-xs text-danger mt-1 inline-flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-current" />
                      Indisponible
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Plan picker */}
            {plans.length > 1 && (
              <div>
                <p className="text-sm font-medium text-ink-900 mb-2">
                  Choisis ta durée
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.id ?? 'base'}
                      plan={plan}
                      selected={plan.id === selectedPlan.id}
                      isBest={plan.id === bestPlanId && plans.length > 1}
                      savings={savingsByPlan.get(plan.id) ?? 0}
                      onSelect={() => setSelectedVariantId(plan.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* CTA — desktop */}
            <div className="hidden lg:block">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={buyDisabled}
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                <LuShoppingCart size={18} aria-hidden="true" />
                {isOutOfStock
                  ? 'Indisponible'
                  : `Ajouter · ${formatCurrency(displayPrice)}`}
              </button>
              <p className="text-xs text-ink-500 text-center mt-2">
                Accès envoyé sous 24h par WhatsApp ou email.
              </p>
            </div>
          </div>
        </div>

        {/* Comment ça marche */}
        <div className="mt-12 lg:mt-16">
          <h2 className="text-lg font-semibold text-ink-900 mb-5">
            Comment ça marche ?
          </h2>
          <ol className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {STEPS.map((s) => (
              <li
                key={s.n}
                className="rounded-card border border-surface-border p-4 bg-white"
              >
                <span className="w-8 h-8 rounded-full bg-brand-500 text-white text-sm font-semibold flex items-center justify-center">
                  {s.n}
                </span>
                <p className="font-medium text-ink-900 mt-3">{s.title}</p>
                <p className="text-sm text-ink-600 mt-1">{s.text}</p>
              </li>
            ))}
          </ol>
        </div>

        {/* Description */}
        {product.description && (
          <div className="mt-10 lg:mt-14">
            <h2 className="text-lg font-semibold text-ink-900 mb-3">
              Description
            </h2>
            <p className="text-sm text-ink-700 whitespace-pre-line max-w-3xl">
              {product.description}
            </p>
          </div>
        )}

        {/* Related */}
        {relatedItems.length > 0 && (
          <div className="mt-12 lg:mt-16">
            <h2 className="text-xl font-semibold text-ink-900 mb-6">
              Abonnements similaires
            </h2>
            <ProductGrid products={relatedItems} />
          </div>
        )}
      </div>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-surface-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={buyDisabled}
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
        >
          <LuShoppingCart size={18} aria-hidden="true" />
          {isOutOfStock
            ? 'Indisponible'
            : `Ajouter · ${formatCurrency(displayPrice)}`}
        </button>
      </div>
    </>
  )
}

/* ─── Skeleton ─── */
function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
        <div className="lg:col-span-6">
          <Skeleton className="aspect-square rounded-card w-full" />
        </div>
        <div className="lg:col-span-6 space-y-4">
          <Skeleton className="h-5 w-24" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-24 w-full" />
          <div className="grid grid-cols-3 gap-2">
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
            <Skeleton className="h-20 w-full" />
          </div>
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  )
}