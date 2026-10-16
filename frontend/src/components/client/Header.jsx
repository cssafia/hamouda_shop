import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { LuMenu, LuSearch, LuCpu } from 'react-icons/lu';
import { useCategories } from '../../features/categories/useCategories.js';
import { SHOP_NAME } from '../../constants/config.js';
import CartIcon from './CartIcon.jsx';
import MobileMenuSheet from './MobileMenuSheet.jsx';
import SearchOverlay from './SearchOverlay.jsx';


const LOGO_SRC = null;



const linkClass = (active) =>
  `relative py-1 text-sm font-medium transition-colors ${
    active
      ? 'text-ink-900 after:absolute after:inset-x-0 after:-bottom-1 after:h-0.5 after:rounded-full after:bg-brand-500'
      : 'text-ink-600 hover:text-ink-900'
  }`;

const iconBtn =
  'w-11 h-11 flex items-center justify-center text-ink-600 hover:text-brand-600 transition-colors ' +
  'focus-visible:ring-2 focus-visible:ring-brand-500/40 rounded-control';

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);

  const { pathname, search } = useLocation();
  const { data: categories } = useCategories();
  const topCategories = (categories || []).slice(0, 5);

  const activeCategoryId = pathname === '/products' ? new URLSearchParams(search).get('category_id') : null;

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

  const brand = (
    <Link to="/" className="flex items-center gap-2.5" aria-label={SHOP_NAME}>
      {LOGO_SRC ? (
        <img src={LOGO_SRC} alt={SHOP_NAME} className="h-8 w-auto" />
      ) : (
        <>
          <span className="w-8 h-8 rounded-control bg-brand-500 text-white flex items-center justify-center">
            <LuCpu size={18} aria-hidden="true" />
          </span>
          <span className="text-lg font-semibold text-ink-900 tracking-tight">{SHOP_NAME}</span>
        </>
      )}
    </Link>
  );

  return (
    <>
      <header
        className={`sticky top-0 z-40 h-16 border-b bg-white/85 backdrop-blur-md transition-shadow ${
          scrolled ? 'border-surface-border shadow-sm' : 'border-transparent'
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

            <div className="justify-self-center">{brand}</div>

            <div className="flex items-center justify-end gap-1">
              <button onClick={() => setSearchOpen(true)} aria-label="Rechercher" className={iconBtn}>
                <LuSearch size={20} />
              </button>
              <CartIcon />
            </div>
          </div>

          {/* Desktop layout */}
          <div className="hidden lg:flex items-center justify-between h-full gap-4">
            <div className="flex items-center gap-10">
              {brand}
              <nav className="flex items-center gap-7" aria-label="Navigation principale">
                <NavLink to="/" end className={({ isActive }) => linkClass(isActive)}>
                  Accueil
                </NavLink>
                {topCategories.map((cat) => (
                  <Link
                    key={cat.id}
                    to={`/products?category_id=${cat.id}`}
                    className={linkClass(String(cat.id) === activeCategoryId)}
                  >
                    {cat.name}
                  </Link>
                ))}
                <NavLink to="/services" className={({ isActive }) => linkClass(isActive)}>
                  Services
                </NavLink>
              </nav>
            </div>

            <div className="flex items-center gap-1">
              <button onClick={() => setSearchOpen(true)} aria-label="Rechercher" className={iconBtn}>
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