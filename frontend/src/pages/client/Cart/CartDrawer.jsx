// src/Page/client/Cart/CartDrawer.jsx
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { LuX, LuPackage, LuCircleCheck, LuShoppingCart } from 'react-icons/lu';
import Sheet from '../../../components/ui/Sheet.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import QuantityStepper from '../../../components/client/QuantityStepper.jsx';
import {
  useCart,
  useRemoveCartItem,
  useUpdateCartItem,
} from '../../../features/cart/useCart.js';
import { cartUI, useCartUI } from '../../../features/cart/uiStore.js';
import { formatCurrency } from '../../../utils/format.js';
import { toast } from '../../../components/ui/Toast.jsx';

const MAX_QTY = 50;
const DEBOUNCE_MS = 400;

export default function CartDrawer() {
  const { open, justAddedId } = useCartUI();
  const { data: cart, isLoading } = useCart();
  const removeItem = useRemoveCartItem();
  const updateItem = useUpdateCartItem();

  const [showSuccess, setShowSuccess] = useState(false);
  const [highlightId, setHighlightId] = useState(null);
  const [pendingQty, setPendingQty] = useState({});
  const timersRef = useRef({});

  const items = cart?.items || [];
  const count = cart?.items_count ?? items.reduce((s, i) => s + i.quantity, 0);
  const hasOutOfStock = items.some((i) => i.availability === 'out_of_stock');

  // Success strip + highlight just-added item for 3s
  useEffect(() => {
    if (!open || !justAddedId) return;
    setShowSuccess(true);
    setHighlightId(justAddedId);
    const t1 = setTimeout(() => setShowSuccess(false), 3000);
    const t2 = setTimeout(() => setHighlightId(null), 3000);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [open, justAddedId]);

  // Drop local override once the server confirms the new quantity
  useEffect(() => {
    setPendingQty((prev) => {
      const next = { ...prev };
      for (const item of items) {
        if (next[item.id] === item.quantity) delete next[item.id];
      }
      return next;
    });
  }, [cart]);

  // Clear pending debounce timers on unmount
  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      Object.values(timers).forEach(clearTimeout);
    };
  }, []);

  function handleQtyChange(item, newQty) {
    // Backend enforces real stock; client caps only for sanity.
    const clamped = Math.max(1, Math.min(newQty, MAX_QTY));

    setPendingQty((prev) => ({ ...prev, [item.id]: clamped }));

    if (timersRef.current[item.id]) clearTimeout(timersRef.current[item.id]);
    timersRef.current[item.id] = setTimeout(() => {
      updateItem.mutate(
        { id: item.id, quantity: clamped },
        {
          onError: (err) => {
            setPendingQty((prev) => {
              const next = { ...prev };
              delete next[item.id];
              return next;
            });
            toast.error(err?.message || 'Erreur lors de la mise à jour');
          },
        }
      );
    }, DEBOUNCE_MS);
  }

  return (
    <Sheet
      open={open}
      onClose={cartUI.close}
      title={`Panier${count ? ` (${count})` : ''}`}
    >
      {showSuccess && (
        <div className="flex items-center gap-2 px-4 py-3 bg-success/10 text-success text-sm border-b border-success/20 shrink-0">
          <LuCircleCheck size={16} aria-hidden="true" />
          <span>Ajouté au panier</span>
        </div>
      )}

      <div className="flex-1 overflow-y-auto">
        {isLoading && (
          <p className="text-sm text-ink-600 py-8 text-center">Chargement…</p>
        )}

        {!isLoading && items.length === 0 && (
          <EmptyState
            icon={LuShoppingCart}
            title="Ton panier est vide"
            description="Ajoute des produits pour commencer."
            action={
              <button onClick={cartUI.close} className="btn-secondary">
                Continuer mes achats
              </button>
            }
          />
        )}

        {!isLoading &&
          items.map((item) => {
            const isHighlighted = highlightId === item.id;
            const isOutOfStock = item.availability === 'out_of_stock';
            const qty = pendingQty[item.id] ?? item.quantity;

            return (
              <div
                key={item.id}
                className={`flex items-start gap-3 px-4 py-3 border-b border-surface-border last:border-0 transition-colors ${
                  isHighlighted ? 'bg-brand-50/50' : ''
                }`}
              >
                <div className="w-16 h-16 rounded-control bg-surface-subtle overflow-hidden shrink-0">
                  {item.image ? (
                    <img
                      src={item.image}
                      alt={item.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-ink-400">
                      <LuPackage size={20} aria-hidden="true" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-ink-900 line-clamp-2">
                        {item.name}
                      </p>
                      {item.variant_name && (
                        <p className="text-xs text-ink-600 truncate mt-0.5">
                          {item.variant_name}
                        </p>
                      )}
                    </div>
                    <button
                      type="button"
                      onClick={() => removeItem.mutate(item.id)}
                      aria-label={`Retirer ${item.name}`}
                      className="w-8 h-8 -mt-1 -mr-1 flex items-center justify-center text-ink-400 hover:text-danger shrink-0 rounded-control"
                    >
                      <LuX size={16} />
                    </button>
                  </div>

                  {isOutOfStock && (
                    <p className="text-xs text-danger mt-1">Rupture de stock</p>
                  )}

                  <div className="flex items-center justify-between gap-3 mt-2">
                    <QuantityStepper
                      value={qty}
                      onChange={(v) => handleQtyChange(item, v)}
                      min={1}
                      max={MAX_QTY}
                    />
                    <span className="text-sm font-semibold text-ink-900 shrink-0">
                      {formatCurrency(item.line_total)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
      </div>

      {!isLoading && items.length > 0 && (
        <div className="shrink-0 border-t border-surface-border bg-white p-4 space-y-3 pb-[calc(env(safe-area-inset-bottom)+16px)] lg:pb-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-ink-600">Sous-total</span>
            <span className="font-semibold text-ink-900">
              {formatCurrency(cart.subtotal)}
            </span>
          </div>

          {hasOutOfStock && (
            <p className="text-xs text-danger">
              Un article n'est plus disponible — retire-le pour continuer.
            </p>
          )}

          <div className="flex flex-col gap-2">
            <Link
              to="/checkout"
              onClick={cartUI.close}
              aria-disabled={hasOutOfStock}
              className={`btn-primary w-full text-center ${
                hasOutOfStock ? 'opacity-50 pointer-events-none' : ''
              }`}
            >
              Acheter
            </Link>
            <button
              type="button"
              onClick={cartUI.close}
              className="text-sm text-ink-600 hover:text-ink-900 py-1"
            >
              Continuer mes achats
            </button>
          </div>
        </div>
      )}
    </Sheet>
  );
}