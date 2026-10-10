import { LuShieldCheck, LuTruck, LuBanknote, LuBadgeCheck } from 'react-icons/lu';

const ITEMS = [
  { icon: LuShieldCheck, title: 'Garantie', line: '6 mois' },
  { icon: LuTruck, title: 'Livraison', line: '58 wilayas' },
  { icon: LuBanknote, title: 'Paiement', line: 'à la livraison' },
  { icon: LuBadgeCheck, title: 'Produits', line: 'vérifiés' }, // see note below
];

export default function TrustRow({ compact = false }) {
  if (compact) {
    return (
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-4 gap-y-3 py-4">
        {ITEMS.map(({ icon: Icon, title, line }) => (
          <div key={title} className="flex items-center gap-2">
            <Icon size={18} className="text-brand-600 shrink-0" aria-hidden="true" />
            <p className="text-xs text-ink-600">
              <span className="font-medium text-ink-900">{title}</span> {line}
            </p>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 py-10">
      {ITEMS.map(({ icon: Icon, title, line }) => (
        <div key={title} className="flex flex-col items-center text-center gap-2">
          <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center">
            <Icon size={24} className="text-brand-600" aria-hidden="true" />
          </div>
          <p className="text-sm font-medium text-ink-900">{title}</p>
          <p className="text-xs text-ink-600">{line}</p>
        </div>
      ))}
    </div>
  );
}