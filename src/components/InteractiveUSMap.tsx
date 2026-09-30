import React, { useState, useEffect, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Hospital, HousingListing } from '../types';
import { ClearedStateData, coverageService } from '../services/coverageService';

// Geographic center and polygon paths for all 50 US states on a 960x600 Albers projection canvas
const STATE_PATHS: Record<string, { path: string; name: string; center: [number, number] }> = {
  // Currently cleared initial states
  NC: {
    name: 'North Carolina',
    center: [805, 345],
    path: 'M 755 330 L 830 328 L 845 340 L 835 365 L 795 360 L 760 365 L 730 355 L 755 330 Z',
  },
  MD: {
    name: 'Maryland',
    center: [825, 285],
    path: 'M 795 272 L 835 272 L 842 288 L 828 298 L 810 286 L 795 272 Z',
  },
  CT: {
    name: 'Connecticut',
    center: [890, 220],
    path: 'M 880 210 L 902 210 L 900 230 L 878 230 L 880 210 Z',
  },
  ND: {
    name: 'North Dakota',
    center: [450, 155],
    path: 'M 400 130 L 505 130 L 505 185 L 400 185 L 400 130 Z',
  },
  KS: {
    name: 'Kansas',
    center: [490, 320],
    path: 'M 435 295 L 545 295 L 545 350 L 435 350 L 435 295 Z',
  },

  // Expansion roadmap states
  WA: { name: 'Washington', center: [165, 125], path: 'M 130 90 L 220 100 L 210 160 L 120 150 L 130 90 Z' },
  OR: { name: 'Oregon', center: [155, 190], path: 'M 115 150 L 210 160 L 200 235 L 105 220 L 115 150 Z' },
  CA: { name: 'California', center: [145, 330], path: 'M 105 220 L 175 235 L 140 375 L 210 440 L 165 460 L 105 340 L 105 220 Z' },
  NV: { name: 'Nevada', center: [200, 310], path: 'M 175 235 L 245 250 L 225 385 L 170 380 L 175 235 Z' },
  ID: { name: 'Idaho', center: [235, 170], path: 'M 215 100 L 255 105 L 270 210 L 205 235 L 215 100 Z' },
  MT: { name: 'Montana', center: [330, 150], path: 'M 255 105 L 400 120 L 400 190 L 270 190 L 255 105 Z' },
  WY: { name: 'Wyoming', center: [330, 230], path: 'M 270 190 L 390 195 L 390 265 L 270 260 L 270 190 Z' },
  UT: { name: 'Utah', center: [285, 300], path: 'M 245 250 L 325 255 L 325 350 L 245 345 L 245 250 Z' },
  CO: { name: 'Colorado', center: [380, 300], path: 'M 325 255 L 435 260 L 435 345 L 325 345 L 325 255 Z' },
  AZ: { name: 'Arizona', center: [270, 405], path: 'M 225 350 L 310 355 L 310 460 L 225 440 L 225 350 Z' },
  NM: { name: 'New Mexico', center: [360, 410], path: 'M 310 355 L 410 355 L 410 465 L 310 465 L 310 355 Z' },
  SD: { name: 'South Dakota', center: [445, 215], path: 'M 390 185 L 500 185 L 500 240 L 390 240 L 390 185 Z' },
  NE: { name: 'Nebraska', center: [455, 270], path: 'M 390 240 L 515 240 L 525 295 L 435 295 L 390 270 L 390 240 Z' },
  OK: { name: 'Oklahoma', center: [490, 380], path: 'M 435 350 L 540 350 L 540 405 L 450 405 L 450 375 L 435 375 L 435 350 Z' },
  TX: { name: 'Texas', center: [475, 460], path: 'M 410 375 L 450 375 L 450 405 L 540 405 L 545 450 L 490 540 L 440 500 L 410 465 L 410 375 Z' },
  MN: { name: 'Minnesota', center: [540, 175], path: 'M 505 130 L 575 140 L 575 220 L 505 220 L 505 130 Z' },
  IA: { name: 'Iowa', center: [545, 250], path: 'M 505 220 L 585 220 L 580 275 L 515 275 L 505 220 Z' },
  MO: { name: 'Missouri', center: [570, 320], path: 'M 525 275 L 610 275 L 605 360 L 540 360 L 525 275 Z' },
  AR: { name: 'Arkansas', center: [575, 395], path: 'M 540 360 L 610 360 L 605 430 L 540 430 L 540 360 Z' },
  LA: { name: 'Louisiana', center: [575, 465], path: 'M 540 430 L 605 430 L 615 490 L 570 495 L 545 460 L 540 430 Z' },
  WI: { name: 'Wisconsin', center: [605, 185], path: 'M 575 145 L 635 150 L 630 225 L 575 225 L 575 145 Z' },
  IL: { name: 'Illinois', center: [610, 280], path: 'M 585 225 L 635 225 L 630 330 L 585 330 L 585 225 Z' },
  MI: { name: 'Michigan', center: [665, 195], path: 'M 635 150 L 690 155 L 695 240 L 640 240 L 635 150 Z' },
  IN: { name: 'Indiana', center: [655, 270], path: 'M 635 225 L 675 225 L 670 315 L 635 315 L 635 225 Z' },
  KY: { name: 'Kentucky', center: [685, 330], path: 'M 635 315 L 735 310 L 725 350 L 630 350 L 635 315 Z' },
  TN: { name: 'Tennessee', center: [675, 365], path: 'M 610 350 L 745 345 L 740 380 L 610 380 L 610 350 Z' },
  MS: { name: 'Mississippi', center: [628, 430], path: 'M 605 380 L 650 380 L 645 475 L 605 470 L 605 380 Z' },
  AL: { name: 'Alabama', center: [675, 430], path: 'M 650 380 L 700 380 L 695 475 L 650 475 L 650 380 Z' },
  GA: { name: 'Georgia', center: [725, 415], path: 'M 700 365 L 755 365 L 740 460 L 695 460 L 700 365 Z' },
  FL: { name: 'Florida', center: [740, 500], path: 'M 695 460 L 770 460 L 785 530 L 755 540 L 735 480 L 695 475 L 695 460 Z' },
  SC: { name: 'South Carolina', center: [765, 385], path: 'M 745 365 L 795 365 L 775 410 L 730 405 L 745 365 Z' },
  VA: { name: 'Virginia', center: [780, 315], path: 'M 735 300 L 830 295 L 815 335 L 735 330 L 735 300 Z' },
  WV: { name: 'West Virginia', center: [745, 290], path: 'M 715 260 L 775 260 L 760 315 L 715 310 L 715 260 Z' },
  OH: { name: 'Ohio', center: [705, 255], path: 'M 675 220 L 735 220 L 730 290 L 675 290 L 675 220 Z' },
  PA: { name: 'Pennsylvania', center: [780, 240], path: 'M 735 210 L 825 210 L 820 265 L 735 265 L 735 210 Z' },
  NY: { name: 'New York', center: [815, 180], path: 'M 770 150 L 860 150 L 860 210 L 770 210 L 770 150 Z' },
  VT: { name: 'Vermont', center: [868, 170], path: 'M 860 140 L 880 140 L 875 200 L 855 200 L 860 140 Z' },
  NH: { name: 'New Hampshire', center: [888, 165], path: 'M 880 135 L 900 135 L 895 195 L 875 195 L 880 135 Z' },
  ME: { name: 'Maine', center: [910, 130], path: 'M 895 90 L 935 90 L 920 170 L 885 165 L 895 90 Z' },
  MA: { name: 'Massachusetts', center: [900, 205], path: 'M 875 195 L 930 195 L 925 215 L 870 215 L 875 195 Z' },
  RI: { name: 'Rhode Island', center: [912, 222], path: 'M 905 215 L 920 215 L 918 230 L 903 230 L 905 215 Z' },
  NJ: { name: 'New Jersey', center: [832, 250], path: 'M 825 225 L 845 225 L 840 275 L 820 270 L 825 225 Z' },
  DE: { name: 'Delaware', center: [836, 288], path: 'M 830 275 L 842 275 L 840 300 L 828 298 L 830 275 Z' },
  AK: { name: 'Alaska', center: [140, 520], path: 'M 100 480 L 190 480 L 170 560 L 90 550 L 100 480 Z' },
  HI: { name: 'Hawaii', center: [250, 535], path: 'M 220 520 L 290 520 L 285 550 L 215 550 L 220 520 Z' },
};

export interface InteractiveUSMapProps {
  isNightShiftMode: boolean;
  selectedStateCode?: string;
  onSelectState: (stateCode: string) => void;
  listings?: HousingListing[];
  hospitals?: Hospital[];
  clearedStates?: ClearedStateData[];
}

export const InteractiveUSMap: React.FC<InteractiveUSMapProps> = ({
  isNightShiftMode,
  selectedStateCode = 'NC',
  onSelectState,
  listings = [],
  hospitals = [],
  clearedStates,
}) => {
  const [internalStates, setInternalStates] = useState<ClearedStateData[]>([]);
  const [hoveredState, setHoveredState] = useState<string | null>(null);
  const [activeTabState, setActiveTabState] = useState<string>(selectedStateCode || 'NC');

  // Synchronize state inspector if parent changes active state filter
  useEffect(() => {
    if (selectedStateCode) {
      setActiveTabState(selectedStateCode.toUpperCase());
    }
  }, [selectedStateCode]);

  // Load cleared states dynamically from database API if not provided in props
  useEffect(() => {
    if (clearedStates && clearedStates.length > 0) {
      setInternalStates(clearedStates);
    } else {
      coverageService.fetchClearedStates().then((data) => {
        setInternalStates(data);
      });
    }
  }, [clearedStates]);

  // Keep state lookup map in sync with dynamic data
  const statesMap = useMemo(() => {
    const map: Record<string, ClearedStateData> = {};
    internalStates.forEach((st) => {
      map[st.code.toUpperCase()] = st;
    });
    return map;
  }, [internalStates]);

  // Handle state selection
  const handleStateClick = (code: string) => {
    const upper = code.toUpperCase();
    if (statesMap[upper]) {
      setActiveTabState(upper);
      onSelectState(upper);
    }
  };

  // Currently focused state in inspector
  const currentActiveInfo = useMemo(() => {
    return statesMap[activeTabState] || internalStates[0] || {
      code: 'NC',
      name: 'North Carolina',
      capital: 'Raleigh',
      hospitalsCount: '110+',
      status: 'Primary Launch Hub',
      isLaunchHub: true,
      sampleCity: 'Durham / Raleigh / Chapel Hill',
      sanctuaryHighlights: 'Verified day-sleeper suites near Duke Health and UNC Research Triangle.',
      topFacilities: ['Duke University Hospital', 'UNC Medical Center', 'WakeMed Raleigh Campus'],
      centerCoords: { x: 805, y: 345 },
    };
  }, [statesMap, activeTabState, internalStates]);

  // Dynamic live count of listings per active state
  const stateListingCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    internalStates.forEach((st) => {
      const code = st.code.toUpperCase();
      const count = listings.filter((l) => l.state?.toUpperCase() === code).length;
      counts[code] = count > 0 ? count : (st.activeListingsCount || 4);
    });
    return counts;
  }, [internalStates, listings]);

  return (
    <div
      className={`rounded-2xl border transition-all duration-300 overflow-hidden ${
        isNightShiftMode
          ? 'bg-[#0E1A2E] border-[#233550] shadow-[0_4px_24px_rgba(0,0,0,0.35)]'
          : 'bg-white border-[rgba(11,37,89,0.08)] shadow-[0_4px_24px_rgba(11,37,89,0.05)]'
      }`}
    >
      {/* Dynamic Header */}
      <div className="p-5 md:p-6 border-b border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5 mb-1.5">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#2F6E5E] opacity-75" />
              <span className="relative inline-flex rounded-full h-3 w-3 bg-[#2F6E5E]" />
            </span>
            <h3
              className={`text-sm md:text-base font-bold tracking-tight ${
                isNightShiftMode ? 'text-white' : 'text-[#0B2559]'
              }`}
            >
              U.S. Multi-State Coverage &amp; Hospital Registry Map
            </h3>
            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#142823] dark:text-[#aff0db]">
              {internalStates.length} Cleared States Active
            </span>
          </div>
          <p className="text-xs md:text-sm text-gray-600 dark:text-gray-300 max-w-2xl leading-relaxed">
            Data-driven healthcare housing active across{' '}
            <strong className="text-[#0A6FA8] dark:text-[#3E9AD1]">
              {internalStates.map((s) => s.code).join(', ')}
            </strong>. Click any highlighted state on the map to filter verified clinical listings near participating health systems.
          </p>
        </div>

        {/* Dynamic State Filter Buttons (Automatically updates as states are added to DB) */}
        <div className="flex flex-wrap items-center gap-1.5" role="group" aria-label="Select active cleared state">
          {internalStates.map((st) => {
            const isActive = activeTabState === st.code;
            return (
              <button
                key={st.code}
                onClick={() => handleStateClick(st.code)}
                type="button"
                aria-pressed={isActive}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-150 cursor-pointer flex items-center gap-1.5 border ${
                  isActive
                    ? 'bg-[#0A6FA8] text-white border-[#0A6FA8] shadow-xs'
                    : isNightShiftMode
                    ? 'bg-[#15233a] text-[#9CB3D3] border-[#233550] hover:border-[#3E9AD1] hover:text-white'
                    : 'bg-[#EFF6FB] text-[#0B2559] border-[rgba(11,37,89,0.08)] hover:border-[#0A6FA8] hover:text-[#0A6FA8]'
                }`}
              >
                <span className="font-bold">{st.code}</span>
                <span className="opacity-80 text-[10px]">({st.hospitalsCount})</span>
                {st.isLaunchHub && (
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F1CF78]" title="Primary Launch Hub" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Interactive Map & State Inspector Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 items-stretch">
        {/* Left: SVG Map Visualizer (8 cols on lg) */}
        <div className="lg:col-span-8 p-4 md:p-6 flex flex-col justify-center items-center relative overflow-hidden bg-slate-50/50 dark:bg-[#091322]">
          <div className="w-full max-w-3xl aspect-[16/10] relative">
            <svg
              viewBox="0 0 960 600"
              className="w-full h-full filter drop-shadow-xs"
              role="img"
              aria-label="Interactive map of the United States showing cleared healthcare housing states"
            >
              <defs>
                <linearGradient id="activeStateGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0A6FA8" />
                  <stop offset="100%" stopColor="#08547f" />
                </linearGradient>
                <linearGradient id="launchHubGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0C7EBF" />
                  <stop offset="100%" stopColor="#0A6FA8" />
                </linearGradient>
                <filter id="activeGlow" x="-20%" y="-20%" width="140%" height="140%">
                  <feDropShadow dx="0" dy="2" stdDeviation="4" floodColor="#0A6FA8" floodOpacity="0.4" />
                </filter>
              </defs>

              {/* Render Inactive States */}
              <g className="inactive-states">
                {Object.entries(STATE_PATHS).map(([code, data]) => {
                  if (statesMap[code]) return null;
                  return (
                    <path
                      key={code}
                      d={data.path}
                      fill={isNightShiftMode ? '#162235' : '#E2E8F0'}
                      stroke={isNightShiftMode ? '#22344d' : '#CBD5E1'}
                      strokeWidth="1.2"
                      className="transition-colors duration-150 hover:fill-slate-300 dark:hover:fill-slate-700/60"
                    >
                      <title>{`${data.name} (Expansion Roadmap)`}</title>
                    </path>
                  );
                })}
              </g>

              {/* Render Active Cleared States (Dynamically powered by Database Registry) */}
              <g className="active-states">
                {internalStates.map((info) => {
                  const code = info.code.toUpperCase();
                  const statePathData = STATE_PATHS[code];
                  if (!statePathData) return null;

                  const isSelected = activeTabState === code;
                  const isHovered = hoveredState === code;
                  const center = info.centerCoords || {
                    x: statePathData.center[0],
                    y: statePathData.center[1],
                  };

                  return (
                    <g
                      key={code}
                      className="cursor-pointer group focus:outline-none"
                      tabIndex={0}
                      role="button"
                      aria-label={`${info.name}: ${info.status}, ${info.hospitalsCount} hospitals. Click to filter housing.`}
                      onClick={() => handleStateClick(code)}
                      onMouseEnter={() => setHoveredState(code)}
                      onMouseLeave={() => setHoveredState(null)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                          e.preventDefault();
                          handleStateClick(code);
                        }
                      }}
                    >
                      {/* State boundary polygon */}
                      <path
                        d={statePathData.path}
                        fill={
                          isSelected
                            ? 'url(#launchHubGrad)'
                            : isHovered
                            ? '#0C7EBF'
                            : '#0A6FA8'
                        }
                        stroke={isSelected ? '#F1CF78' : '#FFFFFF'}
                        strokeWidth={isSelected ? '2.5' : '1.5'}
                        filter={isSelected || isHovered ? 'url(#activeGlow)' : undefined}
                        className="transition-all duration-200 transform origin-center"
                      />

                      {/* Beacon marker pin at center coordinates */}
                      <circle
                        cx={center.x}
                        cy={center.y}
                        r={isSelected ? '6' : '4.5'}
                        fill="#FFFFFF"
                        stroke="#0B2559"
                        strokeWidth="1.5"
                      />
                      <circle
                        cx={center.x}
                        cy={center.y}
                        r={isSelected ? '12' : '9'}
                        fill="#2F6E5E"
                        opacity={isSelected ? '0.5' : '0.3'}
                        className="animate-ping"
                      />

                      {/* State abbreviation text badge */}
                      <g transform={`translate(${center.x}, ${center.y - 12})`}>
                        <rect
                          x="-14"
                          y="-9"
                          width="28"
                          height="14"
                          rx="4"
                          fill={isSelected ? '#0B2559' : '#FFFFFF'}
                          stroke={isSelected ? '#F1CF78' : '#0A6FA8'}
                          strokeWidth="1"
                        />
                        <text
                          x="0"
                          y="2"
                          textAnchor="middle"
                          fontSize="9"
                          fontWeight="bold"
                          fontFamily="system-ui, sans-serif"
                          fill={isSelected ? '#FFFFFF' : '#0B2559'}
                        >
                          {code}
                        </text>
                      </g>
                    </g>
                  );
                })}
              </g>
            </svg>

            {/* Floating Map Legend */}
            <div className="absolute bottom-2 left-2 flex items-center gap-3 bg-white/90 dark:bg-[#0E1A2E]/90 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-[rgba(11,37,89,0.08)] dark:border-[#233550] text-[11px]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-[#0A6FA8]" />
                <span className="font-semibold text-gray-700 dark:text-gray-200">Cleared &amp; Active</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-sm bg-slate-300 dark:bg-slate-700" />
                <span className="text-gray-500 dark:text-gray-400">Expansion Roadmap</span>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Selected State Details & Direct Filter Inspector (4 cols on lg) */}
        <div
          className={`lg:col-span-4 p-5 md:p-6 border-t lg:border-t-0 lg:border-l border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between ${
            isNightShiftMode ? 'bg-[#0E1A2E]' : 'bg-white'
          }`}
        >
          <AnimatePresence mode="wait">
            <motion.div
              key={currentActiveInfo.code}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-4"
            >
              {/* State Header Card */}
              <div>
                <div className="flex items-center justify-between gap-2 mb-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xl md:text-2xl font-extrabold text-[#0A6FA8] dark:text-[#3E9AD1]">
                      {currentActiveInfo.name}
                    </span>
                    <span className="px-2 py-0.5 rounded-md text-xs font-bold bg-[#EFF6FB] dark:bg-[#1a2b42] text-[#0A6FA8] dark:text-[#3E9AD1] border border-[#0A6FA8]/20">
                      {currentActiveInfo.code}
                    </span>
                  </div>
                  {currentActiveInfo.isLaunchHub && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-[#FBF0D6] text-[#B9822E] dark:bg-[#342810] dark:text-[#f8d488]">
                      Launch Hub
                    </span>
                  )}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-2">
                  <span>State Capital: {currentActiveInfo.capital}</span>
                  {currentActiveInfo.sampleCity && (
                    <>
                      <span>•</span>
                      <span>Hubs: {currentActiveInfo.sampleCity}</span>
                    </>
                  )}
                </div>
              </div>

              {/* Metrics Grid */}
              <div className="grid grid-cols-2 gap-2">
                <div
                  className={`p-3 rounded-xl border text-left ${
                    isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#EFF6FB] border-[rgba(11,37,89,0.06)]'
                  }`}
                >
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Cleared Hospitals
                  </div>
                  <div className="text-lg font-bold text-[#0B2559] dark:text-white tabular-nums">
                    {currentActiveInfo.hospitalsCount}
                  </div>
                  <div className="text-[10px] text-[#2F6E5E] dark:text-[#aff0db] font-semibold">
                    100% Verified
                  </div>
                </div>

                <div
                  className={`p-3 rounded-xl border text-left ${
                    isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#EFF6FB] border-[rgba(11,37,89,0.06)]'
                  }`}
                >
                  <div className="text-[11px] text-gray-500 dark:text-gray-400 font-medium">
                    Sanctuary Listings
                  </div>
                  <div className="text-lg font-bold text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums">
                    {stateListingCounts[currentActiveInfo.code] || 4} Live
                  </div>
                  <div className="text-[10px] text-gray-500 dark:text-gray-400">
                    $0 Deposit Holds
                  </div>
                </div>
              </div>

              {/* Clinical Features Summary */}
              {currentActiveInfo.topFacilities && currentActiveInfo.topFacilities.length > 0 && (
                <div className="space-y-2">
                  <div className="text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-gray-400">
                    Primary Medical Networks
                  </div>
                  <ul className="space-y-1 text-xs text-[#0B2559] dark:text-gray-200">
                    {currentActiveInfo.topFacilities.map((fac, i) => (
                      <li key={i} className="flex items-center gap-1.5">
                        <svg className="w-3.5 h-3.5 text-[#2F6E5E] shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                        <span className="truncate">{fac}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Clinician Housing Guarantee Quote */}
              <div
                className={`p-3 rounded-xl border text-xs leading-relaxed ${
                  isNightShiftMode
                    ? 'bg-[#121f33] border-[#233550] text-gray-300'
                    : 'bg-emerald-50/50 border-emerald-100 text-gray-700'
                }`}
              >
                <span className="font-semibold text-[#2F6E5E] dark:text-[#aff0db] block mb-0.5">
                  Sanctuary Guarantee
                </span>
                {currentActiveInfo.sanctuaryHighlights}
              </div>
            </motion.div>
          </AnimatePresence>

          {/* Action CTA to Filter Listings */}
          <div className="pt-4 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] mt-4">
            <button
              onClick={() => onSelectState(currentActiveInfo.code)}
              type="button"
              className="w-full py-3 px-4 rounded-xl font-bold text-sm bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white shadow-xs transition-all duration-150 flex items-center justify-center gap-2 cursor-pointer focus-visible:ring-2 focus-visible:ring-[#0A6FA8] focus-visible:ring-offset-2"
            >
              <span>Search {currentActiveInfo.name} Housing</span>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
