import { Link } from 'react-router-dom';
import { LuMessageCircle } from 'react-icons/lu';
import { SHOP_NAME, SHOP_PHONE, SHOP_EMAIL, WHATSAPP_NUMBER } from '../../constants/config.js';

const SHOP_LINKS = [
  { to: '/products?category=laptops', label: 'Laptops' },
  { to: '/products?category=phones', label: 'Téléphones' },
  { to: '/products?category=accessories', label: 'Accessoires' },
  { to: '/subscriptions', label: 'Abonnements' },
  { to: '/services', label: 'Services' },
];

// Lucide has no Facebook/Instagram logos, so these are small inline SVGs
// rather than importing a second icon set.
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  );
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  );
}

export default function Footer() {
  return (
    <footer className="bg-surface-subtle border-t border-surface-border py-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
          <div>
            <p className="text-lg font-semibold text-ink-900">{SHOP_NAME}</p>
            <p className="text-sm text-ink-600 mt-1">Tech store Algérienne. Livraison partout.</p>
            <div className="flex items-center gap-1 mt-4">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-10 h-10 flex items-center justify-center rounded-full text-ink-600 hover:text-brand-600 transition-colors"
              >
                <LuMessageCircle size={20} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-10 h-10 flex items-center justify-center rounded-full text-ink-600 hover:text-brand-600 transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-10 h-10 flex items-center justify-center rounded-full text-ink-600 hover:text-brand-600 transition-colors"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-900 mb-3">Boutique</p>
            <ul className="space-y-2">
              {SHOP_LINKS.map((link) => (
                <li key={link.label}>
                  <Link to={link.to} className="text-sm text-ink-600 hover:text-brand-600 transition-colors">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="text-sm font-semibold text-ink-900 mb-3">Contact</p>
            <ul className="space-y-2 text-sm text-ink-600">
              <li>
                <a href={`tel:${SHOP_PHONE}`} className="hover:text-brand-600 transition-colors">
                  {SHOP_PHONE}
                </a>
              </li>
              <li>
                <a href={`mailto:${SHOP_EMAIL}`} className="hover:text-brand-600 transition-colors">
                  {SHOP_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-brand-600 transition-colors"
                >
                  wa.me/{WHATSAPP_NUMBER}
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-surface-border mt-8 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-ink-400">© 2026 {SHOP_NAME}. Tous droits réservés.</p>
          <div className="flex items-center gap-4 text-xs text-ink-400">
            <Link to="/legal" className="hover:text-ink-600">Mentions légales</Link>
            <Link to="/terms" className="hover:text-ink-600">CGV</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}