import { LuShieldCheck, LuTruck, LuBanknote, LuBadgeCheck } from 'react-icons/lu';

const ITEMS = [
  { icon: LuShieldCheck, title: 'Garantie', line: '6 mois' },
  { icon: LuTruck, title: 'Livraison', line: '58 wilayas' },
  { icon: LuBanknote, title: 'Paiement', line: 'à la livraison' },
  { icon: LuBadgeCheck, title: 'Produits', line: 'vérifiés' },
];

const DIVIDERS = [
  'border-r border-b lg:border-b-0',
  'border-b lg:border-b-0 lg:border-r',
  'border-r',
  '',
];

// One white card with four equal cells. The parent section pulls it up
// so it overlaps the bottom edge of the hero.
export default function TrustRow() {
  return (
    <ul
      className="max-w-5xl mx-auto grid grid-cols-2 lg:grid-cols-4 list-none overflow-hidden
                 bg-white border border-surface-border rounded-card shadow-card"
    >
      {ITEMS.map(({ icon: Icon, title, line }, i) => (
        <li
          key={title}
          className={`flex items-center gap-2.5 sm:gap-3 px-3 py-3.5 sm:px-5 sm:py-5 lg:justify-center
                      border-surface-border ${DIVIDERS[i]}`}
        >
          <span className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-brand-50 flex items-center justify-center shrink-0">
            <Icon size={18} className="text-brand-600" aria-hidden="true" />
          </span>
          <div className="min-w-0">
            <p className="text-[13px] sm:text-sm font-semibold text-ink-900 leading-tight">{title}</p>
            <p className="text-xs sm:text-[13px] text-ink-600 mt-0.5">{line}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}