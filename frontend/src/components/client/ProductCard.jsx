// src/components/client/ProductCard.jsx
import { memo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuPackage, LuShoppingCart } from 'react-icons/lu';
import { formatCurrency } from '../../utils/format.js';
import { useAddCartItem } from '../../features/cart/useCart.js';
import { cartUI } from '../../features/cart/uiStore.js';
import { toast } from '../ui/Toast.jsx';

function ProductCard({ product }) {
  const addCartItem = useAddCartItem();
  const navigate = useNavigate();
  const [imgFailed, setImgFailed] = useState(false);

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

  // Badge, price and strikethrough all use the same condition, so they can't disagree.
  const hasPromo =
    !isDigital && Boolean(isOnPromo) && Number(promoPrice) > 0 && Number(promoPrice) < Number(price);

  const showImage = image && !imgFailed;

  function onAdd() {
    // A product with variants needs a variant_id, which only the detail page can pick.
    if (hasVariants) {
      navigate(detailPath);
      return;
    }
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

  return (
    // Same look as before. The button is a sibling of the links (a <button> inside a <Link> is invalid HTML).
    <div className="card h-full flex flex-col bg-white border border-surface-border rounded-card overflow-hidden hover:border-brand-500 transition-colors">
      <Link to={detailPath} aria-label={name} className="card relative block aspect-square bg-surface-subtle">
        {showImage ? (
          <img
            src={image}
            alt={name}
            loading="lazy"
            onError={() => setImgFailed(true)}
            className={`w-full h-full object-cover ${outOfStock ? 'grayscale' : ''}`}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-ink-400">
            <LuPackage size={32} aria-hidden="true" />
          </div>
        )}

        {hasPromo && !outOfStock && (
          <span className="absolute top-2 left-2 bg-success text-white text-xs font-semibold px-2 py-0.5 rounded-full uppercase tracking-wide">
            Promo
          </span>
        )}

        {outOfStock && (
          <span className="absolute top-2 right-2 bg-danger text-white text-xs font-semibold px-2.5 py-0.5 rounded-full">
            Rupture
          </span>
        )}
      </Link>

      <Link to={detailPath} className="p-3 pb-2 flex flex-col flex-1">
        <p className="text-sm font-medium text-ink-900 line-clamp-2 min-h-[2.5rem]">{name}</p>
        {metaLine && <p className="text-xs text-ink-600 truncate mt-1">{metaLine}</p>}

        <div className="mt-2 flex-1 flex items-end">
          {isDigital ? (
            <span className="text-sm font-semibold text-ink-900">À partir de {formatCurrency(price)}</span>
          ) : hasPromo ? (
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-base font-semibold text-ink-900">{formatCurrency(promoPrice)}</span>
              <span className="text-xs text-ink-400 line-through">{formatCurrency(price)}</span>
            </div>
          ) : (
            <span className="text-base font-semibold text-ink-900">{formatCurrency(price)}</span>
          )}
        </div>
      </Link>

      <div className="px-3 pb-3">
        <button
          type="button"
          onClick={onAdd}
          disabled={outOfStock || addCartItem.isPending}
          className="btn-primary w-full px-3 py-2 text-[13px] whitespace-nowrap"
        >
          <LuShoppingCart size={15} aria-hidden="true" />
          {addCartItem.isPending ? 'Ajout…' : 'Ajouter au panier'}
        </button>
      </div>
    </div>
  );
}

export default memo(ProductCard);