// src/components/client/ProductCard.jsx
import { memo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuPackage, LuShoppingCart, LuEye } from 'react-icons/lu';
import { formatCurrency } from '../../utils/format.js';
import { useAddCartItem } from '../../features/cart/useCart.js';
import { cartUI } from '../../features/cart/uiStore.js';
import { toast } from '../ui/Toast.jsx';

function ProductCard({ product }) {
  const navigate = useNavigate();
  const addCartItem = useAddCartItem();

  const {
    id,
    name,
    product_type: productType,
    category,
    brand,
    price,
    promotional_price: promoPrice,
    is_on_promo: isOnPromo,
    has_variants: hasVariants,
    availability,
    primary_image: image,
  } = product;

  const isDigital = productType === 'digital';
  const outOfStock = !isDigital && availability === 'out_of_stock';
  const detailPath = isDigital ? `/subscriptions/${id}` : `/products/${id}`;
  const metaLine = [category?.name, brand?.name].filter(Boolean).join(' · ');

  const showAdd = !isDigital && !outOfStock && !hasVariants;
  const showView = (isDigital || hasVariants) && !outOfStock;

  function onAdd(e) {
    e.preventDefault();
    e.stopPropagation();
    addCartItem.mutate(
      { product_id: id, quantity: 1 },
      {
        onSuccess: (data) => {
          const added = data?.items?.find(
            (i) => i.product_id === id && (i.variant_id ?? null) === null
          );
          cartUI.open(added?.id ?? null);
        },
        onError: (err) => toast.error(err?.message || 'Erreur'),
      }
    );
  }

  function onView(e) {
    e.preventDefault();
    e.stopPropagation();
    navigate(detailPath);
  }

  return (
    <div className="group h-full flex flex-col bg-white border border-surface-border rounded-card overflow-hidden hover:border-brand-500 transition-colors">
      <Link to={detailPath} className="relative block aspect-square bg-surface-subtle">
        {image ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            className={`w-full h-full object-cover ${outOfStock ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-400">
            <LuPackage size={32} aria-hidden="true" />
          </div>
        )}

        {!isDigital && isOnPromo && !outOfStock && (
          <span className="absolute top-2 left-2 bg-success text-white text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Promo
          </span>
        )}

        {outOfStock && (
          <span className="absolute top-2 right-2 bg-danger text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Rupture
          </span>
        )}

        {(showAdd || showView) && (
          <button
            type="button"
            onClick={showAdd ? onAdd : onView}
            disabled={addCartItem.isPending}
            aria-label={showAdd ? 'Ajouter au panier' : 'Voir les options'}
            className="absolute bottom-2 right-2 w-10 h-10 rounded-full flex items-center justify-center shadow-card
                       bg-white text-ink-700 border border-surface-border
                       transition-all duration-200
                       lg:opacity-0 lg:translate-y-1 lg:group-hover:opacity-100 lg:group-hover:translate-y-0
                       hover:bg-brand-500 hover:text-white hover:border-brand-500
                       focus-visible:ring-2 focus-visible:ring-brand-500/40
                       disabled:opacity-50 disabled:pointer-events-none"
          >
            {showAdd ? <LuShoppingCart size={16} /> : <LuEye size={16} />}
          </button>
        )}
      </Link>

      <Link to={detailPath} className="p-3 flex flex-col flex-1">
        <p className="text-sm font-medium text-ink-900 line-clamp-2 min-h-[2.5rem]">
          {name}
        </p>
        {metaLine && <p className="text-xs text-ink-600 truncate mt-1">{metaLine}</p>}

        <div className="mt-2 flex-1 flex items-end">
          {isDigital ? (
            <span className="text-sm font-semibold text-ink-900">
              À partir de {formatCurrency(price)}
            </span>
          ) : promoPrice ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base font-semibold text-ink-900">
                {formatCurrency(promoPrice)}
              </span>
              <span className="text-xs text-ink-400 line-through">
                {formatCurrency(price)}
              </span>
            </div>
          ) : (
            <span className="text-base font-semibold text-ink-900">
              {formatCurrency(price)}
            </span>
          )}
        </div>
      </Link>
    </div>
  );
}

export default memo(ProductCard);