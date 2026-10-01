import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface HeroSlide {
  id: number;
  imageUrl: string;
  originalPhototourlUrl?: string;
  fallbackUrl?: string;
  alt: string;
}

export const HERO_SLIDES: HeroSlide[] = [
  {
    id: 1,
    imageUrl: 'https://cdn.phototourl.com/member/2026-10-01-6b83008d-38b6-4ceb-af73-978209ace660.png',
    fallbackUrl: '/assets/cover-1.png',
    alt: 'Mumtahina’s Closet Inc - Hero Cover 1',
  },
  {
    id: 2,
    imageUrl: 'https://cdn.phototourl.com/member/2026-10-01-e4704661-1758-43ce-8c1c-8a6d10f67028.png',
    fallbackUrl: '/assets/cover-2.png',
    alt: 'Mumtahina’s Closet Inc - Hero Cover 2',
  },
  {
    id: 3,
    imageUrl: 'https://cdn.phototourl.com/member/2026-10-01-d9256779-02c1-409a-b583-2dc491cac0d4.png',
    fallbackUrl: '/assets/cover-3.png',
    alt: 'Mumtahina’s Closet Inc - Hero Cover 3',
  },
];

interface HeroBannerCarouselProps {
  onNavigateToShop?: () => void;
}

export const HeroBannerCarousel: React.FC<HeroBannerCarouselProps> = ({ onNavigateToShop }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);
  const [slideSources, setSlideSources] = useState<Record<number, string>>(() => {
    const initial: Record<number, string> = {};
    HERO_SLIDES.forEach((slide) => {
      initial[slide.id] = slide.imageUrl;
    });
    return initial;
  });
  const [failedSlides, setFailedSlides] = useState<Record<number, boolean>>({});

  const handleImageError = (slideId: number, fallbackUrl?: string) => {
    if (fallbackUrl && slideSources[slideId] !== fallbackUrl) {
      setSlideSources((prev) => ({
        ...prev,
        [slideId]: fallbackUrl,
      }));
    } else {
      setFailedSlides((prev) => ({
        ...prev,
        [slideId]: true,
      }));
    }
  };

  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % HERO_SLIDES.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  }, []);

  const goToSlide = (index: number) => {
    if (index === currentIndex) return;
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Automatic slide interval (every 4.5 seconds)
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      nextSlide();
    }, 4500);

    return () => clearInterval(timer);
  }, [nextSlide, isPaused]);

  // Touch handlers for mobile swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    setIsPaused(true);
    touchStartX.current = e.targetTouches[0].clientX;
    touchEndX.current = null;
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    touchEndX.current = e.targetTouches[0].clientX;
  };

  const handleTouchEnd = () => {
    setIsPaused(false);
    if (touchStartX.current === null || touchEndX.current === null) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 40; // minimum swipe threshold in pixels

    if (distance > minSwipeDistance) {
      // Swiped left -> next slide
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> previous slide
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 30 : -30,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -30 : 30,
      opacity: 0,
    }),
  };

  const currentSlide = HERO_SLIDES[currentIndex];

  return (
    <section
      id="home-hero-carousel-section"
      aria-label="Promotional Hero Banners"
      className="px-2.5 sm:px-6 lg:px-8 pt-2 sm:pt-4"
    >
      <div className="max-w-7xl mx-auto">
        <div
          className="group relative w-full overflow-hidden rounded-xl sm:rounded-2xl lg:rounded-3xl shadow-xs border border-[#F4D3D7] bg-[#FAF0F2] select-none"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Main Slide Aspect Ratio Box - optimized for mobile prominence while preserving desktop aspect ratio */}
          <div
            className="relative w-full aspect-[2/1] sm:aspect-[2.2/1] md:aspect-[2.4/1] lg:aspect-[2048/768] cursor-pointer overflow-hidden"
            onClick={() => onNavigateToShop && onNavigateToShop()}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                if (onNavigateToShop) onNavigateToShop();
              }
            }}
            aria-label={`Slide ${currentIndex + 1} of ${HERO_SLIDES.length}: View in shop`}
          >
            <AnimatePresence initial={false} custom={direction} mode="popLayout">
              <motion.div
                key={currentSlide.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{
                  x: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
                  opacity: { duration: 0.45, ease: 'easeInOut' },
                }}
                className="absolute inset-0 w-full h-full bg-[#FAF0F2]"
              >
                {!failedSlides[currentSlide.id] ? (
                  <img
                    src={slideSources[currentSlide.id] || currentSlide.imageUrl}
                    alt={currentSlide.alt}
                    onError={() => handleImageError(currentSlide.id, currentSlide.fallbackUrl)}
                    className="w-full h-full object-cover object-center select-none"
                    loading={currentIndex === 0 ? 'eager' : 'lazy'}
                    decoding="async"
                    draggable={false}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-[#FAF0F2]">
                    <img
                      src={currentSlide.fallbackUrl || currentSlide.imageUrl}
                      alt=""
                      className="w-full h-full object-cover object-center select-none"
                      draggable={false}
                    />
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Arrow Controls */}
          <button
            id="hero-carousel-prev-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#0F1E36] shadow-md backdrop-blur-xs flex items-center justify-center opacity-80 sm:opacity-75 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all focus:outline-hidden z-20 cursor-pointer"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F1E36]" />
          </button>

          <button
            id="hero-carousel-next-btn"
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-white/85 hover:bg-white text-[#0F1E36] shadow-md backdrop-blur-xs flex items-center justify-center opacity-80 sm:opacity-75 sm:group-hover:opacity-100 hover:scale-105 active:scale-95 transition-all focus:outline-hidden z-20 cursor-pointer"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5 text-[#0F1E36]" />
          </button>

          {/* Carousel Navigation Dots */}
          <div
            className="absolute bottom-2.5 sm:bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 sm:gap-2 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-full bg-black/25 backdrop-blur-xs"
            role="tablist"
            aria-label="Hero Slides"
          >
            {HERO_SLIDES.map((slide, idx) => {
              const isActive = idx === currentIndex;
              return (
                <button
                  key={slide.id}
                  type="button"
                  role="tab"
                  aria-selected={isActive}
                  aria-label={`Go to slide ${idx + 1}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    goToSlide(idx);
                  }}
                  className={`transition-all duration-300 rounded-full focus:outline-hidden cursor-pointer ${
                    isActive
                      ? 'w-5 sm:w-7 h-2 sm:h-2.5 bg-white shadow-xs'
                      : 'w-2 sm:w-2.5 h-2 sm:h-2.5 bg-white/60 hover:bg-white/90'
                  }`}
                />
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
};
