// src/pages/admin/Orders/OrderList.jsx
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import { LuSearch, LuPackage, LuChevronLeft, LuChevronRight } from 'react-icons/lu'

import { useAdminOrders, useUpdateOrderStatus } from '../../../features/orders/useAdminOrders'
import { useDebounced } from '../../../utils/useDebounced'
import {
  ORDER_STATUSES,
  ORDER_STATUS_LABELS,
  ORDER_STATUS_SECTION_TONE,
} from '../../../constants/orders'
import { toast } from '../../../components/ui/Toast'

import PageHeader from '../../../components/ui/PageHeader'
import EmptyState from '../../../components/ui/EmptyState'
import Skeleton from '../../../components/ui/Skeleton'
import Select from '../../../components/ui/Select'
import OrderRow from '../../../components/admin/orders/OrderRow'
import OrderCardMobile from '../../../components/admin/orders/OrderCardMobile'

const PAGE_SIZE = 20

export default function OrderList() {
  const [params, setParams] = useSearchParams()

  const status = params.get('status') || ''
  const search = params.get('search') || ''
  const sort = params.get('sort') || ''
  const page = Number(params.get('page')) || 1

  const [searchInput, setSearchInput] = useState(search)
  const debouncedSearch = useDebounced(searchInput, 300)

  /* Keep URL in sync with debounced search */
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
      ...(status && { status }),
      ...(debouncedSearch && { search: debouncedSearch }),
      ...(sort && { sort }),
    }),
    [page, status, debouncedSearch, sort]
  )

  const { data, isLoading, isError, error, isFetching } = useAdminOrders(filters)
  const items = data?.items ?? []
  const meta = data?.meta

  const updateStatus = useUpdateOrderStatus()
  const [updatingId, setUpdatingId] = useState(null)

  const setParam = (key, value) => {
    const next = new URLSearchParams(params)
    if (value) next.set(key, value)
    else next.delete(key)
    if (key !== 'page') next.delete('page')
    setParams(next, { replace: true })
  }

  /* Group by status when no status filter is set */
  const groups = useMemo(() => {
    if (status) return [{ status, items }]
    const map = {}
    items.forEach((o) => {
      if (!map[o.status]) map[o.status] = []
      map[o.status].push(o)
    })
    return ORDER_STATUSES
      .filter((s) => map[s]?.length)
      .map((s) => ({ status: s, items: map[s] }))
  }, [items, status])

  const onPrimaryAction = (order, nextStatus) => {
    setUpdatingId(order.id)
    updateStatus.mutate(
      { id: order.id, payload: { status: nextStatus } },
      {
        onSuccess: () => toast.success('Commande mise à jour'),
        onError: (err) => toast.error('Échec', { message: err.message }),
        onSettled: () => setUpdatingId(null),
      }
    )
  }

  return (
    <>
      <PageHeader
        title="Commandes"
        description="Gère tes commandes par priorité."
      />

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row gap-3 mb-5">
        <div className="relative flex-1">
          <LuSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
          <input
            className="input pl-10"
            placeholder="Rechercher par #, nom ou téléphone…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          className="sm:w-48"
          value={status}
          onChange={(e) => setParam('status', e.target.value)}
        >
          <option value="">Toutes les commandes</option>
          {ORDER_STATUSES.map((s) => (
            <option key={s} value={s}>{ORDER_STATUS_LABELS[s]}</option>
          ))}
        </Select>

        <Select
          className="sm:w-44"
          value={sort}
          onChange={(e) => setParam('sort', e.target.value)}
        >
          <option value="">Priorité</option>
          <option value="newest">Plus récentes</option>
          <option value="amount_desc">Montant ↓</option>
          <option value="amount_asc">Montant ↑</option>
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <EmptyState
          icon={LuPackage}
          title="Impossible de charger les commandes"
          description={error?.message || 'Réessaye dans un instant.'}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={LuPackage}
          title={debouncedSearch || status ? 'Aucun résultat' : 'Aucune commande'}
          description={
            debouncedSearch || status
              ? 'Essaie de modifier les filtres.'
              : 'Les nouvelles commandes apparaîtront ici.'
          }
        />
      ) : (
        <div className={isFetching ? 'opacity-70 transition-opacity' : ''}>
          {/* Desktop */}
          <div className="hidden md:block space-y-6">
            {groups.map((group) => (
              <div key={group.status}>
                {!status && (
                  <div className="flex items-center gap-3 mb-2">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        ORDER_STATUS_SECTION_TONE[group.status] || 'text-ink-400'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[group.status]} ({group.items.length})
                    </span>
                    <span className="flex-1 h-px bg-surface-border" />
                  </div>
                )}
                <div className="card overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-surface-subtle text-ink-600">
                      <tr>
                        <th className="px-4 py-2.5 text-left text-xs font-medium w-20">#</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium">Client</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium">Produits</th>
                        <th className="px-4 py-2.5 text-right text-xs font-medium w-32">Total</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium w-40">Statut</th>
                        <th className="px-4 py-2.5 w-16" />
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-surface-border">
                      {group.items.map((order) => (
                        <OrderRow key={order.id} order={order} />
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile */}
          <ul className="md:hidden space-y-3">
            {groups.map((group) => (
              <li key={group.status} className="space-y-3">
                {!status && (
                  <div className="flex items-center gap-3 px-1 pt-2">
                    <span
                      className={`text-xs font-semibold uppercase tracking-wide ${
                        ORDER_STATUS_SECTION_TONE[group.status] || 'text-ink-400'
                      }`}
                    >
                      {ORDER_STATUS_LABELS[group.status]} ({group.items.length})
                    </span>
                    <span className="flex-1 h-px bg-surface-border" />
                  </div>
                )}
                <ul className="space-y-3">
                  {group.items.map((order) => (
                    <OrderCardMobile
                      key={order.id}
                      order={order}
                      onPrimaryAction={onPrimaryAction}
                      isUpdating={updatingId === order.id}
                    />
                  ))}
                </ul>
              </li>
            ))}
          </ul>

          {/* Pagination */}
          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-ink-600">
                Page {meta.page} sur {meta.pages}
              </p>
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

function LoadingView() {
  return (
    <>
      <div className="card hidden md:block divide-y divide-surface-border">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
            <Skeleton className="h-4 w-12" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-3 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-20" />
          </div>
        ))}
      </div>
      <div className="md:hidden space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="card p-4 space-y-2">
            <Skeleton className="h-3 w-24" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>
    </>
  )
}