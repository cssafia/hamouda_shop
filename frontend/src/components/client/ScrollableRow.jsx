import { Children, useCallback, useEffect, useRef, useState } from 'react';
import { LuChevronLeft, LuChevronRight } from 'react-icons/lu';

export default function ScrollableRow({
  children,
  showArrows = true,
  ariaLabelPrev = 'Précédent',
  ariaLabelNext = 'Suivant',
  className = '',
}) {
  const scrollRef = useRef(null);
  const [canPrev, setCanPrev] = useState(false);
  const [canNext, setCanNext] = useState(false);

 
  const itemCount = Children.count(children);

  const updateArrows = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanPrev(el.scrollLeft > 4);
    setCanNext(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    updateArrows();
    const el = scrollRef.current;
    if (!el) return;

    let ticking = false;
    function onScroll() {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        updateArrows();
        ticking = false;
      });
    }

    el.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', updateArrows);
    return () => {
      el.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', updateArrows);
    };
  }, [updateArrows, itemCount]);

  function scrollByPage(direction) {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: direction * el.clientWidth * 0.85, behavior: 'smooth' });
  }

  return (
    <div className={`relative ${className}`}>
      {showArrows && canPrev && (
        <button
          type="button"
          onClick={() => scrollByPage(-1)}
          aria-label={ariaLabelPrev}
          className="hidden lg:flex items-center justify-center absolute -left-4 top-1/2 -translate-y-1/2 z-10
                     w-10 h-10 rounded-full bg-white border border-surface-border shadow-card
                     text-ink-600 hover:text-brand-600 hover:border-brand-500 transition-colors
                     focus-visible:ring-2 focus-visible:ring-brand-500/40"
        >
          <LuChevronLeft size={18} />
        </button>
      )}

      <div
        ref={scrollRef}
        dir="ltr"
        className="flex gap-3 lg:gap-4 overflow-x-auto snap-x snap-mandatory scroll-smooth
                   -mx-4 px-4 sm:-mx-6 sm:px-6 lg:mx-0 lg:px-0 scrollbar-hide"
      >
        {children}
      </div>

      {showArrows && canNext && (
        <button
          type="button"
          onClick={() => scrollByPage(1)}
          aria-label={ariaLabelNext}
          className="hidden lg:flex items-center justify-center absolute -right-4 top-1/2 -translate-y-1/2 z-10
                     w-10 h-10 rounded-full bg-white border border-surface-border shadow-card
                     text-ink-600 hover:text-brand-600 hover:border-brand-500 transition-colors
                     focus-visible:ring-2 focus-visible:ring-brand-500/40"
        >
          <LuChevronRight size={18} />
        </button>
      )}
    </div>
  );
}