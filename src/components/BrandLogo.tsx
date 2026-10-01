import React from 'react';

export const BRAND_LOGO_URL = 'https://cdn.phototourl.com/member/2026-10-01-789bb7f3-d869-4d91-bd6e-8da384a162c6.jpg';

interface BrandLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  variant?: 'full' | 'compact' | 'monogram';
  showText?: boolean;
  onClick?: () => void;
}

export const BrandLogo: React.FC<BrandLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
  showText = true,
  onClick,
}) => {
  // Sizing tokens for the logo image preserving 1:1 aspect ratio
  // Designed to stay crisp, fully visible, and fit on narrow mobile screens (down to 320px) without overflow
  const imageSizes = {
    sm: 'w-8 h-8 sm:w-9 sm:h-9',
    md: 'w-8 h-8 min-[360px]:w-9 min-[360px]:h-9 sm:w-11 sm:h-11 md:w-12 md:h-12',
    lg: 'w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16',
    xl: 'w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24',
  };

  const titleSizes = {
    sm: 'text-xs sm:text-sm',
    md: 'text-[13px] min-[360px]:text-sm sm:text-base md:text-lg',
    lg: 'text-base sm:text-xl md:text-2xl',
    xl: 'text-xl sm:text-2xl md:text-3xl',
  };

  return (
    <div
      id="brand-logo-container"
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 min-[360px]:gap-2 sm:gap-2.5 select-none cursor-pointer group min-w-0 ${className}`}
      role="banner"
      aria-label="Mumtahina’s Closet Inc Logo"
    >
      {/* Brand Logo Image with rounded container, preservation of aspect ratio, and subtle border */}
      <div
        className={`${imageSizes[size]} relative flex items-center justify-center rounded-xl overflow-hidden bg-[#FFE3E7] border border-[#F4D3D7] shadow-xs group-hover:border-[#2D6A4F] transition-colors duration-300 flex-shrink-0`}
      >
        <img
          src={BRAND_LOGO_URL}
          alt="Mumtahina’s Closet Inc Logo"
          className="w-full h-full object-contain object-center transform transition-transform duration-300 group-hover:scale-105"
          loading="eager"
          decoding="async"
        />
      </div>

      {/* Brand Typography */}
      {showText && variant !== 'monogram' && (
        <div className="flex flex-col text-left leading-tight min-w-0">
          <div className="flex items-center gap-1 sm:gap-1.5 min-w-0">
            <span
              className={`font-serif font-bold tracking-tight text-[#0F1E36] group-hover:text-[#2D6A4F] transition-colors whitespace-nowrap ${titleSizes[size]}`}
            >
              <span>Mumtahina’s</span>
              <span className="hidden min-[420px]:inline"> Closet</span>
            </span>
            <span className="hidden min-[480px]:inline text-[9px] sm:text-[10px] font-semibold uppercase tracking-wider text-[#2D6A4F] bg-[#EBF5F0] px-1 sm:px-1.5 py-0.5 rounded">
              Inc
            </span>
          </div>
          {variant === 'full' && (
            <span className="hidden sm:block text-[10px] sm:text-[11px] font-medium tracking-[0.16em] uppercase text-[#64748B] whitespace-nowrap">
              Modest & Elegant Apparel
            </span>
          )}
        </div>
      )}
    </div>
  );
};
