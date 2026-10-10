import { useSearchParams } from 'react-router-dom';
import { LuSlidersHorizontal, LuPackage, LuRefreshCw } from 'react-icons/lu';
import { useState } from 'react';
import { useProducts } from '../../../features/products/useProducts.js';
import { useCategories } from '../../../features/categories/useCategories.js';
import { useBrands } from '../../../features/brands/useBrands.js';
import ProductCard from '../../../components/client/ProductCard.jsx';
import FilterSidebar from '../../../components/client/FilterSidebar.jsx';
import FilterSheet from '../../../components/client/FilterSheet.jsx';
import FilterChips from '../../../components/client/FilterChips.jsx';
import SortDropdown from '../../../components/client/SortDropdown.jsx';
import Pagination from '../../../components/client/Pagination.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';

function ProductSkeleton() {
  return (
    <div className="bg-white border border-surface-border rounded-card overflow-hidden">
      <Skeleton className="aspect-square rounded-none w-full" />
      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-4/5" />
        <Skeleton className="h-3 w-1/2" />
        <Skeleton className="h-5 w-1/3 mt-2" />
      </div>
    </div>
  );
}

export default function ProductList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [sheetOpen, setSheetOpen] = useState(false);

  const filters = {
    category_id: searchParams.get('category_id') || undefined,
    brand_id: searchParams.get('brand_id') || undefined,
    usage: searchParams.get('usage') || undefined,
    price_min: searchParams.get('price_min') || undefined,
    price_max: searchParams.get('price_max') || undefined,
    availability: searchParams.get('availability') || undefined,
    search: searchParams.get('search') || undefined,
    sort: searchParams.get('sort') || 'newest',
    page: Number(searchParams.get('page')) || 1,
  };

  const { data: categories, isLoading: categoriesLoading } = useCategories();
  const { data: brands, isLoading: brandsLoading } = useBrands(filters.category_id);
  const { data, isLoading, isError, refetch } = useProducts({ ...filters, limit: 12 });

  const items = data?.items || [];
  const meta = data?.meta || { page: 1, pages: 1, total: 0 };

  function setFilter(key, value) {
    const next = new URLSearchParams(searchParams);
    if (value === undefined || value === '') next.delete(key);
    else next.set(key, value);
    next.set('page', '1');
    setSearchParams(next);
  }

  function removeFilters(keys) {
    const next = new URLSearchParams(searchParams);
    keys.forEach((key) => next.delete(key));
    next.set('page', '1');
    setSearchParams(next);
  }

  function resetAll() {
    setSearchParams(new URLSearchParams());
  }

  function goToPage(page) {
    const next = new URLSearchParams(searchParams);
    next.set('page', String(page));
    setSearchParams(next);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  const activeFilterCount = ['category_id', 'brand_id', 'usage', 'price_min', 'price_max', 'availability'].filter(
    (key) => filters[key]
  ).length;

  const sidebarProps = {
    filters,
    setFilter,
    reset: resetAll,
    categories: categories || [],
    brands: brands || [],
    categoriesLoading,
    brandsLoading,
  };

  const hasFilters = activeFilterCount > 0 || Boolean(filters.search);

  return (
    <section aria-labelledby="products-heading" className="py-6 lg:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-baseline justify-between mb-4 gap-3">
          <h1 id="products-heading" className="text-2xl lg:text-3xl font-semibold text-ink-900">
            Produits
          </h1>
          {!isLoading && !isError && (
            <p className="text-sm text-ink-600 shrink-0">
              {meta.total} résultat{meta.total !== 1 ? 's' : ''}
            </p>
          )}
        </div>

        <div className="flex items-center gap-2 mb-4 lg:hidden">
          <button
            type="button"
            onClick={() => setSheetOpen(true)}
            className="btn-secondary flex-1 flex items-center justify-center gap-2"
          >
            <LuSlidersHorizontal size={16} aria-hidden="true" />
            Filtres
            {activeFilterCount > 0 && (
              <span className="bg-brand-500 text-white text-xs font-semibold w-5 h-5 rounded-full flex items-center justify-center">
                {activeFilterCount}
              </span>
            )}
          </button>
          <div className="flex-1">
            <SortDropdown value={filters.sort} onChange={(v) => setFilter('sort', v)} />
          </div>
        </div>

        <FilterChips
          filters={filters}
          categories={categories || []}
          brands={brands || []}
          onRemove={removeFilters}
        />

        <div className="lg:grid lg:grid-cols-[240px_1fr] lg:gap-8">
          <aside className="hidden lg:block">
            <div className="sticky top-20">
              <FilterSidebar {...sidebarProps} />
            </div>
          </aside>

          <div>
            <div className="hidden lg:flex justify-end mb-4">
              <SortDropdown value={filters.sort} onChange={(v) => setFilter('sort', v)} />
            </div>

            {isLoading && (
              <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                {Array.from({ length: 8 }).map((_, i) => (
                  <ProductSkeleton key={i} />
                ))}
              </div>
            )}

            {!isLoading && isError && (
              <EmptyState
                icon={LuPackage}
                title="Impossible de charger les produits"
                description="Vérifie ta connexion ou réessaie."
                action={
                  <button
                    onClick={() => refetch()}
                    className="btn-secondary mt-2 inline-flex items-center gap-2"
                  >
                    <LuRefreshCw size={16} /> Réessayer
                  </button>
                }
              />
            )}

            {!isLoading && !isError && items.length === 0 && (
              <EmptyState
                icon={LuPackage}
                title={hasFilters ? 'Aucun résultat' : 'Pas encore de produits'}
                description={
                  hasFilters
                    ? 'Essaie de retirer certains filtres.'
                    : 'Reviens bientôt, de nouveaux produits arrivent.'
                }
                action={
                  hasFilters && (
                    <button onClick={resetAll} className="btn-secondary mt-2">
                      Réinitialiser les filtres
                    </button>
                  )
                }
              />
            )}

            {!isLoading && !isError && items.length > 0 && (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-3 lg:gap-4">
                  {items.map((product) => (
                    <ProductCard key={product.id} product={product} />
                  ))}
                </div>
                <Pagination meta={meta} onPage={goToPage} />
              </>
            )}
          </div>
        </div>
      </div>

      <FilterSheet
        open={sheetOpen}
        onClose={() => setSheetOpen(false)}
        resultCount={meta.total}
      >
        <FilterSidebar {...sidebarProps} />
      </FilterSheet>
    </section>
  );
}