import { LuX } from 'react-icons/lu';
import ScrollableRow from './ScrollableRow.jsx';
import { USAGES } from '../../constants/product.js';

function buildChips(filters, categories, brands) {
  const chips = [];

  if (filters.category_id) {
    const cat = categories.find((c) => String(c.id) === String(filters.category_id));
    if (cat) chips.push({ key: 'category_id', label: cat.name });
  }
  if (filters.brand_id) {
    const brand = brands.find((b) => String(b.id) === String(filters.brand_id));
    if (brand) chips.push({ key: 'brand_id', label: brand.name });
  }
  if (filters.usage) {
    const usage = USAGES.find((u) => u.slug === filters.usage);
    chips.push({ key: 'usage', label: usage?.label || filters.usage });
  }
  if (filters.price_min || filters.price_max) {
    const min = filters.price_min ? `${filters.price_min} DA` : '0';
    const max = filters.price_max ? `${filters.price_max} DA` : '+';
    chips.push({ key: 'price', label: `${min} – ${max}`, clears: ['price_min', 'price_max'] });
  }
  if (filters.availability === 'available') {
    chips.push({ key: 'availability', label: 'En stock' });
  }
  if (filters.search) {
    chips.push({ key: 'search', label: `"${filters.search}"` });
  }

  return chips;
}

export default function FilterChips({ filters, categories = [], brands = [], onRemove }) {
  const chips = buildChips(filters, categories, brands);

  if (chips.length === 0) return null;

  return (
    <ScrollableRow showArrows={false} className="mb-4">
      {chips.map((chip) => (
        <button
          key={chip.key}
          onClick={() => onRemove(chip.clears || [chip.key])}
          className="shrink-0 flex items-center gap-1.5 bg-brand-50 text-brand-700 text-xs font-medium
                     px-3 py-1.5 rounded-full hover:bg-brand-100 transition-colors"
        >
          {chip.label}
          <LuX size={14} aria-hidden="true" />
        </button>
      ))}
    </ScrollableRow>
  );
}