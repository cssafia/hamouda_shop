// src/pages/admin/Subscriptions/SubscriptionList.jsx
import { useState, useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Search, Repeat, ChevronLeft, ChevronRight } from 'lucide-react'

import { useAdminProducts, useToggleProductStatus } from '../../../features/products/useAdminProducts'
import { useCategories } from '../../../features/categories/useCategories'
import { useDebounced } from '../../../utils/useDebounced'
import { formatCurrency } from '../../../utils/format'
import { PRODUCT_STATUSES, PRODUCT_SORT_OPTIONS } from '../../../constants/product'

import PageHeader from '../../../components/ui/PageHeader'
import EmptyState from '../../../components/ui/EmptyState'
import StatusPill from '../../../components/ui/StatusPill'
import Skeleton from '../../../components/ui/Skeleton'
import Select from '../../../components/ui/Select'
import EntityPicker from '../../../components/ui/EntityPicker'
import ConfirmDialog from '../../../components/ui/ConfirmDialog'

const PAGE_SIZE = 20

export default function SubscriptionList() {
  const [search, setSearch] = useState('')
  const [categoryId, setCategoryId] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState('newest')
  const [page, setPage] = useState(1)

  const debouncedSearch = useDebounced(search, 300)

  const { data: catList, isLoading: catLoading } = useCategories()
  const categoryOptions = useMemo(
    () => (catList ?? []).map((c) => ({ value: c.id, label: c.name })),
    [catList]
  )

  const filters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      product_type: 'digital',
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(categoryId && { category_id: categoryId }),
      ...(status !== '' && { is_active: status }),
      sort,
    }),
    [page, debouncedSearch, categoryId, status, sort]
  )

  const { data, isLoading, isError, error, isFetching } = useAdminProducts(filters)
  const items = data?.items ?? []
  const meta = data?.meta

  const handleFilter = (fn) => (e) => { fn(e.target.value); setPage(1) }

  return (
    <>
      <PageHeader
        title="Subscriptions"
        description="Manage your digital plans and subscriptions."
        actions={
          <Link to="/admin/subscriptions/new" className="btn-primary">
            <Plus size={18} />
            <span className="hidden sm:inline">New subscription</span>
            <span className="sm:hidden">New</span>
          </Link>
        }
      />

      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none" />
          <input
            className="input pl-11"
            placeholder="Search subscriptions…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1) }}
          />
        </div>

        <div className="sm:w-48">
          <EntityPicker
            options={categoryOptions}
            isLoading={catLoading}
            value={categoryId}
            onChange={handleFilter(setCategoryId)}
            includeAll
            placeholder="All categories"
          />
        </div>

        <Select className="sm:w-36" value={status} onChange={handleFilter(setStatus)}>
          {PRODUCT_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>

        <Select className="sm:w-40" value={sort} onChange={handleFilter(setSort)}>
          {PRODUCT_SORT_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </div>

      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <EmptyState
          icon={Repeat}
          title="Couldn't load subscriptions"
          description={error?.message || 'Please try again.'}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={Repeat}
          title={debouncedSearch ? 'No results' : 'No subscriptions yet'}
          description={
            debouncedSearch
              ? 'Try a different search or clear the filters.'
              : 'Add your first subscription to start selling.'
          }
          action={
            !debouncedSearch && (
              <Link to="/admin/subscriptions/new" className="btn-primary">
                <Plus size={18} /> New subscription
              </Link>
            )
          }
        />
      ) : (
        <>
          <div className={`card overflow-hidden hidden md:block ${isFetching ? 'opacity-70' : ''}`}>
            <table className="w-full text-sm">
              <thead className="bg-surface-subtle text-ink-600">
                <tr>
                  <Th>Subscription</Th>
                  <Th>Category</Th>
                  <Th className="text-right">Price</Th>
                  <Th className="text-right">Plans</Th>
                  <Th>Status</Th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((p) => <SubRow key={p.id} product={p} />)}
              </tbody>
            </table>
          </div>

          <ul className={`md:hidden space-y-3 ${isFetching ? 'opacity-70' : ''}`}>
            {items.map((p) => <SubCard key={p.id} product={p} />)}
          </ul>

          {meta && meta.pages > 1 && <Pagination meta={meta} onPage={setPage} />}
        </>
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

function PlansLabel({ count }) {
  if (!count) return <span className="text-ink-400">Single</span>
  return <span className="text-ink-900 font-medium">{count} plans</span>
}

function SubRow({ product }) {
  const navigate = useNavigate()
  const go = () => navigate(`/admin/subscriptions/${product.id}`)
  return (
    <tr onClick={go} className="cursor-pointer hover:bg-surface-subtle transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-3 min-w-0">
          <SubThumb product={product} />
          <span className="font-medium text-ink-900 truncate">{product.name}</span>
        </div>
      </td>
      <td className="px-4 py-3 text-ink-600">{product.category?.name || '—'}</td>
      <td className="px-4 py-3 text-right"><PriceCell product={product} /></td>
      <td className="px-4 py-3 text-right"><PlansLabel count={product.variants_count} /></td>
      <td className="px-4 py-3"><StatusToggle product={product} /></td>
    </tr>
  )
}

function SubCard({ product }) {
  const navigate = useNavigate()
  const go = () => navigate(`/admin/subscriptions/${product.id}`)
  return (
    <li onClick={go} className="card p-3 cursor-pointer active:bg-surface-subtle">
      <div className="flex gap-3">
        <SubThumb product={product} size="lg" />
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="font-medium text-ink-900 truncate">{product.name}</p>
              <p className="text-xs text-ink-600 mt-0.5">{product.category?.name || '—'}</p>
            </div>
            <StatusToggle product={product} />
          </div>
          <div className="flex items-center justify-between mt-3">
            <PriceCell product={product} />
            <PlansLabel count={product.variants_count} />
          </div>
        </div>
      </div>
    </li>
  )
}

function SubThumb({ product, size = 'md' }) {
  const cls = size === 'lg' ? 'w-14 h-14' : 'w-10 h-10'
  return (
    <div className={`${cls} rounded-control bg-surface-subtle border border-surface-border overflow-hidden shrink-0`}>
      {product.primary_image ? (
        <img src={product.primary_image} alt="" className="w-full h-full object-cover" loading="lazy" />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-ink-400">
          <Repeat size={18} />
        </div>
      )}
    </div>
  )
}

function PriceCell({ product }) {
  const hasPromo = product.promotional_price != null && product.promotional_price < product.price
  const showRange = product.price_range && product.price_range.min !== product.price_range.max

  if (showRange && !hasPromo) {
    return (
      <span className="font-medium text-ink-900">
        {formatCurrency(product.price_range.min)} – {formatCurrency(product.price_range.max)}
      </span>
    )
  }
  return (
    <div className="text-right">
      {hasPromo ? (
        <>
          <span className="font-medium text-ink-900">{formatCurrency(product.promotional_price)}</span>
          <span className="text-xs text-ink-400 line-through ml-1.5">{formatCurrency(product.price)}</span>
        </>
      ) : (
        <span className="font-medium text-ink-900">{formatCurrency(product.price)}</span>
      )}
    </div>
  )
}

function StatusToggle({ product }) {
  const toggle = useToggleProductStatus(product.id)
  const [confirmOpen, setConfirmOpen] = useState(false)

  const handleClick = (e) => {
    e.stopPropagation()
    if (product.is_active) {
      // Deactivating → ask for confirmation
      setConfirmOpen(true)
    } else {
      // Activating → do it straight away
      toggle.mutate(true)
    }
  }

  const handleConfirm = () => {
    toggle.mutate(false, {
      onSettled: () => setConfirmOpen(false),
    })
  }

  return (
    <>
      <button
        type="button"
        onClick={handleClick}
        disabled={toggle.isPending}
        className="disabled:opacity-50"
        title={product.is_active ? 'Deactivate subscription' : 'Activate subscription'}
      >
        <StatusPill tone={product.is_active ? 'success' : 'neutral'}>
          {product.is_active ? 'Active' : 'Inactive'}
        </StatusPill>
      </button>

      <ConfirmDialog
        open={confirmOpen}
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleConfirm}
        title="Deactivate subscription?"
        description={`"${product.name}" will be hidden from the storefront and no new subscribers will be able to purchase it until you reactivate it.`}
        confirmLabel="Deactivate"
        cancelLabel="Cancel"
        variant="danger"
        loading={toggle.isPending}
      />
    </>
  )
}

function Pagination({ meta, onPage }) {
  const { page, pages } = meta
  return (
    <div className="flex items-center justify-between mt-5">
      <p className="text-sm text-ink-600">Page {page} of {pages}</p>
      <div className="flex items-center gap-2">
        <button className="btn-secondary px-3 py-2" disabled={page <= 1} onClick={() => onPage(page - 1)} aria-label="Previous">
          <ChevronLeft size={16} />
        </button>
        <button className="btn-secondary px-3 py-2" disabled={page >= pages} onClick={() => onPage(page + 1)} aria-label="Next">
          <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}

function LoadingView() {
  return (
    <>
      <div className="card overflow-hidden hidden md:block">
        <div className="divide-y divide-surface-border">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="flex items-center gap-4 p-4">
              <Skeleton className="w-10 h-10" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-3 w-40" />
                <Skeleton className="h-3 w-24" />
              </div>
              <Skeleton className="h-3 w-20" />
            </div>
          ))}
        </div>
      </div>
      <div className="md:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-3 flex gap-3">
            <Skeleton className="w-14 h-14" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-3 w-24" />
            </div>
          </div>
        ))}
      </div>
    </>
  )
}