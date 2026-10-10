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

export default function KeySpecs({
  specifications = [],
  overrides = [],
  limit = 4,
}) {
  const merged = mergeSpecs(specifications, overrides);
  const display = merged.slice(0, limit);

  if (display.length === 0) return null;

  return (
    <div className="grid grid-cols-2 gap-2">
      {display.map((spec) => (
        <div
          key={spec.name}
          className={`rounded-control border px-3 py-2 transition-colors ${
            spec.changed
              ? 'border-brand-500/50 bg-brand-50/50'
              : 'border-surface-border bg-surface-subtle/60'
          }`}
        >
          <p className="text-[11px] uppercase tracking-wide text-ink-500 truncate">
            {spec.name}
          </p>
          <p
            className={`text-sm font-medium mt-0.5 truncate ${
              spec.changed ? 'text-brand-700' : 'text-ink-900'
            }`}
            title={spec.value}
          >
            {spec.value}
          </p>
        </div>
      ))}
    </div>
  );
}