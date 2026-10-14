// src/pages/client/Home.jsx
import { Link } from 'react-router-dom'
import { LuExternalLink } from 'react-icons/lu'

import { useProducts } from '../../features/products/useProducts.js'
import { FACEBOOK_URL } from '../../constants/config.js'

import ProductGrid from '../../components/client/ProductGrid.jsx'
import TrustRow from '../../components/client/TrustRow.jsx'
import HelpMeChoose from '../../components/client/HelpMeChoose.jsx'
import HeroBackdrop from '../../components/client/HeroBackdrop.jsx'

const HERO_SUBTITLE = 'تلقى عندنا PC و accessoires والخدمة.'

const SERVICES_LIST = [
  'Transfert d\u2019argent',
  'Assistance en ligne',
  'Installation PC',
  'Déverrouillage',
  'Autres demandes',
]

export default function Home() {
  const {
    data: arrivals,
    isLoading: arrivalsLoading,
    isError: arrivalsError,
  } = useProducts({
    sort: 'newest',
    limit: 8,
    availability: 'available',
    product_type: 'physical',
  })

  const {
    data: subscriptions,
    isLoading: subsLoading,
    isError: subsError,
  } = useProducts({ product_type: 'digital', limit: 8 })

  return (
    <>
      {/* 1 · Hero — white + glow + dots (only place these appear) */}
      <section
        aria-labelledby="hero-heading"
        className="relative overflow-hidden bg-white flex items-center pt-[100px] pb-[120px] lg:py-24 lg:min-h-[500px]"
      >
        <HeroBackdrop />

        <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div dir="rtl" className="max-w-xl mx-auto text-center">
            <p className="kicker">PC • ACCESSOIRES • SOLUTIONS NUMÉRIQUES</p>

            <h1
              id="hero-heading"
              className="text-3xl sm:text-4xl lg:text-5xl font-semibold text-ink-900 tracking-tight leading-tight mt-3"
            >
              PC مليح يبدأ بالاختيار الصح.
            </h1>

            <p className="text-base lg:text-lg text-ink-600 mt-4">
              {HERO_SUBTITLE}
            </p>

            <div className="mt-8">
              <Link
                to="/products"
                className="btn-primary block w-full sm:inline-block sm:w-auto px-8 py-3 text-base text-center"
              >
                شوف المنتجات ←
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 2 · TrustRow — the ONLY raised card on the page */}
      <section
        aria-label="Pourquoi nous faire confiance"
        className="relative z-10 -mt-6 lg:-mt-10"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <TrustRow />
        </div>
      </section>

      {/* 3 · New arrivals — canvas + product cards only */}
      <section
        aria-labelledby="arrivals-heading"
        className="pt-14 pb-20 lg:pt-20 lg:pb-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div dir="rtl" className="flex items-center justify-between mb-6 gap-3">
            <h2
              id="arrivals-heading"
              className="text-2xl lg:text-3xl font-semibold text-ink-900"
            >
              جديدنا
            </h2>
            <Link
              to="/products"
              className="text-sm text-brand-600 hover:underline shrink-0"
            >
              Voir tout ←
            </Link>
          </div>

          <ProductGrid
            layout="grid"
            products={arrivals?.items || []}
            isLoading={arrivalsLoading}
            isError={arrivalsError}
          />
        </div>
      </section>

      {/* 4 · Subscriptions — canvas + product cards only */}
      <section
        aria-labelledby="subscriptions-heading"
        className="pt-14 pb-14 lg:pt-20 lg:pb-20"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div dir="rtl" className="flex items-center justify-between mb-6 gap-3">
            <h2
              id="subscriptions-heading"
              className="text-2xl lg:text-3xl font-semibold text-ink-900"
            >
              حلول رقمية
            </h2>
            <Link
              to="/subscriptions"
              className="text-sm text-brand-600 hover:underline shrink-0"
            >
              Voir tout ←
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

      {/* 5 · Help me choose — flat section on canvas */}
      <HelpMeChoose />

      {/* 6 · Custom services — flat centered section on canvas */}
      <section
        aria-labelledby="services-heading"
        className="pt-14 pb-14 lg:pt-20 lg:pb-20"
      >
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2
            id="services-heading"
            dir="rtl"
            className="text-2xl lg:text-3xl font-semibold text-ink-900"
          >
            عندك حاجة ما لقيناهاش؟
          </h2>
          <p dir="rtl" className="text-ink-600 mt-3">
            عندك besoin خاص؟ ابعثلنا واش تحتاج ونشوفولك الحل.
          </p>

          <ul className="flex flex-wrap justify-center gap-2 mt-6">
            {SERVICES_LIST.map((service) => (
              <li
                key={service}
                className="rounded-full bg-white border border-surface-border px-3.5 py-1.5 text-sm text-ink-700"
              >
                {service}
              </li>
            ))}
          </ul>

          <Link
            to="/services"
            dir="rtl"
            className="btn-primary mt-8 inline-block"
          >
            ابعث طلبك ←
          </Link>
        </div>
      </section>

      {/* 7 · Social proof — flat split: raised image + flat text */}
      <section
        id="social-proof"
        aria-labelledby="social-proof-heading"
        className="pt-16 pb-20 lg:pt-20 lg:pb-28"
      >
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">
            {/* Image — the only raised element */}
            <div className="aspect-[4/3] rounded-card overflow-hidden border border-surface-border bg-white shadow-card">
              <img
                src="/social-proof.png"
                alt="Avis client réel sur Facebook"
                loading="lazy"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Text — flat on canvas */}
            <div>
              <h2
                id="social-proof-heading"
                dir="rtl"
                className="text-2xl lg:text-3xl font-semibold text-ink-900"
              >
                قبل ما تشري، شوف واش قالو الناس
              </h2>
              <p dir="rtl" className="text-ink-600 mt-3">
                آراء الزبائن الحقيقيين على صفحتنا Facebook
              </p>
              <a
                href={FACEBOOK_URL}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary mt-5 inline-flex items-center gap-2"
              >
                شوف واش قالو علينا
                <LuExternalLink size={16} aria-hidden="true" />
              </a>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}