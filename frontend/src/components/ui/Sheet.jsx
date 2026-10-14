// src/components/ui/Sheet.jsx
import { useEffect } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';


const SIDE_CLASSES = {
  bottom: [
    'inset-x-0 bottom-0 top-14',
    'max-h-[85vh] rounded-t-2xl pb-[env(safe-area-inset-bottom)]',
    'lg:inset-x-auto lg:right-0 lg:top-14 lg:bottom-0 lg:left-auto',
    'lg:w-[448px] lg:max-w-full lg:max-h-none',
    'lg:rounded-none lg:rounded-l-2xl lg:pb-0',
  ].join(' '),

  right: 'top-14 bottom-0 right-0 left-auto w-[85vw] max-w-md rounded-l-2xl',

  left: 'top-14 bottom-0 left-0 right-auto w-[85vw] max-w-md rounded-r-2xl',
};

export default function Sheet({ open, onClose, title, children, side = 'bottom' }) {
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

  const sideClass = SIDE_CLASSES[side] ?? SIDE_CLASSES.bottom;

  return createPortal(
    <>
      {/* Backdrop — starts below the header, so the header stays clickable */}
      <div
        className="fixed inset-x-0 top-14 bottom-0 z-[90] bg-ink-900/40 animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Panel */}
      <div
        role="dialog"
        aria-modal="true"
        className={`fixed z-[100] bg-white flex flex-col shadow-2xl overflow-hidden animate-fade-in ${sideClass}`}
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
    </>,
    document.body
  );
}