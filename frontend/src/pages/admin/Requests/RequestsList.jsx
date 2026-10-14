// src/pages/admin/Requests/RequestsList.jsx
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LuSearch, LuInbox, LuChevronLeft, LuChevronRight,
} from 'react-icons/lu'

import { useAdminServiceRequests } from '../../../features/services/useAdminServiceRequests'
import { useDebounced } from '../../../utils/useDebounced'
import {
  SERVICE_REQUEST_STATUSES,
  SERVICE_REQUEST_STATUS_LABELS,
} from '../../../constants/serviceRequests'

import PageHeader from '../../../components/ui/PageHeader'
import EmptyState from '../../../components/ui/EmptyState'
import Skeleton from '../../../components/ui/Skeleton'
import Select from '../../../components/ui/Select'
import RequestRow from '../../../components/admin/requests/RequestRow'
import RequestCard from '../../../components/admin/requests/RequestCard'

const PAGE_SIZE = 20

export default function RequestsList() {
  const [params, setParams] = useSearchParams()

  const [searchInput, setSearchInput] = useState(params.get('search') || '')
  const debouncedSearch = useDebounced(searchInput, 300)

  const status = params.get('status') ?? 'pending'   // default = pending
  const search = params.get('search') || ''
  const page = Number(params.get('page')) || 1

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
      ...(search && { search }),
    }),
    [page, status, search]
  )

  const { data, isLoading, isError, error, isFetching } =
    useAdminServiceRequests(filters)
  const items = data?.items ?? []
  const meta = data?.meta

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
        title="Demandes"
        description="Suis et traite les demandes de service."
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
            placeholder="Rechercher par nom, téléphone ou service…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <Select
          className="sm:w-48"
          value={status}
          onChange={(e) => setParam('status', e.target.value)}
        >
          <option value="">Toutes les demandes</option>
          {SERVICE_REQUEST_STATUSES.map((s) => (
            <option key={s} value={s}>
              {SERVICE_REQUEST_STATUS_LABELS[s]}
            </option>
          ))}
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <EmptyState
          icon={LuInbox}
          title="Impossible de charger les demandes"
          description={error?.message || 'Réessaye dans un instant.'}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={LuInbox}
          title={
            status === 'pending'
              ? 'Aucune demande en attente'
              : 'Aucun résultat'
          }
          description={
            status === 'pending'
              ? 'Toutes les demandes ont été traitées.'
              : 'Essaie de modifier les filtres.'
          }
        />
      ) : (
        <div className={isFetching ? 'opacity-70 transition-opacity' : ''}>
          {/* Desktop */}
          <div className="card overflow-hidden hidden md:block">
            <table className="w-full text-sm">
              <thead className="bg-surface-subtle text-ink-600">
                <tr>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide">
                    Client
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide">
                    Service
                  </th>
                  <th className="px-4 py-3 text-left font-medium text-xs uppercase tracking-wide w-44">
                    Statut
                  </th>
                  <th className="px-4 py-3 w-16" />
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {items.map((r) => (
                  <RequestRow key={r.id} request={r} />
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <ul className="md:hidden space-y-3">
            {items.map((r) => (
              <RequestCard key={r.id} request={r} />
            ))}
          </ul>

          {/* Pagination */}
          {meta && meta.pages > 1 && (
            <div className="flex items-center justify-between mt-5">
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
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 p-4">
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
            <Skeleton className="h-3 w-32" />
            <Skeleton className="h-3 w-40" />
            <Skeleton className="h-3 w-24" />
          </div>
        ))}
      </div>
    </>
  )
}