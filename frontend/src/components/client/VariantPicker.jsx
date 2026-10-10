import { formatCurrency } from '../../utils/format.js';


function getDifferentiatingSpecNames(variants = []) {
  const names = new Set();
  for (const v of variants) {
    for (const o of v.overrides ?? []) {
      if (o?.name) names.add(o.name);
    }
  }
  return [...names];
}

function findBySpecName(list = [], name) {
  if (!name) return null;
  const needle = name.toLowerCase();
  return list.find((item) => item?.name?.toLowerCase() === needle);
}

export default function VariantPicker({ product, value, onChange, showStock = true }) {
  const variants = product.variants ?? [];
  const specNames = getDifferentiatingSpecNames(variants);
  const singleSpec = specNames.length === 1 ? specNames[0] : null;

  // Heading: the spec name when there's only one differentiator.
  const heading = singleSpec ?? 'Configuration';

  const baseValue = singleSpec
    ? findBySpecName(product.specifications, singleSpec)?.value
    : null;

  const baseOption = {
    id: null,
    label: singleSpec ? (baseValue ?? 'Standard') : 'Standard',
    price: product.price,
    promotional_price: product.promotional_price,
    availability: product.availability,
  };

  const variantOptions = variants.map((v) => {
    const overrideValue = singleSpec
      ? findBySpecName(v.overrides, singleSpec)?.value
      : null;

    return {
      id: v.id,
      label: singleSpec ? (overrideValue ?? v.name) : v.name,
      price: v.price,
      promotional_price: v.promotional_price,
      availability: v.availability,
    };
  });

  const options = [baseOption, ...variantOptions];

  return (
    <div>
      <p className="text-sm font-medium text-ink-900 mb-2">{heading}</p>

      <div className="-mx-4 px-4 sm:mx-0 sm:px-0 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 min-w-min">
          {options.map((option) => {
            const isSelected = value === option.id;
            const isOut = showStock && option.availability === 'out_of_stock';
            const hasPromo =
              option.promotional_price != null &&
              option.promotional_price < option.price;

            return (
              <button
                key={option.id ?? 'base'}
                type="button"
                aria-pressed={isSelected}
                onClick={() => onChange(option.id)}
                className={`relative shrink-0 min-w-[110px] px-3 py-2.5 rounded-control border text-left transition-colors
                  ${isSelected
                    ? 'border-brand-500 bg-brand-50/60 ring-1 ring-brand-500/20'
                    : 'border-surface-border bg-white hover:border-brand-500'
                  }
                `}
              >
                <p
                  className={`text-sm font-medium truncate ${
                    isOut ? 'text-ink-400' : 'text-ink-900'
                  }`}
                  title={option.label}
                >
                  {option.label}
                </p>

                <div className="mt-1 flex items-baseline gap-1.5 flex-wrap">
                  {hasPromo ? (
                    <>
                      <span
                        className={`text-xs font-semibold ${
                          isOut ? 'text-ink-400' : 'text-ink-900'
                        }`}
                      >
                        {formatCurrency(option.promotional_price)}
                      </span>
                      <span className="text-[10px] text-ink-400 line-through">
                        {formatCurrency(option.price)}
                      </span>
                    </>
                  ) : (
                    <span
                      className={`text-xs font-semibold ${
                        isOut ? 'text-ink-400' : 'text-ink-900'
                      }`}
                    >
                      {formatCurrency(option.price)}
                    </span>
                  )}
                </div>

                {isOut && (
                  <span className="absolute top-1.5 right-1.5 text-[9px] font-bold text-danger uppercase tracking-wide">
                    Rupture
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}