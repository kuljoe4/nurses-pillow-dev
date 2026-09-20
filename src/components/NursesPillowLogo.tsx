import React, { useState } from 'react';

export const LOCAL_LOGO_URL = '/nurses-pillow-logo.png';
export const REMOTE_STITCH_LOGO_URL =
  'https://lh3.googleusercontent.com/aida/AEtjO1XWTIq2hs_yfPzNxUJk3eNPi-wDAr9lP_q4xmLagzNfplqTN3GfXlxvNemx-anULZoGvLGc5J96sx2obQM-XQoquNcgbRx9GVEzhs4ZcZX84YvNpH7BQxut8SEDw0DP8DxvFgZxDnoTEY-1DCoVF20oQP-Vn0KZLU6AL96tZiWGd0mUEqEz6DJB4xG_CQqmHrC7Bcllbxn2htAFYYg-QgsPNEOetkUNNp_bEpzJ7TUDbpumw8yFZApBDC5oixRiF-smk38JUdavuw';

interface NursesPillowLogoProps {
  className?: string;
  size?: number;
  showText?: boolean;
  isNightShiftMode?: boolean;
}

export const NursesPillowLogo: React.FC<NursesPillowLogoProps> = ({
  className = 'h-8 w-auto',
  size = 32,
  showText = false,
  isNightShiftMode = false,
}) => {
  const [imgSrc, setImgSrc] = useState<string>(LOCAL_LOGO_URL);
  const [imgFailed, setImgFailed] = useState(false);

  const handleImgError = () => {
    if (imgSrc === LOCAL_LOGO_URL) {
      // Fallback to remote URL
      setImgSrc(REMOTE_STITCH_LOGO_URL);
    } else {
      // Fallback to SVG
      setImgFailed(true);
    }
  };

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {!imgFailed ? (
        <img
          src={imgSrc}
          alt="nurses-pillow-logo.png"
          referrerPolicy="no-referrer"
          className="shrink-0 object-contain drop-shadow-xs"
          style={{ width: size, height: size }}
          onError={handleImgError}
        />
      ) : (
        /* Exact Emblem: Golden Fluffy Sanctuary Pillow with Nurse's Cap & Medical Cross */
        <svg
          viewBox="0 0 160 160"
          width={size}
          height={size}
          className="shrink-0 drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Nurses Pillow Logo"
        >
          <defs>
            <linearGradient id="npEmblemSky" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#EBF4FB" />
              <stop offset="100%" stopColor="#D5E8F8" />
            </linearGradient>

            <linearGradient id="npPillowGold" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFF1B8" />
              <stop offset="45%" stopColor="#F5D276" />
              <stop offset="100%" stopColor="#D4A12B" />
            </linearGradient>

            <linearGradient id="npNurseCap" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#EEF4F8" />
            </linearGradient>

            <filter id="npSoftShadow" x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="3" stdDeviation="3" floodColor="#001848" floodOpacity="0.22" />
            </filter>
          </defs>

          {/* Outer Ring */}
          <circle cx="80" cy="80" r="76" fill="url(#npEmblemSky)" stroke="#005684" strokeWidth="2.5" />
          <circle cx="80" cy="80" r="71" fill="none" stroke="#F1CF78" strokeWidth="1.5" strokeDasharray="3,2" />

          {/* Golden Fluffy Pillow */}
          <g filter="url(#npSoftShadow)">
            <path
              d="M 32 94 
                 C 28 66, 44 52, 80 50 
                 C 116 52, 132 66, 128 94 
                 C 124 118, 108 126, 80 126 
                 C 52 126, 36 118, 32 94 Z"
              fill="url(#npPillowGold)"
              stroke="#B8851B"
              strokeWidth="1.6"
            />
            {/* Pillow Tufts & Creases */}
            <path d="M 32 94 Q 44 91 54 90" stroke="#E5B94E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 128 94 Q 116 91 106 90" stroke="#E5B94E" strokeWidth="1.5" fill="none" strokeLinecap="round" />
            <path d="M 80 50 Q 80 58 80 62" stroke="#E5B94E" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            <path d="M 80 126 Q 80 118 80 114" stroke="#E5B94E" strokeWidth="1.4" fill="none" strokeLinecap="round" />
            
            {/* Center Indentation */}
            <ellipse cx="80" cy="94" rx="8" ry="4" fill="#C59322" opacity="0.4" />

            {/* Resting Nurse's Cap */}
            <g transform="translate(80, 72)">
              {/* Cap Main Shape */}
              <path
                d="M -28 6 
                   C -28 -14, -20 -22, 0 -24 
                   C 20 -24, 28 -14, 28 6 
                   L 32 14 
                   C 20 18, -20 18, -32 14 Z"
                fill="url(#npNurseCap)"
                stroke="#005684"
                strokeWidth="1.4"
                strokeLinejoin="round"
              />
              {/* Cap Fold/Brim */}
              <path
                d="M -32 14 C -18 19, 18 19, 32 14 L 28 10 C 16 13, -16 13, -28 10 Z"
                fill="#D9E6F2"
                stroke="#005684"
                strokeWidth="0.8"
              />
              {/* Medical Cross on Nurse Cap */}
              <rect x="-3" y="-12" width="6" height="18" rx="1.2" fill="#0A6FA8" />
              <rect x="-9" y="-6" width="18" height="6" rx="1.2" fill="#0A6FA8" />
            </g>
          </g>

          {/* Restful Golden Sparkles */}
          <path d="M 124 44 Q 127 44 127 41 Q 127 44 130 44 Q 127 44 127 47 Q 127 44 124 44 Z" fill="#F1CF78" />
          <path d="M 36 52 Q 38 52 38 50 Q 38 52 40 52 Q 38 52 38 54 Q 38 52 36 52 Z" fill="#F1CF78" />
        </svg>
      )}

      {/* Brand Typography */}
      {showText && (
        <div className="flex flex-col text-left">
          <span
            className={`font-bold tracking-tight text-lg leading-tight ${
              isNightShiftMode ? 'text-white' : 'text-[#001848]'
            }`}
          >
            Nurses Pillow
          </span>
          <span
            className="text-[16px] leading-none -mt-0.5 font-normal text-[#745b0d] dark:text-[#E4C36D]"
            style={{ fontFamily: "'Kaushan Script', cursive" }}
          >
            Rest Well. Heal Better.
          </span>
        </div>
      )}
    </div>
  );
};
