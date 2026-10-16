// src/pages/admin/Catalog/CatalogPage.jsx
import { useMemo, useState } from 'react'
import { LuPlus, LuTag, LuFolderTree } from 'react-icons/lu'

import {
  useAdminBrands,
  useCreateBrand,
  useUpdateBrand,
  useToggleBrandStatus,
} from '../../../features/brands/useAdminBrands'
import {
  useAdminCategories,
  useCreateCategory,
  useUpdateCategory,
  useToggleCategoryStatus,
} from '../../../features/categories/useAdminCategories'

import { toast } from '../../../components/ui/Toast'
import PageHeader from '../../../components/ui/PageHeader'
import Button from '../../../components/ui/Button'
import EmptyState from '../../../components/ui/EmptyState'
import Skeleton from '../../../components/ui/Skeleton'

import CatalogRow from '../../../components/admin/catalog/CatalogRow'
import BrandFormModal from '../../../components/admin/catalog/BrandFormModal'
import CategoryFormModal from '../../../components/admin/catalog/CategoryFormModal'

export default function CatalogPage() {
  const [tab, setTab] = useState('brands')
  const [modal, setModal] = useState(null) // { type: 'brand'|'category', item?: object }

  /* -------------------- Queries -------------------- */
  const {
    data: brands = [],
    isLoading: brandsLoading,
    isError: brandsError,
    error: brandsErr,
  } = useAdminBrands()

  const {
    data: categories = [],
    isLoading: catsLoading,
    isError: catsError,
    error: catsErr,
  } = useAdminCategories()

  /* -------------------- Mutations -------------------- */
  const createBrand = useCreateBrand()
  const updateBrand = useUpdateBrand(modal?.item?.id)
  const toggleBrand = useToggleBrandStatus()

  const createCategory = useCreateCategory()
  const updateCategory = useUpdateCategory(modal?.item?.id)
  const toggleCategory = useToggleCategoryStatus()

  /* -------------------- Derived data -------------------- */
  const brandCounts = useMemo(() => {
    const map = {}
    brands.forEach((b) => {
      (b.category_ids ?? []).forEach((cid) => {
        map[cid] = (map[cid] ?? 0) + 1
      })
    })
    return map
  }, [brands])

  /* -------------------- Handlers -------------------- */
  const closeModal = () => setModal(null)

  const handleBrandSubmit = (payload) => {
    const isEdit = Boolean(modal?.item?.id)
    const mutation = isEdit ? updateBrand : createBrand

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEdit ? 'Marque mise à jour' : 'Marque créée')
        closeModal()
      },
      onError: (err) => toast.error('Échec', { message: err.message }),
    })
  }

  const handleCategorySubmit = (payload) => {
    const isEdit = Boolean(modal?.item?.id)
    const mutation = isEdit ? updateCategory : createCategory

    mutation.mutate(payload, {
      onSuccess: () => {
        toast.success(isEdit ? 'Catégorie mise à jour' : 'Catégorie créée')
        closeModal()
      },
      onError: (err) => toast.error('Échec', { message: err.message }),
    })
  }

  const handleToggleBrand = (brand) => {
    toggleBrand.mutate(
      { id: brand.id, is_active: !brand.is_active },
      {
        onSuccess: () =>
          toast.success(brand.is_active ? 'Marque désactivée' : 'Marque activée'),
        onError: (err) => toast.error('Échec', { message: err.message }),
      }
    )
  }

  const handleToggleCategory = (category) => {
    toggleCategory.mutate(
      { id: category.id, is_active: !category.is_active },
      {
        onSuccess: () =>
          toast.success(
            category.is_active ? 'Catégorie désactivée' : 'Catégorie activée'
          ),
        onError: (err) => toast.error('Échec', { message: err.message }),
      }
    )
  }

  /* -------------------- Render -------------------- */
  const isBrandsTab = tab === 'brands'

  return (
    <>
      <PageHeader
        title="Marques & Catégories"
        description="Gère les marques et les catégories de ta boutique."
      />

      {/* Tabs */}
      <div className="flex gap-1 border-b border-surface-border mb-5">
        <TabButton
          active={isBrandsTab}
          onClick={() => setTab('brands')}
          icon={LuTag}
          label="Marques"
        />
        <TabButton
          active={!isBrandsTab}
          onClick={() => setTab('categories')}
          icon={LuFolderTree}
          label="Catégories"
        />
      </div>

      {/* Header row */}
      <div className="flex items-center justify-between gap-3 mb-4">
        <p className="text-sm text-ink-600">
          {isBrandsTab
            ? brandsLoading
              ? 'Chargement…'
              : `${brands.length} marque${brands.length > 1 ? 's' : ''}`
            : catsLoading
              ? 'Chargement…'
              : `${categories.length} catégorie${categories.length > 1 ? 's' : ''}`}
        </p>

        <Button
          onClick={() => setModal({ type: isBrandsTab ? 'brand' : 'category' })}
        >
          <LuPlus size={16} />
          <span className="hidden sm:inline">
            {isBrandsTab ? 'Nouvelle marque' : 'Nouvelle catégorie'}
          </span>
          <span className="sm:hidden">Nouvelle</span>
        </Button>
      </div>

      {/* List */}
      {isBrandsTab ? (
        <BrandsList
          isLoading={brandsLoading}
          isError={brandsError}
          error={brandsErr}
          brands={brands}
          categories={categories}
          onEdit={(item) => setModal({ type: 'brand', item })}
          onToggle={handleToggleBrand}
        />
      ) : (
        <CategoriesList
          isLoading={catsLoading}
          isError={catsError}
          error={catsErr}
          categories={categories}
          brandCounts={brandCounts}
          onEdit={(item) => setModal({ type: 'category', item })}
          onToggle={handleToggleCategory}
        />
      )}

      {/* Modals */}
      {modal?.type === 'brand' && (
        <BrandFormModal
          isEdit={Boolean(modal.item)}
          initialName={modal.item?.name ?? ''}
          initialCategoryIds={modal.item?.category_ids ?? []}
          categories={categories}
          isPending={createBrand.isPending || updateBrand.isPending}
          onSubmit={handleBrandSubmit}
          onClose={closeModal}
        />
      )}

      {modal?.type === 'category' && (
        <CategoryFormModal
          isEdit={Boolean(modal.item)}
          initialName={modal.item?.name ?? ''}
          isPending={createCategory.isPending || updateCategory.isPending}
          onSubmit={handleCategorySubmit}
          onClose={closeModal}
        />
      )}
    </>
  )
}

/* ================================================================
   Tabs + Lists — small local helpers
   ================================================================ */

function TabButton({ active, onClick, icon: Icon, label }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`relative inline-flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors ${
        active ? 'text-brand-600' : 'text-ink-600 hover:text-ink-900'
      }`}
    >
      <Icon size={16} />
      {label}
      {active && (
        <span className="absolute bottom-0 left-2 right-2 h-0.5 bg-brand-500 rounded-full" />
      )}
    </button>
  )
}

function BrandsList({
  isLoading,
  isError,
  error,
  brands,
  categories,
  onEdit,
  onToggle,
}) {
  if (isLoading) return <LoadingRows />
  if (isError) {
    return (
      <EmptyState
        icon={LuTag}
        title="Impossible de charger les marques"
        description={error?.message}
      />
    )
  }
  if (brands.length === 0) {
    return (
      <EmptyState
        icon={LuTag}
        title="Aucune marque"
        description="Ajoute ta première marque pour commencer."
      />
    )
  }

  return (
    <div className="card divide-y divide-surface-border">
      {brands.map((b) => {
        const badges = (b.category_ids ?? [])
          .map((id) => categories.find((c) => c.id === id)?.name)
          .filter(Boolean)

        return (
          <CatalogRow
            key={b.id}
            title={b.name}
            badges={badges}
            subtitle={badges.length === 0 ? 'Aucune catégorie liée' : undefined}
            isActive={b.is_active}
            onToggle={() => onToggle(b)}
            onEdit={() => onEdit(b)}
          />
        )
      })}
    </div>
  )
}

function CategoriesList({
  isLoading,
  isError,
  error,
  categories,
  brandCounts,
  onEdit,
  onToggle,
}) {
  if (isLoading) return <LoadingRows />
  if (isError) {
    return (
      <EmptyState
        icon={LuFolderTree}
        title="Impossible de charger les catégories"
        description={error?.message}
      />
    )
  }
  if (categories.length === 0) {
    return (
      <EmptyState
        icon={LuFolderTree}
        title="Aucune catégorie"
        description="Ajoute ta première catégorie pour commencer."
      />
    )
  }

  return (
    <div className="card divide-y divide-surface-border">
      {categories.map((c) => {
        const count = brandCounts[c.id] ?? 0
        const subtitle =
          count === 0
            ? 'Aucune marque liée'
            : `${count} marque${count > 1 ? 's' : ''} liée${count > 1 ? 's' : ''}`

        return (
          <CatalogRow
            key={c.id}
            title={c.name}
            subtitle={subtitle}
            isActive={c.is_active}
            onToggle={() => onToggle(c)}
            onEdit={() => onEdit(c)}
          />
        )
      })}
    </div>
  )
}

function LoadingRows() {
  return (
    <div className="card divide-y divide-surface-border">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={i} className="p-4 flex items-center gap-4">
          <div className="flex-1 space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-3 w-48" />
          </div>
          <Skeleton className="h-5 w-16" />
        </div>
      ))}
    </div>
  )
}