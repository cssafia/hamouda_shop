// src/components/client/Footer.jsx
import { Link } from 'react-router-dom'
import { LuMessageCircle, LuArrowUpRight } from 'react-icons/lu'

import { useCategories } from '../../features/categories/useCategories'
import {
  SHOP_NAME,
  SHOP_PHONE,
  SHOP_EMAIL,
  WHATSAPP_NUMBER,
  DEVELOPER_URL,
} from '../../constants/config.js'

/* Fixed links that always show */
const FIXED_LINKS = [
  { to: '/subscriptions', label: 'Abonnements' },
  { to: '/services',      label: 'Services' },
]

/* Lucide has no brand logos — small inline SVGs */
function FacebookIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" {...props}>
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}

function InstagramIcon(props) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16" {...props}>
      <rect x="2" y="2" width="20" height="20" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.5" cy="6.5" r="0.5" fill="currentColor" stroke="none" />
    </svg>
  )
}

export default function Footer() {
  const { data: categories, isLoading } = useCategories()

  const topCategories = (categories ?? []).slice(0, 5)

  return (
    <footer className="bg-brand-50 border-t border-brand-100">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-8">
          {/* Brand */}
          <div className="col-span-2 sm:col-span-1">
            <p className="text-base font-semibold text-ink-900">{SHOP_NAME}</p>
            <p className="text-xs text-ink-600 mt-1.5 max-w-xs">
              Tech store algérienne · Livraison partout.
            </p>
            <div className="flex items-center gap-0.5 mt-4">
              <a
                href={`https://wa.me/${WHATSAPP_NUMBER}`}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="WhatsApp"
                className="w-8 h-8 flex items-center justify-center rounded-full text-ink-600 hover:text-brand-600 hover:bg-white transition-colors"
              >
                <LuMessageCircle size={16} />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Facebook"
                className="w-8 h-8 flex items-center justify-center rounded-full text-ink-600 hover:text-brand-600 hover:bg-white transition-colors"
              >
                <FacebookIcon />
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Instagram"
                className="w-8 h-8 flex items-center justify-center rounded-full text-ink-600 hover:text-brand-600 hover:bg-white transition-colors"
              >
                <InstagramIcon />
              </a>
            </div>
          </div>

          {/* Categories — from API */}
          <div>
            <p className="text-xs font-semibold text-ink-900 uppercase tracking-wide mb-3">
              Catégories
            </p>
            <ul className="space-y-2">
              {isLoading ? (
                Array.from({ length: 3 }).map((_, i) => (
                  <li key={i} className="h-3 w-20 bg-brand-100 rounded animate-pulse" />
                ))
              ) : (
                <>
                  {topCategories.map((cat) => (
                    <li key={cat.id}>
                      <Link
                        to={`/products?category_id=${cat.id}`}
                        className="text-sm text-ink-600 hover:text-brand-600 transition-colors"
                      >
                        {cat.name}
                      </Link>
                    </li>
                  ))}
                  {FIXED_LINKS.map((link) => (
                    <li key={link.label}>
                      <Link
                        to={link.to}
                        className="text-sm text-ink-600 hover:text-brand-600 transition-colors"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </>
              )}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="text-xs font-semibold text-ink-900 uppercase tracking-wide mb-3">
              Contact
            </p>
            <ul className="space-y-2 text-sm">
              <li>
                <a
                  href={`tel:${SHOP_PHONE}`}
                  className="text-ink-600 hover:text-brand-600 transition-colors"
                >
                  {SHOP_PHONE}
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${SHOP_EMAIL}`}
                  className="text-ink-600 hover:text-brand-600 transition-colors"
                >
                  {SHOP_EMAIL}
                </a>
              </li>
              <li>
                <a
                  href={`https://wa.me/${WHATSAPP_NUMBER}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-ink-600 hover:text-brand-600 transition-colors"
                >
                  WhatsApp
                  <LuArrowUpRight size={12} />
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-brand-100 mt-8 pt-5 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-ink-600">
          <p>
            © 2026 {SHOP_NAME}. Tous droits réservés.
          </p>

          <div className="flex items-center gap-4">
            <Link to="/legal" className="hover:text-brand-600 transition-colors">
              Mentions légales
            </Link>
            <Link to="/terms" className="hover:text-brand-600 transition-colors">
              CGV
            </Link>
          </div>
        </div>

        {/* Credit */}
        <p className="text-center text-xs text-ink-500 mt-5">
          Developed by{' '}
          <a
            href={DEVELOPER_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="font-medium text-brand-600 hover:underline"
          >
            Safia Lounassi
          </a>
        </p>
      </div>
    </footer>
  )
}