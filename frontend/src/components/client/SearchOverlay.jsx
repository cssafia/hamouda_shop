import { useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LuX, LuSearch } from 'react-icons/lu';

const RECENT_KEY = 'recent-searches';
const MAX_RECENT = 5;

function getRecent() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY)) || [];
  } catch {
    return [];
  }
}

function saveRecent(query) {
  const existing = getRecent().filter((q) => q.toLowerCase() !== query.toLowerCase());
  const updated = [query, ...existing].slice(0, MAX_RECENT);
  localStorage.setItem(RECENT_KEY, JSON.stringify(updated));
  return updated;
}

// v1 has no live results — this is just the box + recent + category shortcuts,
// so no debounce is wired up yet. Live search (v2) would debounce here.
export default function SearchOverlay({ open, onClose, categories = [] }) {
  const [query, setQuery] = useState('');
  const [recent, setRecent] = useState([]);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (open) {
      setRecent(getRecent());
      requestAnimationFrame(() => inputRef.current?.focus());
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape') onClose();
    }
    if (open) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open, onClose]);

  function goToSearch(q) {
    const trimmed = q.trim();
    if (!trimmed) return;
    saveRecent(trimmed);
    setQuery('');
    onClose();
    navigate(`/products?search=${encodeURIComponent(trimmed)}`);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 bg-white flex flex-col">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          goToSearch(query);
        }}
        className="flex items-center gap-3 px-4 sm:px-6 h-16 border-b border-surface-border shrink-0"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Fermer la recherche"
          className="w-11 h-11 flex items-center justify-center text-ink-600"
        >
          <LuX size={22} />
        </button>
        <div className="flex-1 flex items-center gap-2">
          <LuSearch size={18} className="text-ink-400 shrink-0" aria-hidden="true" />
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Chercher un produit…"
            className="w-full bg-transparent text-base text-ink-900 placeholder:text-ink-400 focus:outline-none"
          />
        </div>
      </form>

      <div className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 overflow-y-auto">
        {recent.length > 0 && (
          <div className="mb-8">
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-3">
              Recherches récentes
            </p>
            <ul className="space-y-1">
              {recent.map((q) => (
                <li key={q}>
                  <button
                    onClick={() => goToSearch(q)}
                    className="w-full text-left px-2 py-2 rounded-control text-sm text-ink-900 hover:bg-surface-subtle"
                  >
                    {q}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}

        {categories.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-ink-400 uppercase tracking-wide mb-3">
              Catégories
            </p>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      onClose();
                      navigate(`/products?category=${cat.id}`);
                    }}
                    className="w-full text-left px-2 py-2 rounded-control text-sm text-ink-900 hover:bg-surface-subtle"
                  >
                    {cat.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}