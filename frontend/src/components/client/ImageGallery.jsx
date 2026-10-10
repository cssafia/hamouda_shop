import { useEffect, useRef, useState } from 'react';
import { LuChevronLeft, LuChevronRight, LuX, LuPackage } from 'react-icons/lu';

export default function ImageGallery({ images = [], alt }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [lightboxOpen, setLightboxOpen] = useState(false);
  const touchStartX = useRef(null);

  useEffect(() => {
    function handleKeyDown(e) {
      if (!lightboxOpen) return;
      if (e.key === 'Escape') setLightboxOpen(false);
      if (e.key === 'ArrowLeft') goTo(activeIndex - 1);
      if (e.key === 'ArrowRight') goTo(activeIndex + 1);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [lightboxOpen, activeIndex]);

  if (images.length === 0) {
    return (
      <div className="aspect-square bg-surface-subtle rounded-card flex items-center justify-center text-ink-400">
        <LuPackage size={48} aria-hidden="true" />
      </div>
    );
  }

  function goTo(index) {
    setActiveIndex((index + images.length) % images.length);
  }

  function handleTouchStart(e) {
    touchStartX.current = e.touches[0].clientX;
  }

  function handleTouchEnd(e) {
    if (touchStartX.current == null) return;
    const delta = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(delta) > 40) goTo(activeIndex + (delta < 0 ? 1 : -1));
    touchStartX.current = null;
  }

  const hasMultiple = images.length > 1;

  return (
    <div>
      <div
        className="relative group aspect-square bg-surface-subtle rounded-card overflow-hidden"
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        <img
          src={images[activeIndex].url}
          alt={alt}
          loading="eager"
          className="w-full h-full object-cover cursor-zoom-in"
          onClick={() => setLightboxOpen(true)}
        />

        {hasMultiple && (
          <>
            <button
              type="button"
              onClick={() => goTo(activeIndex - 1)}
              aria-label="Image précédente"
              className="absolute left-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                         bg-white/90 backdrop-blur-sm border border-surface-border shadow-card
                         flex items-center justify-center text-ink-700
                         transition-opacity
                         lg:opacity-0 lg:group-hover:opacity-100
                         hover:bg-white"
            >
              <LuChevronLeft size={20} />
            </button>
            <button
              type="button"
              onClick={() => goTo(activeIndex + 1)}
              aria-label="Image suivante"
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full
                         bg-white/90 backdrop-blur-sm border border-surface-border shadow-card
                         flex items-center justify-center text-ink-700
                         transition-opacity
                         lg:opacity-0 lg:group-hover:opacity-100
                         hover:bg-white"
            >
              <LuChevronRight size={20} />
            </button>
          </>
        )}
      </div>

      {hasMultiple && (
        <>
          <div className="flex sm:hidden items-center justify-center gap-1.5 mt-3">
            {images.map((_, i) => (
              <span
                key={i}
                className={`w-1.5 h-1.5 rounded-full transition-colors ${
                  i === activeIndex ? 'bg-brand-500' : 'bg-surface-border'
                }`}
              />
            ))}
          </div>

          <div className="hidden sm:flex gap-2 mt-3 overflow-x-auto scrollbar-hide">
            {images.map((img, i) => (
              <button
                key={i}
                type="button"
                onClick={() => setActiveIndex(i)}
                aria-label={`Image ${i + 1}`}
                aria-current={i === activeIndex}
                className={`shrink-0 w-16 h-16 lg:w-20 lg:h-20 rounded-control overflow-hidden border-2 transition-colors ${
                  i === activeIndex
                    ? 'border-brand-500'
                    : 'border-transparent hover:border-surface-border'
                }`}
              >
                <img
                  src={img.url}
                  alt=""
                  loading="lazy"
                  className="w-full h-full object-cover"
                />
              </button>
            ))}
          </div>
        </>
      )}

      {lightboxOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          <button
            type="button"
            onClick={() => setLightboxOpen(false)}
            aria-label="Fermer"
            className="absolute top-4 right-4 w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 rounded-full"
          >
            <LuX size={24} />
          </button>

          {hasMultiple && (
            <>
              <button
                type="button"
                onClick={() => goTo(activeIndex - 1)}
                aria-label="Image précédente"
                className="absolute left-2 sm:left-4 w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 rounded-full"
              >
                <LuChevronLeft size={28} />
              </button>
              <button
                type="button"
                onClick={() => goTo(activeIndex + 1)}
                aria-label="Image suivante"
                className="absolute right-2 sm:right-4 w-11 h-11 flex items-center justify-center text-white hover:bg-white/10 rounded-full"
              >
                <LuChevronRight size={28} />
              </button>
            </>
          )}

          <img
            src={images[activeIndex].url}
            alt={alt}
            className="max-w-full max-h-full object-contain px-14 sm:px-20"
          />
        </div>
      )}
    </div>
  );
}