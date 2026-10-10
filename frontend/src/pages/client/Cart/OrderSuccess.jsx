// src/pages/client/Cart/OrderSuccess.jsx
import { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LuArrowRight, LuPhone, LuClock } from 'react-icons/lu';
import { formatCurrency } from '../../../utils/format.js';

const MESSAGES = [
  { arabic: 'وصلنا طلبك', latin: 'Ton colis est bien arrivé chez nous', delay: 900 },
  { arabic: 'خلي الباقي علينا', latin: 'On s\u2019occupe du reste', delay: 1800 },
  { arabic: 'راح نعيطولك', latin: 'On t\u2019appelle pour confirmer', delay: 2700 },
];

export default function OrderSuccess() {
  const { state } = useLocation();
  const order = state?.order;

  const [visibleMessages, setVisibleMessages] = useState(0);

  useEffect(() => {
    const timers = MESSAGES.map((m, i) =>
      setTimeout(() => setVisibleMessages(i + 1), m.delay)
    );
    return () => timers.forEach(clearTimeout);
  }, []);

  const allMessagesShown = visibleMessages >= MESSAGES.length;

  return (
    <div className="relative min-h-[80vh] flex items-center justify-center px-4 py-12 overflow-hidden bg-gradient-to-b from-brand-50/40 via-white to-white">
      <Bubbles />

      <div className="relative w-full max-w-md text-center">
        <SuccessBadge />

        {/* Staggered Arabic messages */}
        <div className="mt-6 space-y-3 min-h-[130px]">
          {MESSAGES.map((m, i) => (
            <div
              key={i}
              className={`transition-all duration-700 ease-out ${
                i < visibleMessages
                  ? 'opacity-100 translate-y-0'
                  : 'opacity-0 translate-y-2'
              }`}
            >
              <p
                dir="rtl"
                className={`font-semibold text-ink-900 ${
                  i === 1 ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl'
                }`}
              >
                {m.arabic}
              </p>
              <p className="text-xs text-ink-500 mt-1">{m.latin}</p>
            </div>
          ))}
        </div>

        {/* Order summary — appears after all messages */}
        <div
          className={`mt-8 transition-all duration-700 ease-out ${
            allMessagesShown
              ? 'opacity-100 translate-y-0'
              : 'opacity-0 translate-y-4 pointer-events-none'
          }`}
        >
          {order ? (
            <div className="card p-5 text-left space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-500">Numéro de commande</span>
                <span className="text-sm font-semibold text-ink-900">
                  #{order.id}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-ink-500">Total</span>
                <span className="text-lg font-semibold text-ink-900">
                  {formatCurrency(order.total_amount)}
                </span>
              </div>

              <div className="pt-3 border-t border-surface-border space-y-2">
                <div className="flex items-start gap-2">
                  <LuPhone size={14} className="text-brand-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-ink-600">
                    On t&apos;appellera dans les prochaines heures pour confirmer la
                    livraison. Garde ton téléphone près de toi.
                  </p>
                </div>
                <div className="flex items-start gap-2">
                  <LuClock size={14} className="text-brand-600 mt-0.5 shrink-0" />
                  <p className="text-xs text-ink-600">
                    Délai habituel : 2 à 4 jours ouvrés.
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <div className="card p-5 text-center">
              <p className="text-sm text-ink-600">
                Merci pour votre commande. Nous vous contacterons bientôt.
              </p>
            </div>
          )}

          <Link
            to="/products"
            className="btn-primary inline-flex items-center gap-2 mt-5"
          >
            Retour aux produits
            <LuArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}

/* ────────────────────────────────────────────────────────
   Self-drawing check badge
   ──────────────────────────────────────────────────────── */
function SuccessBadge() {
  return (
    <>
      <style>{`
        @keyframes os-draw-circle {
          to { stroke-dashoffset: 0; }
        }
        @keyframes os-draw-check {
          to { stroke-dashoffset: 0; }
        }
        @keyframes os-ring {
          0%   { transform: scale(0.6); opacity: 0.6; }
          100% { transform: scale(1.6); opacity: 0; }
        }

        .os-circle {
          fill: none;
          stroke: #22c55e;
          stroke-width: 5;
          stroke-linecap: round;
          stroke-dasharray: 302;
          stroke-dashoffset: 302;
          animation: os-draw-circle 0.75s cubic-bezier(0.65, 0, 0.45, 1) forwards;
          transform: rotate(-90deg);
          transform-origin: 50% 50%;
        }
        .os-check {
          fill: none;
          stroke: #22c55e;
          stroke-width: 7;
          stroke-linecap: round;
          stroke-linejoin: round;
          stroke-dasharray: 100;
          stroke-dashoffset: 100;
          animation: os-draw-check 0.4s cubic-bezier(0.65, 0, 0.45, 1) 0.75s forwards;
        }
        .os-ring {
          fill: none;
          stroke: #22c55e;
          stroke-width: 3;
          animation: os-ring 1.2s ease-out 0.9s infinite;
          transform-origin: 50% 50%;
        }

        @media (prefers-reduced-motion: reduce) {
          .os-circle, .os-check, .os-ring {
            animation-duration: 0.01s !important;
            animation-delay: 0s !important;
            animation-iteration-count: 1 !important;
          }
        }
      `}</style>

      <div className="relative w-32 h-32 mx-auto">
        <svg viewBox="0 0 100 100" className="w-full h-full">
          <circle className="os-ring" cx="50" cy="50" r="46" />
          <circle className="os-circle" cx="50" cy="50" r="48" />
          <path className="os-check" d="M28 52 L46 68 L74 38" />
        </svg>
      </div>
    </>
  );
}

/* ────────────────────────────────────────────────────────
   Subtle floating background bubbles
   ──────────────────────────────────────────────────────── */
function Bubbles() {
  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      <style>{`
        @keyframes os-float {
          0%, 100% { transform: translateY(0) }
          50%      { transform: translateY(-12px) }
        }
        .os-bubble { animation: os-float 5s ease-in-out infinite; }
        @media (prefers-reduced-motion: reduce) {
          .os-bubble { animation: none; }
        }
      `}</style>

      <span
        className="os-bubble absolute top-[10%] left-[8%] w-3 h-3 rounded-full bg-brand-200/60"
        style={{ animationDelay: '0s' }}
      />
      <span
        className="os-bubble absolute top-[22%] right-[10%] w-2 h-2 rounded-full bg-success/40"
        style={{ animationDelay: '1.2s' }}
      />
      <span
        className="os-bubble absolute bottom-[18%] left-[14%] w-4 h-4 rounded-full bg-brand-100/70"
        style={{ animationDelay: '0.6s' }}
      />
      <span
        className="os-bubble absolute bottom-[24%] right-[16%] w-2.5 h-2.5 rounded-full bg-brand-200/70"
        style={{ animationDelay: '1.8s' }}
      />
    </div>
  );
}