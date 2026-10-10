import { useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LuRepeat, LuWrench, LuMessageCircle } from 'react-icons/lu';
import Sheet from '../ui/Sheet.jsx';
import { WHATSAPP_NUMBER } from '../../constants/config.js';

export default function MobileMenuSheet({ open, onClose, categories = [] }) {
  const location = useLocation();

  useEffect(() => {
    onClose();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.pathname]);

  return (
    <Sheet open={open} onClose={onClose} title="Menu">
      <nav className="flex flex-col">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            to={`/products?category=${cat.id}`}
            className="px-4 py-3 text-sm font-medium text-ink-900 hover:bg-surface-subtle rounded-control"
          >
            {cat.name}
          </Link>
        ))}

        <div className="my-2 border-t border-surface-border" />

        <Link
          to="/subscriptions"
          className="px-4 py-3 text-sm font-medium text-ink-900 hover:bg-surface-subtle rounded-control flex items-center gap-2"
        >
          <LuRepeat size={18} className="text-ink-600" aria-hidden="true" />
          Abonnements
        </Link>
        <Link
          to="/services"
          className="px-4 py-3 text-sm font-medium text-ink-900 hover:bg-surface-subtle rounded-control flex items-center gap-2"
        >
          <LuWrench size={18} className="text-ink-600" aria-hidden="true" />
          Services
        </Link>
        <Link to="/about" className="px-4 py-3 text-sm font-medium text-ink-900 hover:bg-surface-subtle rounded-control">
          À propos
        </Link>
        <Link to="/contact" className="px-4 py-3 text-sm font-medium text-ink-900 hover:bg-surface-subtle rounded-control">
          Contact
        </Link>
      </nav>

      <a
        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent('Bonjour, je voudrais des infos.')}`}
        target="_blank"
        rel="noopener noreferrer"
        className="btn-primary mt-4 mx-4 flex items-center justify-center gap-2"
      >
        <LuMessageCircle size={18} aria-hidden="true" />
        Contacter sur WhatsApp
      </a>
    </Sheet>
  );
}