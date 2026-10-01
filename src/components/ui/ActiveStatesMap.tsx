import React from 'react';

export const ActiveStatesMap: React.FC<{
  className?: string;
  isNightShiftMode?: boolean;
}> = ({ className = '', isNightShiftMode = false }) => {
  return (
    <div className={`relative ${className}`}>
      {/* A simplified SVG representation of the US */}
      <svg
        viewBox="0 0 959 593"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-auto drop-shadow-sm"
      >
        <g stroke={isNightShiftMode ? '#233550' : '#ffffff'} strokeWidth="1" strokeLinejoin="round">
          {/* Base inactive map paths (simplified for example) */}
          <path d="M0 0 H959 V593 H0 Z" fill="transparent" />

          {/* Dummy paths for active states. In a real app these would be accurate paths */}
          {/* NC */}
          <path
            id="US-NC"
            d="M750 350 L800 340 L820 360 L780 380 Z"
            fill={isNightShiftMode ? '#3E9AD1' : '#0A6FA8'}
            className="transition-colors hover:fill-[#2F6E5E] cursor-pointer"
          >
            <title>North Carolina</title>
          </path>
          {/* MD */}
          <path
            id="US-MD"
            d="M830 250 L850 240 L860 260 L830 270 Z"
            fill={isNightShiftMode ? '#3E9AD1' : '#0A6FA8'}
            className="transition-colors hover:fill-[#2F6E5E] cursor-pointer"
          >
            <title>Maryland</title>
          </path>
          {/* CT */}
          <path
            id="US-CT"
            d="M870 180 L890 180 L885 195 L865 195 Z"
            fill={isNightShiftMode ? '#3E9AD1' : '#0A6FA8'}
            className="transition-colors hover:fill-[#2F6E5E] cursor-pointer"
          >
            <title>Connecticut</title>
          </path>
          {/* ND */}
          <path
            id="US-ND"
            d="M450 100 L550 100 L550 150 L450 150 Z"
            fill={isNightShiftMode ? '#3E9AD1' : '#0A6FA8'}
            className="transition-colors hover:fill-[#2F6E5E] cursor-pointer"
          >
            <title>North Dakota</title>
          </path>
          {/* KS */}
          <path
            id="US-KS"
            d="M420 280 L520 280 L520 330 L420 330 Z"
            fill={isNightShiftMode ? '#3E9AD1' : '#0A6FA8'}
            className="transition-colors hover:fill-[#2F6E5E] cursor-pointer"
          >
            <title>Kansas</title>
          </path>

          {/* Placeholder for remaining states */}
          <path
            d="M100 100 L400 100 L400 400 L100 400 Z"
            fill={isNightShiftMode ? '#1A273D' : '#E2E8F0'}
          />

        </g>
      </svg>
    </div>
  );
};
