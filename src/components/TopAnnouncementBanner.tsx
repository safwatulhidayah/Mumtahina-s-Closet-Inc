import React, { useState, useEffect, useRef, useCallback } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export interface AnnouncementItem {
  id: number;
  emoji: string;
  text: string;
}

export const ANNOUNCEMENTS: AnnouncementItem[] = [
  {
    id: 1,
    emoji: '🚚',
    text: 'Free Shipping on Orders Over $75 (USA)',
  },
  {
    id: 2,
    emoji: '❤️',
    text: 'Quality Fashion | Modest | Stylish',
  },
  {
    id: 3,
    emoji: '🛡️',
    text: 'Secure Payments',
  },
];

export const TopAnnouncementBanner: React.FC = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState<number>(1);
  const [isPaused, setIsPaused] = useState(false);
  const touchStartX = useRef<number | null>(null);
  const touchEndX = useRef<number | null>(null);

  const nextSlide = useCallback(() => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % ANNOUNCEMENTS.length);
  }, []);

  const prevSlide = useCallback(() => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + ANNOUNCEMENTS.length) % ANNOUNCEMENTS.length);
  }, []);

  const goToSlide = (index: number) => {
    setDirection(index > currentIndex ? 1 : -1);
    setCurrentIndex(index);
  };

  // Auto-play timer
  useEffect(() => {
    if (isPaused) return;

    const interval = setInterval(() => {
      nextSlide();
    }, 3800);

    return () => clearInterval(interval);
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
    if (!touchStartX.current || !touchEndX.current) return;
    const distance = touchStartX.current - touchEndX.current;
    const minSwipeDistance = 35;

    if (distance > minSwipeDistance) {
      // Swiped left -> next
      nextSlide();
    } else if (distance < -minSwipeDistance) {
      // Swiped right -> prev
      prevSlide();
    }
    touchStartX.current = null;
    touchEndX.current = null;
  };

  const currentItem = ANNOUNCEMENTS[currentIndex];

  const slideVariants = {
    enter: (dir: number) => ({
      x: dir > 0 ? 40 : -40,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (dir: number) => ({
      x: dir > 0 ? -40 : 40,
      opacity: 0,
    }),
  };

  return (
    <aside
      id="top-promotional-announcement-banner"
      aria-label="Promotional Announcements"
      className="relative z-50 bg-[#FAF0F2] border-b border-[#F4D3D7] text-[#4A1521] select-none w-full overflow-hidden"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      <div className="max-w-7xl mx-auto px-2 sm:px-4">
        {/* MOBILE VIEW: Horizontal carousel / slider showing 1 message at a time */}
        <div
          className="flex md:hidden items-center justify-between h-9 px-1 w-full"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          {/* Previous Button */}
          <button
            id="banner-prev-btn"
            onClick={(e) => {
              e.stopPropagation();
              prevSlide();
            }}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[#6B2135] hover:text-[#0F1E36] hover:bg-[#F4D3D7]/60 active:scale-95 transition-all focus:outline-hidden"
            aria-label="Previous announcement"
          >
            <ChevronLeft className="w-3.5 h-3.5" />
          </button>

          {/* Active Message Container */}
          <div className="flex-1 overflow-hidden relative h-7 flex items-center justify-center px-0.5 min-w-0">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentItem.id}
                custom={direction}
                variants={slideVariants}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="flex items-center justify-center gap-1.5 text-center w-full px-1 min-w-0"
              >
                <span className="text-xs sm:text-sm flex-shrink-0 leading-none" role="img" aria-hidden="true">
                  {currentItem.emoji}
                </span>
                <span className="text-[10px] min-[360px]:text-[11.5px] sm:text-xs font-medium text-[#4A1521] tracking-tight truncate select-none">
                  {currentItem.text}
                </span>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Next Button */}
          <button
            id="banner-next-btn"
            onClick={(e) => {
              e.stopPropagation();
              nextSlide();
            }}
            className="flex-shrink-0 w-6 h-6 flex items-center justify-center rounded-full text-[#6B2135] hover:text-[#0F1E36] hover:bg-[#F4D3D7]/60 active:scale-95 transition-all focus:outline-hidden"
            aria-label="Next announcement"
          >
            <ChevronRight className="w-3.5 h-3.5" />
          </button>

          {/* Slide Indicator Dots on Mobile */}
          <div className="absolute bottom-0.5 left-1/2 -translate-x-1/2 flex items-center gap-1">
            {ANNOUNCEMENTS.map((item, idx) => (
              <button
                key={item.id}
                onClick={() => goToSlide(idx)}
                className={`transition-all duration-300 rounded-full ${
                  idx === currentIndex
                    ? 'w-3 h-1 bg-[#BE3A55]'
                    : 'w-1 h-1 bg-[#F4D3D7] hover:bg-[#D48B98]'
                }`}
                aria-label={`Go to announcement ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* DESKTOP VIEW: Clean 3-part layout showcasing all 3 banners in the soft pink palette */}
        <div className="hidden md:flex items-center justify-between h-9 text-xs font-semibold text-[#4A1521]">
          {/* Item 1 */}
          <div className="flex items-center gap-2">
            <span className="text-sm" role="img" aria-hidden="true">
              {ANNOUNCEMENTS[0].emoji}
            </span>
            <span>{ANNOUNCEMENTS[0].text}</span>
          </div>

          <span className="text-[#D48B98] opacity-60">•</span>

          {/* Item 2 */}
          <div className="flex items-center gap-2">
            <span className="text-sm" role="img" aria-hidden="true">
              {ANNOUNCEMENTS[1].emoji}
            </span>
            <span>{ANNOUNCEMENTS[1].text}</span>
          </div>

          <span className="text-[#D48B98] opacity-60">•</span>

          {/* Item 3 */}
          <div className="flex items-center gap-2">
            <span className="text-sm" role="img" aria-hidden="true">
              {ANNOUNCEMENTS[2].emoji}
            </span>
            <span>{ANNOUNCEMENTS[2].text}</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
