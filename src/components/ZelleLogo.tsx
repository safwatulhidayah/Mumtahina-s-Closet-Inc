import React from 'react';

interface ZelleLogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'full' | 'icon-only' | 'badge';
}

export const ZelleLogo: React.FC<ZelleLogoProps> = ({
  className = '',
  size = 'md',
  variant = 'full',
}) => {
  const sizeClasses = {
    sm: 'h-4',
    md: 'h-6',
    lg: 'h-8',
  };

  // Official Zelle Purple: #7414CA
  if (variant === 'icon-only') {
    return (
      <svg
        viewBox="0 0 48 48"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={`${sizeClasses[size]} w-auto aspect-square inline-block ${className}`}
        aria-label="Zelle icon"
      >
        <rect width="48" height="48" rx="12" fill="#7414CA" />
        {/* Top vertical bar */}
        <rect x="22" y="8" width="4" height="7" rx="2" fill="#FFFFFF" />
        {/* Z shape */}
        <path
          d="M13 18.5H33C34.1 18.5 34.7 19.8 33.9 20.6L16.2 37.5H35"
          stroke="#FFFFFF"
          strokeWidth="4"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Bottom vertical bar */}
        <rect x="22" y="33" width="4" height="7" rx="2" fill="#FFFFFF" />
      </svg>
    );
  }

  if (variant === 'badge') {
    return (
      <span
        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-[#7414CA]/10 text-[#7414CA] font-bold text-xs border border-[#7414CA]/20 ${className}`}
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-3.5 h-3.5"
          aria-hidden="true"
        >
          <rect width="24" height="24" rx="6" fill="#7414CA" />
          <rect x="11" y="4" width="2" height="3.5" rx="1" fill="#FFFFFF" />
          <path
            d="M6.5 9.5H16.5C17.2 9.5 17.5 10.3 17 10.8L8.2 19H17.5"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="11" y="16.5" width="2" height="3.5" rx="1" fill="#FFFFFF" />
        </svg>
        <span>zelle</span>
      </span>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 select-none ${className}`}>
      {/* Zelle Emblem */}
      <div className="flex-shrink-0 w-7 h-7 rounded-xl bg-[#7414CA] flex items-center justify-center shadow-xs">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="w-4 h-4"
          aria-hidden="true"
        >
          <rect x="11" y="3" width="2" height="4" rx="1" fill="#FFFFFF" />
          <path
            d="M6.5 9.5H16.5C17.2 9.5 17.5 10.3 17 10.8L8.2 19H17.5"
            stroke="#FFFFFF"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <rect x="11" y="17" width="2" height="4" rx="1" fill="#FFFFFF" />
        </svg>
      </div>
      <span className="font-sans font-extrabold text-[#7414CA] tracking-tight text-lg leading-none">
        zelle
      </span>
    </div>
  );
};
