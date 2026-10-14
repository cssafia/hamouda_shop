// src/pages/admin/Coupons/CouponsList.jsx
import { useState, useMemo } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { LuPlus, LuSearch, LuTicket, LuChevronLeft, LuChevronRight, LuPencil } from 'react-icons/lu'

import { useAdminCoupons } from '../../../features/coupons/useAdminCoupons'
import { useDebounced } from '../../../utils/useDebounced'
import { formatCurrency, formatDate } from '../../../utils/format'
import {
  deriveCouponState,
  formatDiscount,
  formatScopeLabel,
  COUPON_STATE_LABELS,
} from '../../../constants/coupons'

import PageHeader from '../../../components/ui/PageHeader'
import EmptyState from '../../../components/ui/EmptyState'
import Skeleton from '../../../components/ui/Skeleton'
import Select from '../../../components/ui/Select'
import CopyButton from '../../../components/ui/CopyButton'
import CouponStatusPill from '../../../components/admin/coupons/CouponStatusPill'

const PAGE_SIZE = 20

export default function CouponsList() {
  const [params, setParams] = useSearchParams()
  const [searchInput, setSearchInput] = useState(params.get('search') || '')

  const status = params.get('is_active') || ''
  const search = params.get('search') || ''
  const page = Number(params.get('page')) || 1

  const debouncedSearch = useDebounced(searchInput, 300)

  /* sync debounced → url */
  useMemo(() => {
    if (debouncedSearch === search) return
    const next = new URLSearchParams(params)
    if (debouncedSearch) next.set('search', debouncedSearch)
    else next.delete('search')
    next.delete('page')
    setParams(next, { replace: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch])

  const filters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      ...(search && { search }),
      ...(status !== '' && { is_active: status }),
    }),
    [page, search, status]
  )

  const { data, isLoading, isError, error, isFetching } = useAdminCoupons(filters)
  const items = data?.items ?? []
  const meta = data?.meta

  const stats = useMemo(() => {
    const s = { active: 0, scheduled: 0, expired: 0, disabled: 0, used_up: 0 }
    items.forEach((c) => { s[deriveCouponState(c)]++ })
    return s
  }, [items])

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  return (
    <>
      <PageHeader
        title="Coupons"
        description="Crée et gère tes codes promo."
        actions={
          <Link to="/admin/coupons/new" className="btn-primary">
            <LuPlus size={16} />
            <span className="hidden sm:inline">Nouveau coupon</span>
            <span className="sm:hidden">Nouveau</span>
          </Link>
        }
      />

      {/* Stat strip */}
      {items.length > 0 && (
        <p className="text-xs text-ink-600 mb-4">
          {stats.active > 0 && <span className="text-success font-medium">{stats.active} active{stats.active > 1 ? 's' : ''}</span>}
          {stats.scheduled > 0 && <> · {stats.scheduled} programmée{stats.scheduled > 1 ? 's' : ''}</>}
          {stats.used_up > 0 && <> · <span className="text-danger font-medium">{stats.used_up} épuisée{stats.used_up > 1 ? 's' : ''}</span></>}
          {stats.expired > 0 && <> · {stats.expired} expirée{stats.expired > 1 ? 's' : ''}</>}
          {stats.disabled > 0 && <> · {stats.disabled} désactivée{stats.disabled > 1 ? 's' : ''}</>}
        </p>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <LuSearch size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            className="input pl-10 font-mono"
            placeholder="Rechercher un code…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          className="sm:w-44"
          value={status}
          onChange={(e) => setParam('is_active', e.target.value)}
        >
          <option value="">Tous</option>
          <option value="true">Actifs</option>
          <option value="false">Désactivés</option>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <EmptyState
          icon={LuTicket}
          title="Impossible de charger les coupons"
          description={error?.message || 'Réessaye dans un instant.'}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={LuTicket}
          title={search || status ? 'Aucun résultat' : 'Aucun coupon'}
          description={
            search || status
              ? 'Essaie de modifier les filtres.'
              : 'Crée ton premier code promo.'
          }
          action={
            !search && !status && (
              <Link to="/admin/coupons/new" className="btn-primary">
                <LuPlus size={16} /> Nouveau coupon
              </Link>
            )
          }
        />
      ) : (
        <div className={isFetching ? 'opacity-70 transition-opacity' : ''}>
          {/* Desktop table */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-surface-subtle text-ink-600">
                <tr>
                  <Th className="w-44">Code</Th>
                  <Th className="w-40">Remise</Th>
                  <Th>Portée</Th>
                  <Th className="w-40">Utilisation</Th>
                  <Th className="w-44">Validité</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((c) => <CouponRow key={c.id} coupon={c} />)}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <ul className="md:hidden space-y-3">
            {items.map((c) => <CouponCardMobile key={c.id} coupon={c} />)}
          </ul>

          {/* Pagination */}
          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between mt-5">
              <p className="text-sm text-ink-600">Page {meta.page} sur {meta.pages}</p>
              <div className="flex items-center gap-2">
                <button
                  className="btn-secondary px-3 py-2"
                  disabled={meta.page <= 1}
                  onClick={() => setParam('page', String(meta.page - 1))}
                  aria-label="Précédent"
                >
                  <LuChevronLeft size={16} />
                </button>
                <button
                  className="btn-secondary px-3 py-2"
                  disabled={meta.page >= meta.pages}
                  onClick={() => setParam('page', String(meta.page + 1))}
                  aria-label="Suivant"
                >
                  <LuChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  )
}

function Th({ children, className = '' }) {
  return (
    <th className={`px-4 py-3 text-left font-medium text-xs uppercase tracking-wide ${className}`}>
      {children}
    </th>
  )
}

/* ---------- Desktop row ---------- */
function CouponRow({ coupon }) {
  const navigate = useNavigate()
  const scopeCount = (coupon.product_ids?.length || coupon.category_ids?.length || 0)
  const hasLimit = coupon.usage_limit != null
  const usagePct = hasLimit
    ? Math.min(100, Math.round((coupon.used_count / coupon.usage_limit) * 100))
    : 0
  const usageTone =
    usagePct >= 90 ? 'bg-danger' : usagePct >= 60 ? 'bg-warning' : 'bg-brand-500'

  return (
    <tr
      onClick={() => navigate(`/admin/coupons/${coupon.id}`)}
      className="cursor-pointer hover:bg-surface-subtle transition-colors"
    >
      <td className="px-4 py-3">
        <div className="flex items-center gap-1.5">
          <span className="font-mono text-sm font-semibold text-ink-900">
            {coupon.code}
          </span>
          <CopyButton value={coupon.code} />
        </div>
      </td>

      <td className="px-4 py-3">
        <p className="text-sm font-medium text-ink-900">
          {formatDiscount(coupon.discount_type, coupon.discount_value)}
        </p>
        {coupon.minimum_amount != null && (
          <p className="text-xs text-ink-600 mt-0.5">
            min {formatCurrency(coupon.minimum_amount)}
          </p>
        )}
      </td>

      <td className="px-4 py-3 text-sm text-ink-600">
        {formatScopeLabel(coupon.scope, scopeCount)}
      </td>

      <td className="px-4 py-3">
        <p className="text-xs text-ink-900 font-medium">
          {hasLimit ? `${coupon.used_count} / ${coupon.usage_limit}` : `${coupon.used_count} / ∞`}
        </p>
        {hasLimit && (
          <div className="mt-1.5 h-1 w-24 rounded-full bg-surface-border overflow-hidden">
            <div className={`h-full ${usageTone}`} style={{ width: `${usagePct}%` }} />
          </div>
        )}
      </td>

      <td className="px-4 py-3">
        <CouponStatusPill coupon={coupon} />
        {coupon.expires_at && deriveCouponState(coupon) !== 'expired' && (
          <p className="text-xs text-ink-400 mt-1">
            → {formatDate(coupon.expires_at)}
          </p>
        )}
        {coupon.starts_at && deriveCouponState(coupon) === 'scheduled' && (
          <p className="text-xs text-ink-400 mt-1">
            Débute {formatDate(coupon.starts_at)}
          </p>
        )}
      </td>
    </tr>
  )
}

/* ---------- Mobile card ---------- */
function CouponCardMobile({ coupon }) {
  const navigate = useNavigate()
  const scopeCount = (coupon.product_ids?.length || coupon.category_ids?.length || 0)

  return (
    <li className="card overflow-hidden">
      <button
        type="button"
        onClick={() => navigate(`/admin/coupons/${coupon.id}`)}
        className="w-full text-left p-3.5"
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="font-mono text-sm font-semibold text-ink-900 truncate">
              {coupon.code}
            </span>
            <CopyButton value={coupon.code} />
          </div>
          <CouponStatusPill coupon={coupon} />
        </div>

        <p className="text-sm text-ink-900 font-medium mt-2">
          {formatDiscount(coupon.discount_type, coupon.discount_value)}
          {coupon.minimum_amount != null && (
            <span className="text-xs text-ink-600 font-normal ml-1.5">
              · min {formatCurrency(coupon.minimum_amount)}
            </span>
          )}
        </p>

        <div className="flex items-center justify-between mt-1.5 text-xs text-ink-600">
          <span>{formatScopeLabel(coupon.scope, scopeCount)}</span>
          <span>
            {coupon.usage_limit != null
              ? `${coupon.used_count} / ${coupon.usage_limit}`
              : `${coupon.used_count} utilisés`}
          </span>
        </div>
      </button>

      <div className="border-t border-surface-border grid grid-cols-2">
        <button
          type="button"
          onClick={() => navigate(`/admin/coupons/${coupon.id}`)}
          className="py-3 text-sm font-medium text-ink-700 hover:bg-surface-subtle transition-colors border-r border-surface-border"
        >
          Voir
        </button>
        <button
          type="button"
          onClick={() => navigate(`/admin/coupons/${coupon.id}/edit`)}
          className="flex items-center justify-center gap-1.5 py-3 text-sm font-medium text-brand-600 hover:bg-brand-50 transition-colors"
        >
          <LuPencil size={14} /> Modifier
        </button>
      </div>
    </li>
  )
}

/* ---------- Loading ---------- */
function LoadingView() {
  return (
    <>
      <div className="card hidden md:block divide-y divide-surface-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-16" />
            <Skeleton className="h-3 w-20" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-40" />
          </div>
        ))}
      </div>
    </>
  )
}