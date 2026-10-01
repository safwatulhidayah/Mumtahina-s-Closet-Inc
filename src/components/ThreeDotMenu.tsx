import React, { useState, useRef, useEffect, useCallback, useLayoutEffect } from 'react';
import { createPortal } from 'react-dom';
import { Link } from 'react-router-dom';
import { MoreVertical } from 'lucide-react';

export interface ThreeDotMenuItem {
  id: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  onClick?: () => void;
  to?: string;
  badge?: string;
  isDestructive?: boolean;
}

interface ThreeDotMenuProps {
  id?: string;
  items: ThreeDotMenuItem[];
  buttonClassName?: string;
  ariaLabel?: string;
  buttonSize?: 'xs' | 'sm' | 'md' | 'lg' | 'responsive';
  iconSize?: number;
}

export const ThreeDotMenu: React.FC<ThreeDotMenuProps> = ({
  id = 'three-dot-menu',
  items,
  buttonClassName = '',
  ariaLabel = 'More options',
  buttonSize = 'md',
  iconSize,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [coords, setCoords] = useState<{
    top: number;
    left: number;
    transformOrigin: string;
    maxHeight: number;
  }>({
    top: 0,
    left: 0,
    transformOrigin: 'top right',
    maxHeight: 380,
  });

  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const calculatePosition = useCallback(() => {
    if (!buttonRef.current) return;

    const rect = buttonRef.current.getBoundingClientRect();
    // Use innerWidth and clientWidth to avoid any scrollbar discrepancies
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth;
    const viewportHeight = window.innerHeight || document.documentElement.clientHeight;

    // Actual rendered dimensions or robust fallbacks
    const menuEl = menuRef.current;
    const menuWidth = menuEl ? menuEl.offsetWidth : Math.min(250, viewportWidth - 20);
    const menuHeight = menuEl ? menuEl.scrollHeight : Math.min(items.length * 42 + 16, 380);

    // Safe screen padding margins (keeps dropdown completely inside mobile viewports)
    const margin = 8;

    // Vertical space calculations
    const spaceBelow = viewportHeight - rect.bottom - margin;
    const spaceAbove = rect.top - margin;

    let top: number;
    let openUpward = false;
    let maxHeight: number;

    // If fits below comfortably, open below
    if (spaceBelow >= menuHeight) {
      top = rect.bottom + 6;
      maxHeight = spaceBelow - 6;
      openUpward = false;
    } else if (spaceAbove >= menuHeight) {
      // Otherwise if fits above, open above
      top = rect.top - menuHeight - 6;
      maxHeight = spaceAbove - 6;
      openUpward = true;
    } else {
      // Constrained viewport (e.g. mobile landscape or short screens):
      // Open in direction with more room
      if (spaceBelow >= spaceAbove) {
        top = rect.bottom + 6;
        maxHeight = Math.max(120, spaceBelow - 6);
        openUpward = false;
      } else {
        maxHeight = Math.max(120, spaceAbove - 6);
        top = rect.top - maxHeight - 6;
        openUpward = true;
      }
    }

    // Hard boundary constraints for vertical positioning
    if (top < margin) {
      top = margin;
    }
    if (top + maxHeight > viewportHeight - margin) {
      maxHeight = Math.max(120, viewportHeight - top - margin);
    }

    // Horizontal positioning:
    // If button is in the right half of the screen, align menu right edge to button right edge
    let left: number;
    const buttonCenter = rect.left + rect.width / 2;
    const horizontalOrigin = buttonCenter > viewportWidth / 2 ? 'right' : 'left';

    if (horizontalOrigin === 'right') {
      left = rect.right - menuWidth;
    } else {
      left = rect.left;
    }

    // Strict boundary constraints for horizontal positioning on narrow mobile widths (320px, 360px, 375px, etc.)
    if (left + menuWidth > viewportWidth - margin) {
      left = viewportWidth - menuWidth - margin;
    }
    if (left < margin) {
      left = margin;
    }

    const verticalOrigin = openUpward ? 'bottom' : 'top';

    setCoords({
      top: Math.round(top),
      left: Math.round(left),
      transformOrigin: `${verticalOrigin} ${horizontalOrigin}`,
      maxHeight: Math.max(120, Math.floor(maxHeight)),
    });
  }, [items.length]);

  const toggleMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isOpen) {
      calculatePosition();
      setIsOpen(true);
    } else {
      setIsOpen(false);
    }
  };

  // Re-measure accurately right after opening and mounting into the DOM
  useLayoutEffect(() => {
    if (isOpen) {
      calculatePosition();
    }
  }, [isOpen, calculatePosition]);

  // Handle outside click, escape key, window resize and scroll
  useEffect(() => {
    if (!isOpen) return;

    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (
        menuRef.current &&
        !menuRef.current.contains(target) &&
        buttonRef.current &&
        !buttonRef.current.contains(target)
      ) {
        setIsOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    const handleScrollOrResize = () => {
      calculatePosition();
    };

    document.addEventListener('mousedown', handleOutsideClick, true);
    document.addEventListener('touchstart', handleOutsideClick, true);
    document.addEventListener('keydown', handleKeyDown);
    window.addEventListener('resize', handleScrollOrResize);
    window.addEventListener('scroll', handleScrollOrResize, true);

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick, true);
      document.removeEventListener('touchstart', handleOutsideClick, true);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('resize', handleScrollOrResize);
      window.removeEventListener('scroll', handleScrollOrResize, true);
    };
  }, [isOpen, calculatePosition]);

  const sizeClasses = {
    xs: 'p-1 text-slate-500 hover:text-[#0F1E36]',
    sm: 'p-1.5 text-slate-500 hover:text-[#0F1E36]',
    md: 'p-2 text-[#0F1E36] hover:text-[#2D6A4F]',
    lg: 'p-2.5 text-[#0F1E36] hover:text-[#2D6A4F]',
    responsive: 'p-1 min-[360px]:p-1.5 sm:p-2 text-[#0F1E36] hover:text-[#2D6A4F]',
  };

  const defaultIconSizes: Record<string, number> = {
    xs: 14,
    sm: 16,
    md: 18,
    lg: 20,
    responsive: 18,
  };

  const currentIconSize = iconSize || defaultIconSizes[buttonSize];

  return (
    <div className="relative inline-flex items-center">
      <button
        ref={buttonRef}
        id={id}
        type="button"
        onClick={toggleMenu}
        className={`rounded-full transition-colors focus:outline-hidden cursor-pointer ${
          sizeClasses[buttonSize]
        } ${isOpen ? 'bg-[#FAF0F2] text-[#2D6A4F]' : ''} ${buttonClassName}`}
        aria-label={ariaLabel}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <MoreVertical
          className={`transition-transform duration-150 ${buttonSize === 'responsive' ? 'w-4.5 h-4.5 sm:w-5 sm:h-5' : ''}`}
          style={buttonSize !== 'responsive' ? { width: currentIconSize, height: currentIconSize } : undefined}
        />
      </button>

      {isOpen &&
        createPortal(
          <>
            {/* Invisible backdrop overlay to capture mobile taps outside cleanly */}
            <div
              className="fixed inset-0 z-[99998] bg-transparent"
              onClick={() => setIsOpen(false)}
              onTouchStart={() => setIsOpen(false)}
              aria-hidden="true"
            />

            {/* Dropdown Container positioned in fixed screen coordinates */}
            <div
              ref={menuRef}
              id={`${id}-dropdown`}
              role="menu"
              aria-orientation="vertical"
              style={{
                position: 'fixed',
                top: `${coords.top}px`,
                left: `${coords.left}px`,
                maxHeight: `${coords.maxHeight}px`,
                transformOrigin: coords.transformOrigin,
              }}
              className="z-[99999] min-w-[210px] sm:min-w-[240px] max-w-[calc(100vw-16px)] bg-white rounded-2xl shadow-2xl border border-[#F0E4E6] py-1.5 overflow-y-auto animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xs select-none"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="space-y-0.5 px-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const content = (
                    <>
                      <div className="flex items-center gap-2.5 min-w-0 pr-2">
                        {Icon && (
                          <Icon
                            className={`w-4 h-4 flex-shrink-0 ${
                              item.isDestructive
                                ? 'text-rose-500'
                                : 'text-[#2D6A4F] group-hover:text-[#1B4332]'
                            }`}
                          />
                        )}
                        <span className="whitespace-nowrap text-xs font-medium text-[#0F1E36] group-hover:text-[#2D6A4F]">
                          {item.label}
                        </span>
                      </div>
                      {item.badge && (
                        <span className="ml-auto flex-shrink-0 text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[#FAF0F2] text-[#2D6A4F] border border-[#F4D3D7]/60">
                          {item.badge}
                        </span>
                      )}
                    </>
                  );

                  const itemClass = `group w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors cursor-pointer ${
                    item.isDestructive
                      ? 'text-rose-600 hover:bg-rose-50'
                      : 'text-[#0F1E36] hover:bg-[#FAF7F6] hover:text-[#2D6A4F]'
                  }`;

                  if (item.to) {
                    return (
                      <Link
                        key={item.id}
                        id={`${id}-item-${item.id}`}
                        to={item.to}
                        onClick={() => {
                          if (item.onClick) item.onClick();
                          setIsOpen(false);
                        }}
                        className={itemClass}
                        role="menuitem"
                      >
                        {content}
                      </Link>
                    );
                  }

                  return (
                    <button
                      key={item.id}
                      id={`${id}-item-${item.id}`}
                      type="button"
                      onClick={() => {
                        if (item.onClick) item.onClick();
                        setIsOpen(false);
                      }}
                      className={itemClass}
                      role="menuitem"
                    >
                      {content}
                    </button>
                  );
                })}
              </div>
            </div>
          </>,
          document.body
        )}
    </div>
  );
};
