// src/components/client/CartIcon.jsx
import { LuShoppingCart } from 'react-icons/lu';
import { useCart } from '../../features/cart/useCart.js';
import { cartUI } from '../../features/cart/uiStore.js';

export default function CartIcon() {
  const { data: cart } = useCart();
  const itemsCount = cart?.items_count || 0;

  return (
    <button
      type="button"
      onClick={() => cartUI.open()}
      aria-label={`Ouvrir le panier${itemsCount ? `, ${itemsCount} article${itemsCount > 1 ? 's' : ''}` : ''}`}
      className="relative w-11 h-11 flex items-center justify-center text-ink-600 hover:text-brand-600 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded-control"
    >
      <LuShoppingCart size={20} />
      {itemsCount > 0 && (
        <span className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-brand-500 text-white text-[10px] font-semibold flex items-center justify-center">
          {itemsCount}
        </span>
      )}
    </button>
  );
}