import { Link } from 'react-router-dom';
import { formatCurrency } from '../../utils/format.js';

export default function SubscriptionCard({ product }) {
  const { id, name, price, duration } = product; // duration: not in list contract yet, renders only if present

  return (
    <Link
      to={`/subscriptions/${id}`}
      className="group block bg-brand-50/40 border border-surface-border rounded-card p-4 text-center
                 hover:border-brand-500 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40"
    >
      <p className="text-sm font-semibold text-ink-900">{name}</p>
      {duration && <p className="text-xs text-ink-600 mt-1">{duration}</p>}
      <p className="text-sm font-semibold text-brand-700 mt-2">{formatCurrency(price)}</p>
      <span className="text-xs text-brand-600 mt-2 inline-block group-hover:underline">Voir →</span>
    </Link>
  );
}