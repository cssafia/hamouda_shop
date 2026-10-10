import { formatCurrency } from '../../utils/format.js';

export default function PriceTag({ price, promotionalPrice }) {
  if (promotionalPrice) {
    return (
      <div className="flex items-baseline gap-2">
        <span className="text-base font-semibold text-ink-900">
          {formatCurrency(promotionalPrice)}
        </span>
        <span className="text-xs text-ink-400 line-through">{formatCurrency(price)}</span>
      </div>
    );
  }

  return <span className="text-base font-semibold text-ink-900">{formatCurrency(price)}</span>;
}