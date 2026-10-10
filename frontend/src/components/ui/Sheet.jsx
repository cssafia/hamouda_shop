// src/components/ui/Sheet.jsx
import { useEffect } from 'react';
import { X } from 'lucide-react';

export default function Sheet({ open, onClose, title, children }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50" role="dialog" aria-modal="true">
      <div
        className="absolute inset-0 bg-ink-900/40 animate-fade-in"
        onClick={onClose}
      />
      <div
        className="
          absolute bg-white flex flex-col shadow-2xl
          inset-x-0 bottom-0 rounded-t-2xl max-h-[85vh] pb-[env(safe-area-inset-bottom)]
          lg:inset-y-0 lg:right-0 lg:left-auto lg:w-full lg:max-w-md lg:max-h-none
          lg:rounded-none lg:rounded-l-2xl lg:pb-0
          animate-fade-in
        "
      >
        <div className="flex items-center justify-between p-4 border-b border-surface-border shrink-0">
          <h2 className="font-semibold text-ink-900">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 -m-2 text-ink-600 hover:text-ink-900"
            aria-label="Fermer"
          >
            <X size={20} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto flex flex-col">{children}</div>
      </div>
    </div>
  );
}