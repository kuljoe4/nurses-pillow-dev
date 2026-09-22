import React, { useState } from 'react';

export const LOCAL_LOGO_URL = '/nurses-pillow-logo.png';

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
  const [imgFailed, setImgFailed] = useState(false);

  return (
    <div className={`inline-flex items-center gap-2.5 select-none ${className}`}>
      {!imgFailed ? (
        <img
          src={LOCAL_LOGO_URL}
          alt="Nurses Pillow Logo"
          className="shrink-0 object-contain drop-shadow-xs"
          style={{ width: size, height: size }}
          onError={() => setImgFailed(true)}
        />
      ) : (
        /* Official Brand Emblem: Sleeping Blonde Nurse on Fluffy Pillow with Heartbeat & Night Sky */
        <svg
          viewBox="0 0 500 500"
          width={size}
          height={size}
          className="shrink-0 drop-shadow-xs"
          xmlns="http://www.w3.org/2000/svg"
          aria-label="Nurses Pillow Logo"
        >
          <defs>
            <clipPath id="circleBadgeClipInline">
              <circle cx="250" cy="250" r="236" />
            </clipPath>
            <path id="subTextArchInline" d="M 100 375 A 205 205 0 0 0 400 375" fill="none" />
          </defs>

          <g clipPath="url(#circleBadgeClipInline)">
            {/* Crescent Moon & Stars */}
            <g fill="#0E2D58">
              <path d="M 345 92 A 28 28 0 1 0 378 135 A 22 22 0 1 1 345 92 Z" />
              <path d="M 326 80 Q 326 86 322 86 Q 326 86 326 92 Q 326 86 330 86 Q 326 86 326 80 Z" />
              <path d="M 390 144 Q 390 149 386 149 Q 390 149 390 154 Q 390 149 394 149 Q 390 149 390 144 Z" />
            </g>

            {/* Fluffy Pillow */}
            <path
              d="M 175 305 C 185 270, 205 240, 275 190 C 320 155, 360 155, 410 175 C 435 185, 442 210, 430 240 C 408 290, 365 315, 305 325 C 255 333, 200 328, 175 305 Z"
              fill="#FFFFFF"
              stroke="#0E2D58"
              strokeWidth="5.5"
              strokeLinejoin="round"
            />
            <path d="M 285 185 C 330 160, 375 162, 408 178" fill="none" stroke="#0E2D58" strokeWidth="3" strokeLinecap="round" />
            <path d="M 305 323 C 360 315, 405 285, 428 238 C 418 260, 385 295, 325 310 Z" fill="#E8F1FA" />

            {/* Heart with Pulse on Pillow */}
            <g transform="translate(335, 230)" stroke="#0E2D58" strokeLinecap="round" strokeLinejoin="round">
              <path
                d="M 0 -8 C 0 -22, 24 -22, 24 -4 C 24 10, 6 22, 0 28 C -6 22, -24 10, -24 -4 C -24 -22, 0 -22, 0 -8 Z"
                fill="none"
                strokeWidth="4.5"
              />
              <path d="M -28 10 L -12 10 L -7 4 L -2 20 L 5 -5 L 10 16 L 14 10 L 26 10" fill="none" strokeWidth="4" />
            </g>

            {/* Sleeping Nurse Character */}
            <g>
              {/* Scrubs */}
              <path
                d="M 95 255 C 105 235, 128 220, 160 200 C 185 185, 210 215, 215 245 C 218 260, 205 280, 185 290 C 140 295, 105 285, 95 255 Z"
                fill="#143666"
                stroke="#0E2D58"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              {/* Arm & Curled Hand */}
              <path
                d="M 135 260 C 140 290, 155 305, 180 300 C 205 295, 225 275, 222 255 C 205 258, 175 255, 135 260 Z"
                fill="#FDE4CE"
                stroke="#0E2D58"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />
              <path d="M 190 270 C 200 270, 215 265, 218 252 C 218 245, 210 240, 200 245" fill="#FDE4CE" stroke="#0E2D58" strokeWidth="3.5" strokeLinecap="round" />

              {/* Head & Sleeping Expression */}
              <path
                d="M 165 170 C 145 185, 142 215, 158 238 C 178 265, 230 255, 252 225 C 270 200, 260 160, 230 145 C 195 130, 175 145, 165 170 Z"
                fill="#FDE4CE"
                stroke="#0E2D58"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <ellipse cx="215" cy="210" rx="14" ry="7" fill="#F7A8A4" opacity="0.45" />
              {/* Eyes with lashes */}
              <path d="M 198 186 C 205 195, 220 195, 226 186" fill="none" stroke="#0E2D58" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 222 189 L 228 193" stroke="#0E2D58" strokeWidth="3" strokeLinecap="round" />
              <path d="M 248 200 C 255 208, 265 206, 270 199" fill="none" stroke="#0E2D58" strokeWidth="4" strokeLinecap="round" />
              {/* Brow, Nose, Smile */}
              <path d="M 205 170 C 218 168, 232 173, 238 180" fill="none" stroke="#0E2D58" strokeWidth="4" strokeLinecap="round" />
              <path d="M 258 182 C 265 184, 274 190, 277 195" fill="none" stroke="#0E2D58" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 242 195 C 248 198, 250 205, 244 207" fill="none" stroke="#0E2D58" strokeWidth="3.5" strokeLinecap="round" />
              <path d="M 206 212 C 218 226, 234 225, 242 216" fill="none" stroke="#0E2D58" strokeWidth="4.5" strokeLinecap="round" />

              {/* Hair & Top Bun */}
              <path
                d="M 160 160 C 140 145, 135 115, 155 85 C 178 55, 230 50, 265 72 C 295 90, 310 130, 290 170 C 275 160, 260 152, 240 148 C 215 145, 185 148, 160 160 Z"
                fill="#F7CE5E"
                stroke="#0E2D58"
                strokeWidth="5"
                strokeLinejoin="round"
              />
              <ellipse cx="218" cy="75" rx="46" ry="36" fill="#F7CE5E" stroke="#0E2D58" strokeWidth="5" transform="rotate(-8, 218, 75)" />
              <path d="M 195 72 C 205 60, 232 58, 245 70 C 255 80, 245 95, 230 94 C 215 94, 212 85, 222 80" fill="none" stroke="#0E2D58" strokeWidth="4" strokeLinecap="round" />
              <path
                d="M 172 165 C 185 142, 210 132, 240 138 C 265 142, 280 155, 282 172 C 270 165, 255 162, 242 165 C 225 170, 208 178, 195 188 C 188 180, 180 170, 172 165 Z"
                fill="#F7CE5E"
                stroke="#0E2D58"
                strokeWidth="4.5"
                strokeLinejoin="round"
              />

              {/* Stethoscope */}
              <path d="M 170 205 C 165 220, 172 245, 185 260 C 192 268, 202 268, 208 260" fill="none" stroke="#0E2D58" strokeWidth="4.5" strokeLinecap="round" />
              <path d="M 175 225 C 160 240, 158 265, 170 278 C 180 288, 195 285, 205 272" fill="none" stroke="#0E2D58" strokeWidth="4.5" strokeLinecap="round" />
              <circle cx="212" cy="265" r="9" fill="#93B2D2" stroke="#0E2D58" strokeWidth="3.5" />
              <circle cx="212" cy="265" r="4.5" fill="#FFFFFF" />
            </g>

            {/* Bottom Subtitle Arc */}
            <text fontFamily="'Plus Jakarta Sans', Arial, sans-serif" fontWeight="700" fontSize="16" fill="#0E2D58" letterSpacing="2.5">
              <textPath href="#subTextArchInline" startOffset="50%" textAnchor="middle">
                &#8226; Rest Well. Heal Better. &#8226;
              </textPath>
            </text>

            {/* 'Nurses' and 'PILLOW' Typography */}
            <g transform="translate(250, 368)">
              <text x="0" y="0" textAnchor="middle" fontFamily="'Kaushan Script', cursive" fontSize="82" fontWeight="bold" fill="#0E2D58">
                Nurses
              </text>
              <line x1="-165" y1="20" x2="-80" y2="20" stroke="#0E2D58" strokeWidth="3" strokeLinecap="round" />
              <text x="0" y="26" textAnchor="middle" fontFamily="'Plus Jakarta Sans', sans-serif" fontSize="25" fontWeight="800" letterSpacing="11" fill="#0E2D58">
                PILLOW
              </text>
              <line x1="80" y1="20" x2="165" y2="20" stroke="#0E2D58" strokeWidth="3" strokeLinecap="round" />
            </g>
          </g>

          {/* Outer Border */}
          <circle cx="250" cy="250" r="240" fill="none" stroke="#0E2D58" strokeWidth="14" />
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
