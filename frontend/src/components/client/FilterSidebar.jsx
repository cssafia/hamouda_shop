import { useEffect, useRef, useState } from 'react';
import Switch from '../ui/Switch.jsx';
import { USAGES } from '../../constants/product.js';

const PRICE_DEBOUNCE_MS = 400;

export default function FilterSidebar({
  filters,
  setFilter,
  reset,
  categories = [],
  brands = [],
  categoriesLoading,
  brandsLoading,
}) {
  const [localMin, setLocalMin] = useState(filters.price_min || '');
  const [localMax, setLocalMax] = useState(filters.price_max || '');
  const timerRef = useRef(null);

  // Keep local price inputs in sync when filters are cleared externally
  // (e.g. "Réinitialiser" or a chip removal), without fighting user typing.
  useEffect(() => {
    setLocalMin(filters.price_min || '');
    setLocalMax(filters.price_max || '');
  }, [filters.price_min, filters.price_max]);

  function schedulePriceUpdate(min, max) {
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      setFilter('price_min', min || undefined);
      setFilter('price_max', max || undefined);
    }, PRICE_DEBOUNCE_MS);
  }

  const hasActiveFilters =
    filters.category_id || filters.brand_id || filters.usage || filters.price_min || filters.price_max || filters.availability;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold text-ink-900">Filtres</p>
        {hasActiveFilters && (
          <button onClick={reset} className="text-xs text-brand-600 hover:underline">
            Réinitialiser
          </button>
        )}
      </div>

      {/* Category */}
      <div>
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Catégorie</p>
        {!categoriesLoading && (
          <div className="space-y-1">
            {categories.map((cat) => (
              <label key={cat.id} className="flex items-center gap-2 text-sm text-ink-900 cursor-pointer py-1">
                <input
                  type="radio"
                  name="category_id"
                  checked={String(filters.category_id) === String(cat.id)}
                  onChange={() => setFilter('category_id', cat.id)}
                  className="accent-brand-500 w-4 h-4"
                />
                {cat.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Brand */}
      <div>
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Marque</p>
        {!brandsLoading && (
          <div className="space-y-1">
            {brands.map((brand) => (
              <label key={brand.id} className="flex items-center gap-2 text-sm text-ink-900 cursor-pointer py-1">
                <input
                  type="radio"
                  name="brand_id"
                  checked={String(filters.brand_id) === String(brand.id)}
                  onChange={() => setFilter('brand_id', brand.id)}
                  className="accent-brand-500 w-4 h-4"
                />
                {brand.name}
              </label>
            ))}
          </div>
        )}
      </div>

      {/* Usage */}
      <div>
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Utilisation</p>
        <div className="flex flex-wrap gap-2">
          {USAGES.map((usage) => {
            const active = filters.usage === usage.slug;
            return (
              <button
                key={usage.slug}
                onClick={() => setFilter('usage', active ? undefined : usage.slug)}
                className={`text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  active
                    ? 'bg-brand-500 text-white border-brand-500'
                    : 'bg-white text-ink-600 border-surface-border hover:border-brand-500'
                }`}
              >
                {usage.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Price */}
      <div>
        <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-2">Prix (DA)</p>
        <div className="flex items-center gap-2">
          <input
            type="number"
            inputMode="numeric"
            placeholder="Min"
            value={localMin}
            onChange={(e) => {
              setLocalMin(e.target.value);
              schedulePriceUpdate(e.target.value, localMax);
            }}
            className="input w-full text-sm"
          />
          <span className="text-ink-400">–</span>
          <input
            type="number"
            inputMode="numeric"
            placeholder="Max"
            value={localMax}
            onChange={(e) => {
              setLocalMax(e.target.value);
              schedulePriceUpdate(localMin, e.target.value);
            }}
            className="input w-full text-sm"
          />
        </div>
      </div>

      {/* Availability */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-ink-900">En stock uniquement</p>
        <Switch
          checked={filters.availability === 'available'}
          onChange={(checked) => setFilter('availability', checked ? 'available' : undefined)}
        />
      </div>
    </div>
  );
}