import React, { useState } from 'react';

export const REMOTE_STITCH_LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1XWTIq2hs_yfPzNxUJk3eNPi-wDAr9lP_q4xmLagzNfplqTN3GfXlxvNemx-anULZoGvLGc5J96sx2obQM-XQoquNcgbRx9GVEzhs4ZcZX84YvNpH7BQxut8SEDw0DP8DxvFgZxDnoTEY-1DCoVF20oQP-Vn0KZLU6AL96tZiWGd0mUEqEz6DJB4xG_CQqmHrC7Bcllbxn2htAFYYg-QgsPNEOetkUNNp_bEpzJ7TUDbpumw8yFZApBDC5oixRiF-smk38JUdavuw';

interface NursesPillowLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  isNightShiftMode?: boolean;
}

export const NursesPillowLogo: React.FC<NursesPillowLogoProps> = ({
  className = 'h-9 w-auto',
  size = 36,
  showText = false,
  isNightShiftMode = false,
}) => {
  const [useVectorFallback, setUseVectorFallback] = useState(false);

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {!useVectorFallback ? (
        <img
          src={REMOTE_STITCH_LOGO_URL}
          alt="Nurses Pillow Logo"
          referrerPolicy="no-referrer"
          className="shrink-0 object-contain drop-shadow-xs"
          style={{ width: size, height: size }}
          onError={() => setUseVectorFallback(true)}
        />
      ) : (
        /* Vector Emblem: Plush Healthcare Sanctuary Pillow with Clinical Cross */
        <svg
          viewBox="0 0 160 160"
          width={size}
          height={size}
          className="shrink-0 drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Nurses Pillow Logo"
        >
          <defs>
            <linearGradient id="npBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EFF6FB" />
              <stop offset="100%" stopColor="#D5E8F8" />
            </linearGradient>

            <linearGradient id="npPillowGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="60%" stopColor="#FDF8EC" />
              <stop offset="100%" stopColor="#F7E6B8" />
            </linearGradient>

            <linearGradient id="npCrossGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#0A6FA8" />
              <stop offset="100%" stopColor="#005684" />
            </linearGradient>
          </defs>

          {/* Outer Circular Ring */}
          <circle cx="80" cy="80" r="76" fill="url(#npBgGrad)" stroke="#005684" strokeWidth="2.5" />
          <circle cx="80" cy="80" r="71" fill="none" stroke="#F1CF78" strokeWidth="1.5" strokeDasharray="3,2" />

          {/* Plush Diamond-Contoured Pillow */}
          <path
            d="M 80 34 C 106 34, 126 54, 134 76 C 126 98, 106 122, 80 124 C 54 122, 34 98, 26 76 C 34 54, 54 34, 80 34 Z"
            fill="url(#npPillowGrad)"
            stroke="#C89729"
            strokeWidth="1.5"
          />

          {/* Corner Stitch Accents */}
          <path d="M 26 76 Q 38 74 46 76" stroke="#D4A738" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M 134 76 Q 122 74 114 76" stroke="#D4A738" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M 80 34 Q 80 44 80 50" stroke="#D4A738" strokeWidth="1.4" fill="none" strokeLinecap="round" />
          <path d="M 80 124 Q 80 114 80 108" stroke="#D4A738" strokeWidth="1.4" fill="none" strokeLinecap="round" />

          {/* Clinical Medical Cross */}
          <g transform="translate(80, 76)">
            <rect x="-7" y="-21" width="14" height="42" rx="4" fill="url(#npCrossGrad)" />
            <rect x="-21" y="-7" width="42" height="14" rx="4" fill="url(#npCrossGrad)" />
            <circle cx="0" cy="0" r="4.5" fill="#F1CF78" />
          </g>

          {/* Crescent Accent */}
          <path d="M 116 40 A 10 10 0 0 0 108 52 A 11 11 0 0 1 116 40 Z" fill="#F1CF78" />
        </svg>
      )}

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-bold tracking-tight leading-none text-lg ${
              isNightShiftMode ? 'text-white' : 'text-[#001848]'
            }`}
          >
            Nurses Pillow
          </span>
          <span className="font-cursive text-sm text-[#0a6fa8] dark:text-[#3E9AD1] -mt-0.5">
            Rest Well. Heal Better.
          </span>
        </div>
      )}
    </div>
  );
};
