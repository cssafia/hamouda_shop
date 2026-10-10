import { LuMinus, LuPlus } from 'react-icons/lu';

export default function QuantityStepper({ value, onChange, min = 1, max }) {
  function clamp(n) {
    let next = n;
    if (next < min) next = min;
    if (max != null && next > max) next = max;
    return next;
  }

  function handleInputChange(e) {
    const parsed = parseInt(e.target.value, 10);
    if (!Number.isNaN(parsed)) onChange(clamp(parsed));
  }

  return (
    <div className="inline-flex items-center border border-surface-border rounded-control">
      <button
        type="button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Diminuer la quantité"
        className="w-11 h-11 flex items-center justify-center text-ink-600 hover:text-brand-600 disabled:opacity-30 disabled:pointer-events-none"
      >
        <LuMinus size={16} />
      </button>

      <input
        type="number"
        inputMode="numeric"
        value={value}
        onChange={handleInputChange}
        aria-label="Quantité"
        className="w-12 text-center text-sm font-medium text-ink-900 bg-transparent focus:outline-none"
      />

      <button
        type="button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={max != null && value >= max}
        aria-label="Augmenter la quantité"
        className="w-11 h-11 flex items-center justify-center text-ink-600 hover:text-brand-600 disabled:opacity-30 disabled:pointer-events-none"
      >
        <LuPlus size={16} />
      </button>
    </div>
  );
}