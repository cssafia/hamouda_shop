// src/pages/client/Product/ProductDetail.jsx
import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  LuPackage,
  LuShoppingCart,
  LuShieldCheck,
  LuTruck,
  LuBanknote,
} from 'react-icons/lu';
import { useProduct, useProducts } from '../../../features/products/useProducts.js';
import { useAddCartItem } from '../../../features/cart/useCart.js';
import { cartUI } from '../../../features/cart/uiStore.js';
import { toast } from '../../../components/ui/Toast.jsx';
import EmptyState from '../../../components/ui/EmptyState.jsx';
import Skeleton from '../../../components/ui/Skeleton.jsx';
import ImageGallery from '../../../components/client/ImageGallery.jsx';
import VariantPicker from '../../../components/client/VariantPicker.jsx';
import QuantityStepper from '../../../components/client/QuantityStepper.jsx';
import ProductGrid from '../../../components/client/ProductGrid.jsx';
import { usageLabel } from '../../../constants/product.js';
import { formatCurrency } from '../../../utils/format.js';

const TRUST_ITEMS = [
  { Icon: LuShieldCheck, text: 'Garantie 6 mois' },
  { Icon: LuBanknote, text: 'Paiement à la livraison' },
  { Icon: LuTruck, text: 'Livraison 58 wilayas' },
];

function mergeSpecs(base = [], overrides = []) {
  const map = new Map(overrides.map((o) => [o.name, o.value]));
  const merged = base.map((s) => {
    if (map.has(s.name)) {
      const value = map.get(s.name);
      map.delete(s.name);
      return { ...s, value, changed: true };
    }
    return { ...s, changed: false };
  });
  map.forEach((value, name) => merged.push({ name, value, changed: true }));
  return merged;
}

export default function ProductDetail() {
  const { id } = useParams();
  const { data: product, isLoading, isError } = useProduct(id);

  const [selectedVariantId, setSelectedVariantId] = useState(null);
  const [quantity, setQuantity] = useState(1);

  const addCartItem = useAddCartItem();

  useEffect(() => {
    if (!product) return;
    setSelectedVariantId(product.default_variant_id ?? null);
  }, [product?.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data: related } = useProducts(
    product ? { category_id: product.category?.id, limit: 6 } : null,
    { enabled: Boolean(product) }
  );

  if (isLoading) return <DetailSkeleton />;

  if (isError || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <EmptyState
          icon={LuPackage}
          title="Produit introuvable"
          description="Ce produit n'existe plus ou a été retiré."
          action={
            <Link to="/products" className="btn-secondary">
              Retour aux produits
            </Link>
          }
        />
      </div>
    );
  }

  const isDigital = product.product_type === 'digital';
  const hasVariants = product.has_variants && product.variants?.length > 0;

  const selectedVariant = selectedVariantId != null
    ? product.variants.find((v) => v.id === selectedVariantId) || null
    : null;

  const activePrice = selectedVariant ? selectedVariant.price : product.price;
  const activePromo = selectedVariant ? selectedVariant.promotional_price : product.promotional_price;
  const activeAvailability = selectedVariant ? selectedVariant.availability : product.availability;
  const isOutOfStock = !isDigital && activeAvailability === 'out_of_stock';

  const overrides = selectedVariant?.overrides ?? [];
  const displayPrice = activePromo ?? activePrice;

  const relatedItems = (related?.items || [])
    .filter((p) => p.id !== product.id)
    .slice(0, 6);

  function handleAddToCart() {
    addCartItem.mutate(
      {
        product_id: product.id,
        variant_id: selectedVariant?.id ?? null,
        quantity: isDigital ? 1 : quantity,
      },
      {
        onSuccess: (data) => {
          const added = data?.items?.find(
            (i) =>
              i.product_id === product.id &&
              (i.variant_id ?? null) === (selectedVariant?.id ?? null)
          );
          cartUI.open(added?.id ?? null);
          if (!isDigital) setQuantity(1);
        },
        onError: (err) => toast.error(err?.message || "Erreur lors de l'ajout"),
      }
    );
  }

  const buyDisabled = isOutOfStock || addCartItem.isPending;

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 lg:py-10 pb-32 lg:pb-10">
        <nav aria-label="Fil d'Ariane" className="hidden lg:block text-sm text-ink-600 mb-6">
          <Link to="/" className="hover:text-brand-600">Accueil</Link>
          {product.category && (
            <>
              {' / '}
              <Link
                to={`/products?category_id=${product.category.id}`}
                className="hover:text-brand-600"
              >
                {product.category.name}
              </Link>
            </>
          )}
          {' / '}
          <span className="text-ink-900">{product.name}</span>
        </nav>

        <Link
          to="/products"
          className="lg:hidden inline-flex items-center gap-1 text-sm text-ink-600 hover:text-ink-900 mb-4"
        >
          ← Retour
        </Link>

        <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
          <div className="lg:col-span-7">
            <ImageGallery images={product.images || []} alt={product.name} />
          </div>

          <div className="lg:col-span-5 space-y-5">
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                {product.condition && (
                  <span className="text-xs font-semibold bg-brand-50 text-brand-700 px-2 py-1 rounded-full shrink-0">
                    {product.condition}
                  </span>
                )}
                {product.brand?.name && (
                  <span className="text-xs text-ink-500">{product.brand.name}</span>
                )}
              </div>
              <h1 className="text-xl lg:text-2xl font-semibold text-ink-900 mt-2">
                {product.name}
              </h1>
            </div>

            <div>
              <div className="flex items-baseline gap-3 flex-wrap">
                <span className="text-2xl lg:text-3xl font-semibold text-ink-900">
                  {formatCurrency(displayPrice)}
                </span>
                {activePromo != null && activePromo < activePrice && (
                  <span className="text-base text-ink-400 line-through">
                    {formatCurrency(activePrice)}
                  </span>
                )}
              </div>
              {!isDigital && (
                <p
                  className={`text-xs mt-1.5 inline-flex items-center gap-1.5 ${
                    isOutOfStock ? 'text-danger' : 'text-success'
                  }`}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  {isOutOfStock ? 'Rupture de stock' : 'En stock'}
                </p>
              )}
            </div>

            {hasVariants && (
              <VariantPicker
                product={product}
                value={selectedVariantId}
                onChange={setSelectedVariantId}
                showStock={!isDigital}
              />
            )}

            {product.description && (
              <div>
                <p className="text-sm font-medium text-ink-900 mb-2">Description</p>
                <p className="text-sm text-ink-700 whitespace-pre-line">
                  {product.description}
                </p>
              </div>
            )}

            {!isDigital && (
              <div>
                <p className="text-sm font-medium text-ink-900 mb-2">Quantité</p>
                <QuantityStepper value={quantity} onChange={setQuantity} min={1} />
              </div>
            )}

            <div className="hidden lg:block">
              <button
                type="button"
                onClick={handleAddToCart}
                disabled={buyDisabled}
                className="btn-primary w-full inline-flex items-center justify-center gap-2"
              >
                <LuShoppingCart size={18} aria-hidden="true" />
                {isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
              </button>
            </div>

            <ul className="space-y-1.5 pt-4 border-t border-surface-border">
              {TRUST_ITEMS.map(({ Icon, text }) => (
                <li key={text} className="flex items-center gap-2 text-xs text-ink-600">
                  <Icon size={14} className="text-brand-600 shrink-0" aria-hidden="true" />
                  <span>{text}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {!isDigital && (
          <div className="mt-12 lg:mt-16 space-y-8">
            {product.specifications?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-ink-900 mb-4">
                  Fiche technique
                </h2>
                <FullSpecTable
                  specifications={product.specifications}
                  overrides={overrides}
                />
              </div>
            )}

            {product.usages?.length > 0 && (
              <div>
                <h2 className="text-lg font-semibold text-ink-900 mb-3">Idéal pour</h2>
                <div className="flex flex-wrap gap-2">
                  {product.usages.map((usage) => (
                    <Link
                      key={usage}
                      to={`/products?usage=${usage}`}
                      className="text-xs px-3 py-1.5 rounded-full border border-surface-border text-ink-600 hover:border-brand-500 hover:text-brand-600 transition-colors"
                    >
                      {usageLabel(usage)}
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {isDigital && product.description && (
          <div className="mt-12 lg:mt-16">
            <h2 className="text-lg font-semibold text-ink-900 mb-3">Description</h2>
            <p className="text-sm text-ink-700 whitespace-pre-line">{product.description}</p>
          </div>
        )}

        {relatedItems.length > 0 && (
          <div className="mt-12 lg:mt-16">
            <h2 className="text-xl font-semibold text-ink-900 mb-6">Produits similaires</h2>
            <ProductGrid products={relatedItems} />
          </div>
        )}
      </div>

      <div className="lg:hidden fixed bottom-0 inset-x-0 z-30 bg-white/95 backdrop-blur border-t border-surface-border px-4 py-3 pb-[calc(env(safe-area-inset-bottom)+12px)]">
        <button
          type="button"
          onClick={handleAddToCart}
          disabled={buyDisabled}
          className="btn-primary w-full inline-flex items-center justify-center gap-2"
        >
          <LuShoppingCart size={18} aria-hidden="true" />
          {isOutOfStock ? 'Rupture de stock' : 'Ajouter au panier'}
        </button>
      </div>
    </>
  );
}

function FullSpecTable({ specifications, overrides }) {
  const merged = mergeSpecs(specifications, overrides);

  return (
    <div className="grid sm:grid-cols-2 gap-x-8 gap-y-2">
      {merged.map((spec) => (
        <div
          key={spec.name}
          className={`flex items-baseline justify-between gap-3 py-2 border-b border-surface-border transition-colors ${
            spec.changed ? 'bg-brand-50/40 -mx-2 px-2 rounded-control' : ''
          }`}
        >
          <span className="text-sm text-ink-600 shrink-0">{spec.name}</span>
          <span
            className={`text-sm font-medium text-right ${
              spec.changed ? 'text-brand-700' : 'text-ink-900'
            }`}
          >
            {spec.value}
          </span>
        </div>
      ))}
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
      <div className="grid lg:grid-cols-12 gap-6 lg:gap-10">
        <div className="lg:col-span-7">
          <Skeleton className="aspect-square rounded-card w-full" />
        </div>
        <div className="lg:col-span-5 space-y-4">
          <Skeleton className="h-4 w-20" />
          <Skeleton className="h-8 w-3/4" />
          <Skeleton className="h-8 w-1/2" />
          <div className="flex gap-2 pt-4">
            <Skeleton className="h-16 w-28" />
            <Skeleton className="h-16 w-28" />
          </div>
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-11 w-full" />
        </div>
      </div>
    </div>
  );
}