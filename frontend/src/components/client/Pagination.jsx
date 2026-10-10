import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

function getPageList(current, total) {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set([1, total, current, current - 1, current + 1]);
  const sorted = [...pages].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const withEllipsis = [];
  sorted.forEach((page, i) => {
    if (i > 0 && page - sorted[i - 1] > 1) withEllipsis.push('ellipsis');
    withEllipsis.push(page);
  });
  return withEllipsis;
}

export default function Pagination({ meta, onPage }) {
  const { page = 1, pages = 1 } = meta || {};
  if (pages <= 1) return null;

  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-1 mt-8">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label="Page précédente"
        className="w-11 h-11 flex items-center justify-center rounded-control text-ink-600
                   hover:bg-surface-subtle disabled:opacity-30 disabled:pointer-events-none"
      >
        <LuChevronLeft size={18} />
      </button>

      {/* Mobile: compact "Page x / y" instead of a full numbered row — numbers
          don't fit comfortably at 375px with 44px tap targets. */}
      <span className="sm:hidden text-sm text-ink-600 px-3">
        Page {page} / {pages}
      </span>

      <div className="hidden sm:flex items-center gap-1">
        {getPageList(page, pages).map((p, i) =>
          p === 'ellipsis' ? (
            <span key={`e-${i}`} className="w-11 h-11 flex items-center justify-center text-ink-400">
              …
            </span>
          ) : (
            <button
              key={p}
              onClick={() => onPage(p)}
              aria-current={p === page ? 'page' : undefined}
              className={`w-11 h-11 flex items-center justify-center rounded-control text-sm font-medium transition-colors ${
                p === page ? 'bg-brand-500 text-white' : 'text-ink-600 hover:bg-surface-subtle'
              }`}
            >
              {p}
            </button>
          )
        )}
      </div>

      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= pages}
        aria-label="Page suivante"
        className="w-11 h-11 flex items-center justify-center rounded-control text-ink-600
                   hover:bg-surface-subtle disabled:opacity-30 disabled:pointer-events-none"
      >
        <LuChevronRight size={18} />
      </button>
    </nav>
  );
}