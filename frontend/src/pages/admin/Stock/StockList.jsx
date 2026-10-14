// src/pages/admin/Stock/StockList.jsx
import { useState, useMemo } from 'react'
import { useSearchParams } from 'react-router-dom'
import {
  LuSearch, LuPackage, LuChevronLeft, LuChevronRight,
} from 'react-icons/lu'

import { useAdminStock } from '../../../features/stock/useAdminStock'
import { useCategories } from '../../../features/categories/useCategories'
import { useBrands } from '../../../features/brands/useBrands'
import { useDebounced } from '../../../utils/useDebounced'

import PageHeader from '../../../components/ui/PageHeader'
import EmptyState from '../../../components/ui/EmptyState'
import Skeleton from '../../../components/ui/Skeleton'
import Select from '../../../components/ui/Select'
import EntityPicker from '../../../components/ui/EntityPicker'

import StockCard from '../../../components/admin/stock/StockCard'
import StockAdjustDialog from '../../../components/admin/stock/StockAdjustDialog'
import ThresholdDialog from '../../../components/admin/stock/ThresholdDialog'

const PAGE_SIZE = 20

const STATUS_OPTIONS = [
  { value: 'all',    label: 'Tout' },
  { value: 'issues', label: 'Problèmes' },
  { value: 'out',    label: 'Ruptures' },
  { value: 'low',    label: 'Stocks bas' },
]

export default function StockList() {
  const [params, setParams] = useSearchParams()

  const [searchInput, setSearchInput] = useState(params.get('search') || '')
  const debouncedSearch = useDebounced(searchInput, 300)

  const stockStatus = params.get('stock_status') || 'all'   // ← default "all"
  const categoryId = params.get('category_id') || ''
  const brandId = params.get('brand_id') || ''
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

  const { data: catList, isLoading: catLoading } = useCategories()
  const categoryOptions = useMemo(
    () => (catList ?? []).map((c) => ({ value: c.id, label: c.name })),
    [catList]
  )

  const { data: brandList, isLoading: brandLoading } = useBrands(categoryId || undefined)
  const brandOptions = useMemo(
    () => (brandList ?? []).map((b) => ({ value: b.id, label: b.name })),
    [brandList]
  )

  const filters = useMemo(
    () => ({
      page,
      limit: PAGE_SIZE,
      stock_status: stockStatus,
      ...(search && { search }),
      ...(categoryId && { category_id: categoryId }),
      ...(brandId && { brand_id: brandId }),
    }),
    [page, stockStatus, search, categoryId, brandId]
  )

  const { data, isLoading, isError, error, isFetching } = useAdminStock(filters)
  const items = data?.items ?? []
  const meta = data?.meta

  const [adjustTarget, setAdjustTarget] = useState(null)
  const [thresholdTarget, setThresholdTarget] = useState(null)

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
        title="Stock"
        description="Suis et ajuste ton inventaire."
      />

      {stockStatus === 'issues' && meta?.total > 0 && (
        <p className="text-sm text-ink-600 mb-4">
          <span className="font-medium text-ink-900">{meta.total}</span>{' '}
          produit{meta.total > 1 ? 's ont' : ' a'} besoin d'attention.
        </p>
      )}

      {/* Toolbar */}
      <div className="flex flex-col sm:flex-row flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[200px]">
          <LuSearch
            size={16}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-400 pointer-events-none"
          />
          <input
            className="input pl-10"
            placeholder="Rechercher un produit…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
        </div>

        <div className="sm:w-48">
          <EntityPicker
            options={categoryOptions}
            isLoading={catLoading}
            value={categoryId}
            onChange={(e) => {
              const next = new URLSearchParams(params)
              if (e.target.value) next.set('category_id', e.target.value)
              else next.delete('category_id')
              next.delete('brand_id')
              next.delete('page')
              setParams(next, { replace: true })
            }}
            includeAll
            placeholder="Toutes catégories"
          />
        </div>

        <div className="sm:w-44">
          <EntityPicker
            options={brandOptions}
            isLoading={brandLoading}
            value={brandId}
            onChange={(e) => setParam('brand_id', e.target.value)}
            includeAll
            placeholder="Toutes marques"
          />
        </div>

        <Select
          className="sm:w-44"
          value={stockStatus}
          onChange={(e) => setParam('stock_status', e.target.value)}
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </div>

      {/* Content */}
      {isLoading ? (
        <LoadingView />
      ) : isError ? (
        <EmptyState
          icon={LuPackage}
          title="Impossible de charger le stock"
          description={error?.message || 'Réessaye dans un instant.'}
        />
      ) : items.length === 0 ? (
        <EmptyState
          icon={LuPackage}
          title={
            stockStatus === 'issues' && !search
              ? 'Tout est en ordre'
              : 'Aucun résultat'
          }
          description={
            stockStatus === 'issues' && !search
              ? 'Aucun produit ne nécessite ton attention.'
              : 'Essaie de modifier les filtres.'
          }
        />
      ) : (
        <div className={isFetching ? 'opacity-70 transition-opacity' : ''}>
          <div className="space-y-3">
            {items.map((p) => (
              <StockCard
                key={p.id}
                product={p}
                onAdjust={setAdjustTarget}
                onEditThreshold={setThresholdTarget}
              />
            ))}
          </div>

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

      {adjustTarget && (
        <StockAdjustDialog
          target={adjustTarget}
          onClose={() => setAdjustTarget(null)}
        />
      )}

      {thresholdTarget && (
        <ThresholdDialog
          target={thresholdTarget}
          onClose={() => setThresholdTarget(null)}
        />
      )}
    </>
  )
}

function LoadingView() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 3 }).map((_, i) => (
        <div key={i} className="card p-4">
          <div className="flex items-start gap-3">
            <Skeleton className="w-14 h-14" />
            <div className="flex-1 space-y-2">
              <Skeleton className="h-4 w-48" />
              <Skeleton className="h-3 w-32" />
              <Skeleton className="h-6 w-40 mt-3" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}