// src/pages/client/Cart/Checkout.jsx
import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LuArrowLeft, LuPackage, LuCircleCheck, LuCircleX } from 'react-icons/lu';

import { useCart } from '../../../features/cart/useCart.js';
import { usePlaceOrder } from '../../../features/orders/useOrder.js';
import { useWilayas, useCommunes } from '../../../features/shipping/useShipping.js';
import { useValidateCoupon } from '../../../features/coupons/useCoupons.js';

import Input from '../../../components/ui/Input.jsx';
import Select from '../../../components/ui/Select.jsx';
import Textarea from '../../../components/ui/Textarea.jsx';
import Button from '../../../components/ui/Button.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';
import { toast } from '../../../components/ui/Toast.jsx';
import { formatCurrency } from '../../../utils/format.js';

const COUPON_STORAGE_KEY = 'checkout_coupon';

export default function Checkout() {
  const navigate = useNavigate();
  const placeOrder = usePlaceOrder();
  const validateCoupon = useValidateCoupon();

  const [couponCode, setCouponCode] = useState(
    () => sessionStorage.getItem(COUPON_STORAGE_KEY) || ''
  );
  const [couponInput, setCouponInput] = useState('');
  const [couponError, setCouponError] = useState('');

  const { data: cart, isLoading: cartLoading } = useCart(couponCode || undefined);
  const { data: wilayas, isLoading: wilayasLoading } = useWilayas();

  const [form, setForm] = useState({
    customer_name: '',
    customer_phone: '',
    wilaya: '',
    commune: '',
    delivery_type: 'home',
    address: '',
    stop_desk_name: '',
  });
  const [errors, setErrors] = useState({});

  const { data: communeData, isLoading: communesLoading } = useCommunes(form.wilaya);

  const items = cart?.items || [];
  const itemCount = cart?.items_count ?? items.reduce((s, i) => s + i.quantity, 0);

  // Stop desks come from the backend (per wilaya)
  const stopDesks = communeData?.stop_desks || [];

  const showShipping = useMemo(() => {
    if (items.length === 0) return false;
    return items.some((i) => {
      if (i.product_type) return i.product_type === 'physical';
      if (i.is_digital != null) return !i.is_digital;
      return !i.duration;
    });
  }, [items]);

  const selectedWilaya = useMemo(
    () => (wilayas || []).find((w) => String(w.code) === String(form.wilaya)),
    [wilayas, form.wilaya]
  );

  const shippingCost = useMemo(() => {
    if (!selectedWilaya) return 0;
    return form.delivery_type === 'home'
      ? Number(selectedWilaya.home_rate || 0)
      : Number(selectedWilaya.stop_desk_rate || 0);
  }, [selectedWilaya, form.delivery_type]);

  const subtotal = Number(cart?.subtotal ?? 0);
  const discount = Number(cart?.discount ?? 0);
  const total = Number(cart?.total ?? 0) + (showShipping ? shippingCost : 0);

  // Reset commune + stop desk when wilaya changes
  useEffect(() => {
    setForm((f) => ({ ...f, commune: '', stop_desk_name: '' }));
  }, [form.wilaya]);

  // Reset stop desk when commune changes
  useEffect(() => {
    setForm((f) => ({ ...f, stop_desk_name: '' }));
  }, [form.commune]);

  // If cart empties out, quietly send the user back
  useEffect(() => {
    if (cartLoading || placeOrder.isPending) return;
    if (items.length === 0) {
      const t = setTimeout(() => navigate('/products', { replace: true }), 1500);
      return () => clearTimeout(t);
    }
  }, [cartLoading, items.length, navigate, placeOrder.isPending]);

  const set = (key, value) => setForm((f) => ({ ...f, [key]: value }));

  function applyCoupon() {
    const code = couponInput.trim().toUpperCase();
    if (!code) return;
    setCouponError('');

    validateCoupon.mutate(code, {
      onSuccess: (data) => {
        if (data?.valid) {
          const applied = data.coupon?.code ?? code;
          setCouponCode(applied);
          sessionStorage.setItem(COUPON_STORAGE_KEY, applied);
          setCouponInput('');
          toast.success('Code promo appliqué');
        } else {
          setCouponError(data?.message || 'Code invalide');
        }
      },
      onError: (err) => setCouponError(err?.message || 'Code invalide'),
    });
  }

  function removeCoupon() {
    setCouponCode('');
    setCouponError('');
    sessionStorage.removeItem(COUPON_STORAGE_KEY);
  }

  function validate() {
    const e = {};
    if (!form.customer_name.trim() || form.customer_name.trim().length < 2) {
      e.customer_name = 'Nom requis';
    }
    if (!/^0[567]\d{8}$/.test(form.customer_phone.replace(/\s/g, ''))) {
      e.customer_phone = 'Numéro invalide (ex: 0551234567)';
    }
    if (showShipping) {
      if (!form.wilaya) e.wilaya = 'Requis';
      if (!form.commune) e.commune = 'Requis';
      if (form.delivery_type === 'home' && !form.address.trim()) {
        e.address = 'Adresse requise';
      }
      if (form.delivery_type === 'stop_desk' && !form.stop_desk_name) {
        e.stop_desk_name = 'Choisis un bureau';
      }
    }
    return e;
  }

  function submit() {
    const e = validate();
    if (Object.keys(e).length) {
      setErrors(e);
      const firstKey = Object.keys(e)[0];
      document
        .querySelector(`[data-error-key="${firstKey}"]`)
        ?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      return;
    }
    setErrors({});

    const payload = {
      customer_name: form.customer_name.trim(),
      customer_phone: form.customer_phone.replace(/\s/g, ''),
      coupon_code: couponCode || null,
    };
    if (showShipping) {
      Object.assign(payload, {
        wilaya: form.wilaya,
        commune: form.commune,
        delivery_type: form.delivery_type,
      });
      if (form.delivery_type === 'home') {
        payload.address = form.address.trim();
      } else {
        payload.stop_desk_name = form.stop_desk_name;
      }
    }

    placeOrder.mutate(payload, {
      onSuccess: (order) => {
        sessionStorage.removeItem(COUPON_STORAGE_KEY);
        navigate('/order-success', { replace: true, state: { order } });
      },
      onError: (err) => toast.error(err?.message || 'Impossible de passer la commande'),
    });
  }

  function onSubmit(e) {
    e.preventDefault();
    submit();
  }

  if (cartLoading) return <CheckoutSkeleton />;

  if (items.length === 0) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <EmptyState
          icon={LuPackage}
          title="Ton panier est vide"
          description="Ajoute des produits avant de passer commande."
          action={
            <Link to="/products" className="btn-primary">
              Parcourir les produits
            </Link>
          }
        />
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-32 lg:pb-10">
      <Link
        to="/products"
        className="inline-flex items-center gap-1.5 text-sm text-ink-600 hover:text-ink-900 mb-4"
      >
        <LuArrowLeft size={16} /> Retour
      </Link>

      <h1 className="text-xl lg:text-2xl font-semibold text-ink-900 mb-6">
        Finaliser la commande
      </h1>

      <form onSubmit={onSubmit} className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        {/* ── FORM ── */}
        <div className="lg:col-span-3 space-y-4">
          <div data-error-key="customer_name">
            <Input
              label="Nom complet"
              id="customer_name"
              placeholder="Ahmed Benali"
              value={form.customer_name}
              onChange={(e) => set('customer_name', e.target.value)}
              error={errors.customer_name}
              autoFocus
            />
          </div>

          <div data-error-key="customer_phone">
            <Input
              label="Téléphone"
              id="customer_phone"
              type="tel"
              inputMode="numeric"
              placeholder="0551 23 45 67"
              value={form.customer_phone}
              onChange={(e) => set('customer_phone', e.target.value)}
              error={errors.customer_phone}
            />
            <p className="text-xs text-ink-500 mt-1.5">
              On vous appellera pour confirmer.
            </p>
          </div>

          {showShipping && (
            <>
              <div className="grid grid-cols-2 gap-3">
                <div data-error-key="wilaya">
                  <label className="label" htmlFor="wilaya">Wilaya</label>
                  <Select
                    id="wilaya"
                    value={form.wilaya}
                    onChange={(e) => set('wilaya', e.target.value)}
                    disabled={wilayasLoading}
                  >
                    <option value="">Choisir</option>
                    {(wilayas || []).map((w) => (
                      <option key={w.code} value={w.code}>
                        {w.code} · {w.name}
                      </option>
                    ))}
                  </Select>
                  {errors.wilaya && <p className="form-error">{errors.wilaya}</p>}
                </div>

                <div data-error-key="commune">
                  <label className="label" htmlFor="commune">Commune</label>
                  <Select
                    id="commune"
                    value={form.commune}
                    onChange={(e) => set('commune', e.target.value)}
                    disabled={!form.wilaya || communesLoading}
                  >
                    <option value="">
                      {!form.wilaya ? 'Wilaya d\u2019abord' : communesLoading ? '…' : 'Choisir'}
                    </option>
                    {(communeData?.communes || []).map((c) => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </Select>
                  {errors.commune && <p className="form-error">{errors.commune}</p>}
                </div>
              </div>

              {/* Delivery type — compact radios */}
              <div className="grid grid-cols-2 gap-3">
                <DeliveryOption
                  active={form.delivery_type === 'home'}
                  onClick={() => set('delivery_type', 'home')}
                  title="Domicile"
                  price={selectedWilaya?.home_rate}
                />
                <DeliveryOption
                  active={form.delivery_type === 'stop_desk'}
                  onClick={() => set('delivery_type', 'stop_desk')}
                  title="Stop desk"
                  price={selectedWilaya?.stop_desk_rate}
                />
              </div>

              {/* Address (home) OR Stop desk (select) */}
              {form.delivery_type === 'home' ? (
                <div data-error-key="address">
                  <label className="label" htmlFor="address">Adresse</label>
                  <Textarea
                    id="address"
                    rows={2}
                    placeholder="12 Rue des Roses, Hydra"
                    value={form.address}
                    onChange={(e) => set('address', e.target.value)}
                  />
                  {errors.address && <p className="form-error">{errors.address}</p>}
                </div>
              ) : (
                <div data-error-key="stop_desk_name">
                  <label className="label" htmlFor="stop_desk_name">Bureau de livraison</label>
                  <Select
                    id="stop_desk_name"
                    value={form.stop_desk_name}
                    onChange={(e) => set('stop_desk_name', e.target.value)}
                    disabled={!form.wilaya || !form.commune || communesLoading}
                  >
                    <option value="">
                      {!form.wilaya || !form.commune
                        ? 'Choisis d\u2019abord wilaya et commune'
                        : communesLoading
                          ? 'Chargement…'
                          : stopDesks.length
                            ? 'Choisir un bureau'
                            : 'Aucun bureau disponible'}
                    </option>
                    {stopDesks.map((name) => (
                      <option key={name} value={name}>{name}</option>
                    ))}
                  </Select>
                  {errors.stop_desk_name && (
                    <p className="form-error">{errors.stop_desk_name}</p>
                  )}
                </div>
              )}
            </>
          )}

          {/* Desktop submit */}
          <div className="hidden lg:block pt-2">
            <Button type="submit" loading={placeOrder.isPending} className="w-full">
              Confirmer la commande
            </Button>
          </div>
        </div>

        {/* ── SUMMARY ── */}
        <aside className="lg:col-span-2">
          <div className="lg:sticky lg:top-24 card p-5 space-y-4">
            {/* Compact item list with images */}
            <ul className="space-y-3 max-h-64 overflow-y-auto -mx-1 px-1">
              {items.map((it) => (
                <li key={it.id} className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-control bg-surface-subtle overflow-hidden shrink-0 border border-surface-border">
                    {it.image ? (
                      <img src={it.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-ink-400">
                        <LuPackage size={16} />
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-ink-900 truncate">{it.name}</p>
                    <div className="flex items-center gap-1.5 text-xs text-ink-500">
                      {it.variant_name && <span className="truncate">{it.variant_name}</span>}
                      {it.variant_name && <span>·</span>}
                      <span>×{it.quantity}</span>
                    </div>
                  </div>
                  <span className="text-sm font-medium text-ink-900 shrink-0">
                    {formatCurrency(it.line_total)}
                  </span>
                </li>
              ))}
            </ul>

            {/* Totals */}
            <div className="pt-4 border-t border-surface-border space-y-2">
              <Row label="Sous-total" value={formatCurrency(subtotal)} />
              {discount > 0 && (
                <Row label="Remise" value={`-${formatCurrency(discount)}`} tone="success" />
              )}
              {showShipping && (
                <Row
                  label="Livraison"
                  value={selectedWilaya ? formatCurrency(shippingCost) : '—'}
                />
              )}
            </div>

            <div className="pt-3 border-t border-surface-border flex items-baseline justify-between">
              <span className="text-sm font-medium text-ink-900">Total</span>
              <span className="text-xl font-semibold text-ink-900">
                {formatCurrency(total)}
              </span>
            </div>

            <p className="text-[11px] text-ink-500 text-right -mt-2">
              Paiement à la livraison
            </p>

            {/* Coupon */}
            <div className="pt-4 border-t border-surface-border">
              {couponCode ? (
                <div className="flex items-center justify-between gap-2 px-3 py-2 rounded-control bg-success/5 border border-success/30">
                  <div className="flex items-center gap-2 min-w-0">
                    <LuCircleCheck size={14} className="text-success shrink-0" />
                    <span className="text-sm font-medium text-ink-900 truncate">
                      {couponCode}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={removeCoupon}
                    className="text-xs text-ink-500 hover:text-danger shrink-0"
                  >
                    Retirer
                  </button>
                </div>
              ) : (
                <>
                  <div className="flex gap-2">
                    <input
                      className="input flex-1 text-sm"
                      placeholder="Code promo"
                      value={couponInput}
                      onChange={(e) => {
                        setCouponInput(e.target.value.toUpperCase());
                        setCouponError('');
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          applyCoupon();
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={applyCoupon}
                      disabled={!couponInput.trim() || validateCoupon.isPending}
                      className="btn-secondary px-3 shrink-0 text-sm disabled:opacity-50"
                    >
                      {validateCoupon.isPending ? '…' : 'OK'}
                    </button>
                  </div>
                  {couponError && (
                    <p className="text-xs text-danger mt-1.5 flex items-center gap-1">
                      <LuCircleX size={12} /> {couponError}
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </aside>
      </form>

      {/* Mobile sticky CTA */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-surface-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-ink-600">
            {itemCount} article{itemCount > 1 ? 's' : ''}
          </span>
          <span className="text-lg font-semibold text-ink-900">
            {formatCurrency(total)}
          </span>
        </div>
        <Button
          type="button"
          loading={placeOrder.isPending}
          className="w-full"
          onClick={submit}
        >
          Confirmer la commande
        </Button>
      </div>
    </div>
  );
}

/* ─── Helpers ─────────────────────────────────────────── */

function Row({ label, value, tone }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-ink-600">{label}</span>
      <span
        className={
          tone === 'success' ? 'font-medium text-success' : 'font-medium text-ink-900'
        }
      >
        {value}
      </span>
    </div>
  );
}

function DeliveryOption({ active, onClick, title, price }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={`rounded-control border px-3 py-2.5 text-left transition-colors ${
        active
          ? 'border-brand-500 bg-brand-50/50'
          : 'border-surface-border bg-white hover:border-brand-500'
      }`}
    >
      <div className="flex items-center gap-2">
        <span
          className={`w-3.5 h-3.5 rounded-full border-2 shrink-0 flex items-center justify-center ${
            active ? 'border-brand-500' : 'border-ink-300'
          }`}
        >
          {active && <span className="w-1.5 h-1.5 rounded-full bg-brand-500" />}
        </span>
        <span className="text-sm font-medium text-ink-900 flex-1 truncate">{title}</span>
      </div>
      <p className="text-xs font-semibold text-ink-700 mt-1 ml-5">
        {price != null ? formatCurrency(price) : '—'}
      </p>
    </button>
  );
}

function CheckoutSkeleton() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <Skeleton className="h-8 w-64 mb-6" />
      <div className="grid lg:grid-cols-5 gap-6 lg:gap-8">
        <div className="lg:col-span-3 space-y-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
        <div className="lg:col-span-2">
          <Skeleton className="h-72 w-full" />
        </div>
      </div>
    </div>
  );
}