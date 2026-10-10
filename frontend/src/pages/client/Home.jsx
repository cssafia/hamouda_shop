import { Link } from 'react-router-dom';
import { useCategories } from '../../features/categories/useCategories.js';
import { useProducts } from '../../features/products/useProducts.js';
import CategoryTile from '../../components/client/CategoryTile.jsx';
import ProductGrid from '../../components/client/ProductGrid.jsx';
import ScrollableRow from '../../components/client/ScrollableRow.jsx';
import TrustRow from '../../components/client/TrustRow.jsx';
import HelpMeChoose from '../../components/client/HelpMeChoose.jsx';
import SocialProofSection from '../../components/client/SocialProofSection.jsx';

const SERVICES_LIST = [
  'Transfert d\u2019argent',
  'Assistance en ligne',
  'Installation PC',
  'Déverrouillage',
  'Autres demandes',
];

export default function Home() {
  const { data: categories, isLoading: categoriesLoading } = useCategories();

  const {
    data: featured,
    isLoading: featuredLoading,
    isError: featuredError,
  } = useProducts({ sort: 'newest', limit: 8, availability: 'available' });

  const {
    data: subscriptions,
    isLoading: subsLoading,
    isError: subsError,
  } = useProducts({ product_type: 'digital', limit: 8 });

  const topCategories = (categories || []).slice(0, 8);

  return (
    <>
      {/* Hero — text leads on every size; image only exists on desktop now */}
      <section aria-labelledby="hero-heading" className="py-10 lg:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-xs font-semibold tracking-wide text-brand-600 uppercase">
              PC • ACCESSOIRES • SOLUTIONS NUMÉRIQUES
            </p>
            <h1
              id="hero-heading"
              dir="rtl"
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink-900 tracking-tight leading-tight mt-3"
            >
              PC مليح يبدأ بالاختيار الصح.
            </h1>
            <p dir="rtl" className="text-base lg:text-lg text-ink-600 mt-4 max-w-md">
              تلقى عندنا PC و accessoires للـ gaming، programmation، études والخدمة.
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              <Link to="/products" dir="rtl" className="btn-primary">
                شوف المنتجات ←
              </Link>
              <a href="#social-proof" dir="rtl" className="btn-secondary">
                واش قالو علينا ↗
              </a>
            </div>
          </div>

          <div className="hidden lg:flex aspect-square max-w-md mx-auto lg:ml-auto w-full bg-brand-50/30 rounded-card items-center justify-center">
            <img
              src="/hero-laptop.png"
              alt="Laptop en vente"
              loading="eager"
              fetchpriority="high"
              className="w-full h-full object-contain"
            />
          </div>
        </div>
      </section>

      {/* Trust strip — slim, sits right under the hero, answers "can I trust this shop" fast */}
      <section aria-label="Pourquoi nous faire confiance" className="border-y border-surface-border bg-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrustRow compact />
        </div>
      </section>

      {/* Best sellers — first real content, proves the shop has actual stock */}
      <section aria-labelledby="featured-heading" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 gap-3">
            <h2 id="featured-heading" dir="rtl" className="text-2xl lg:text-3xl font-semibold text-ink-900">
              الأكثر مبيعًا
            </h2>
            <Link to="/products" className="text-sm text-brand-600 hover:underline shrink-0">
              Voir tout →
            </Link>
          </div>

          <ProductGrid products={featured?.items || []} isLoading={featuredLoading} isError={featuredError} />
        </div>
      </section>

      {/* Categories — swipeable on mobile, arrow-navigable on desktop */}
      <section aria-labelledby="categories-heading" className="py-16 lg:py-24 bg-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 id="categories-heading" dir="rtl" className="text-2xl lg:text-3xl font-semibold text-ink-900 mb-6">
            ولا حاب تشوف المنتجات كامل؟
          </h2>

          {!categoriesLoading && (
            <ScrollableRow ariaLabelPrev="Catégories précédentes" ariaLabelNext="Catégories suivantes">
              {topCategories.map((cat) => (
                <div key={cat.id} className="w-[130px] sm:w-[160px] lg:w-[180px] shrink-0 snap-start">
                  <CategoryTile id={cat.id} name={cat.name} />
                </div>
              ))}
            </ScrollableRow>
          )}
        </div>
      </section>

      {/* ماعرفتش واش يناسبك؟ — teaser only, full wizard lives at /usage-finder */}
      <HelpMeChoose />

      {/* حلول رقمية */}
      <section aria-labelledby="subscriptions-heading" className="py-16 lg:py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-6 gap-3">
            <h2 id="subscriptions-heading" dir="rtl" className="text-2xl lg:text-3xl font-semibold text-ink-900">
              حلول رقمية
            </h2>
            <Link to="/subscriptions" className="text-sm text-brand-600 hover:underline shrink-0">
              Voir tout →
            </Link>
          </div>

          <ProductGrid
            products={subscriptions?.items || []}
            isLoading={subsLoading}
            isError={subsError}
            emptyTitle="Pas encore d'abonnements"
          />
        </div>
      </section>

      {/* عندك حاجة ما لقيناهاش؟ */}
      <section aria-labelledby="services-heading" className="py-16 lg:py-24 bg-surface-subtle">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="rounded-card bg-white border border-surface-border p-6 lg:p-10 text-center">
            <h2 id="services-heading" dir="rtl" className="text-xl lg:text-2xl font-semibold text-ink-900">
              عندك حاجة ما لقيناهاش؟
            </h2>
            <p dir="rtl" className="text-ink-600 mt-3">
              عندك besoin خاص؟ ابعثلنا واش تحتاج ونشوفولك الحل.
            </p>
            <p className="text-sm text-ink-400 mt-2">{SERVICES_LIST.join(' · ')}</p>
            <Link to="/services" dir="rtl" className="btn-primary mt-6 inline-block">
              ابعث طلبك ←
            </Link>
          </div>
        </div>
      </section>

      {/* قبل ما تشري، شوف واش قالو الناس */}
      <SocialProofSection />
    </>
  );
}