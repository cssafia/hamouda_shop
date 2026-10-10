import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { USAGES, BUDGET_PRESETS } from '../../constants/product';

export default function HelpMeChoose() {
  const [started, setStarted] = useState(false);
  const [usage, setUsage] = useState(null);
  const navigate = useNavigate();

  function handleBudget(budget) {
    const params = new URLSearchParams();
    params.set('usage', usage.key);
    if (budget.price_min) params.set('price_min', budget.price_min);
    if (budget.price_max) params.set('price_max', budget.price_max);
    navigate(`/products?${params.toString()}`);
  }

  return (
    <section aria-labelledby="choose-heading" className="py-16 lg:py-24 bg-surface-subtle">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 id="choose-heading" dir="rtl" className="text-2xl lg:text-3xl font-semibold text-ink-900">
          ماعرفتش واش يناسبك؟
        </h2>
        <p dir="rtl" className="text-ink-600 mt-3">
          قولنا غير واش حاب تدير بيه، ونعاونك تلقى الاختيار المناسب.
        </p>

        {!started && (
          <button onClick={() => setStarted(true)} dir="rtl" className="btn-primary mt-6">
            عاونّي نختار ←
          </button>
        )}

        {started && !usage && (
          <div className="mt-8">
            <p dir="rtl" className="text-sm font-medium text-ink-900 mb-4">
              1. واش راك حاب تدير؟
            </p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {USAGES.map((u) => (
                <button
                  key={u.key}
                  onClick={() => setUsage(u)}
                  className="bg-white border border-surface-border rounded-control py-3 text-sm font-medium text-ink-900 hover:border-brand-500 transition-colors"
                >
                  {u.label}
                </button>
              ))}
            </div>
          </div>
        )}

        {usage && (
          <div className="mt-8">
            <p dir="rtl" className="text-sm font-medium text-ink-900 mb-4">2. الميزانية؟</p>
            <div className="grid grid-cols-2 gap-3">
              {BUDGET_PRESETS.map((b) => (
                <button
                  key={b.label}
                  onClick={() => handleBudget(b)}
                  className="bg-white border border-surface-border rounded-control py-3 text-sm font-medium text-ink-900 hover:border-brand-500 transition-colors"
                >
                  {b.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}