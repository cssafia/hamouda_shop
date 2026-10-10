import { Link } from 'react-router-dom';
import { LuArrowRight } from 'react-icons/lu';
import { USAGES } from '../../constants/product';

export default function UsageDiscovery() {
  return (
    <section aria-labelledby="usage-heading" className="py-16 lg:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h2 id="usage-heading" className="text-2xl lg:text-3xl font-semibold text-ink-900 mb-6">
          واش راك تقلب عليه؟
        </h2>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 lg:gap-4">
          {USAGES.map((usage) => (
            <Link
              key={usage.key}
              to={`/products?usage=${usage.key}`}
              className="group relative bg-white border border-surface-border rounded-card p-5 text-center
                         hover:border-brand-500 hover:-translate-y-0.5 transition-all
                         focus-visible:ring-2 focus-visible:ring-brand-500/40"
            >
              <p className="text-sm font-medium text-ink-900">{usage.label}</p>
              <LuArrowRight
                size={16}
                aria-hidden="true"
                className="mx-auto mt-2 text-brand-500 opacity-0 group-hover:opacity-100 transition-opacity"
              />
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}