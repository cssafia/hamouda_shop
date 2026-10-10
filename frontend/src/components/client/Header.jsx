import { useEffect, useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { LuMenu, LuSearch } from 'react-icons/lu';
import { useCategories } from '../../features/categories/useCategories.js';
import { SHOP_NAME } from '../../constants/config.js';
import CartIcon from './CartIcon.jsx';
import MobileMenuSheet from './MobileMenuSheet.jsx';
import SearchOverlay from './SearchOverlay.jsx';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { data: categories } = useCategories();
  const topCategories = (categories || []).slice(0, 5);

  useEffect(() => {
    let ticking = false;

    function handleScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        setScrolled(window.scrollY > 8);
        ticking = false;
      });
    }

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const navLinkClass = ({ isActive }) =>
    `text-sm font-medium transition-colors hover:text-brand-600 ${
      isActive ? 'text-brand-600' : 'text-ink-600'
    }`;

  return (
    <>
      <header
        className={`sticky top-0 z-40 h-16 border-b transition-colors ${
          scrolled
            ? 'bg-white/95 backdrop-blur-sm border-surface-border'
            : 'bg-white border-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full">
          {/* Mobile layout */}
          <div className="grid grid-cols-3 items-center h-full lg:hidden">
            <button
              onClick={() => setMenuOpen(true)}
              aria-label="Menu"
              className="w-11 h-11 flex items-center justify-start text-ink-900 focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded-control"
            >
              <LuMenu size={22} />
            </button>

            <Link to="/" className="justify-self-center text-lg font-semibold text-ink-900">
              {SHOP_NAME}
            </Link>

            <div className="flex items-center justify-end gap-1">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Rechercher"
                className="w-11 h-11 flex items-center justify-center text-ink-600 hover:text-brand-600 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded-control"
              >
                <LuSearch size={20} />
              </button>
              <CartIcon />
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:flex items-center justify-between h-full gap-4">
            <div className="flex items-center gap-8">
              <Link to="/" className="text-lg font-semibold text-ink-900">
                {SHOP_NAME}
              </Link>
                <nav className="flex items-center gap-6">
                <NavLink to="/" end className={navLinkClass}>الرئيسية</NavLink>
                {topCategories.map((cat) => (
                    <NavLink key={cat.id} to={`/products?category=${cat.id}`} className={navLinkClass}>
                    {cat.name}
                    </NavLink>
                ))}
                <NavLink to="/subscriptions" className={navLinkClass}>الاشتراكات</NavLink>
                <NavLink to="/services" className={navLinkClass}>الخدمات</NavLink>
                </nav>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setSearchOpen(true)}
                aria-label="Rechercher"
                className="w-11 h-11 flex items-center justify-center text-ink-600 hover:text-brand-600 transition-colors focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded-control"
              >
                <LuSearch size={20} />
              </button>
              <CartIcon />
            </div>
          </div>
        </div>
      </header>

      <MobileMenuSheet open={menuOpen} onClose={() => setMenuOpen(false)} categories={categories || []} />
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} categories={categories || []} />
    </>
  );
}