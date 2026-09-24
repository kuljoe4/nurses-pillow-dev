import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HousingListing } from '../types';
import { MOCK_LISTINGS, VERIFIED_HOSPITAL_HUBS } from '../data/mockData';
import { db } from '../services/database';
import { ListingDetailModal } from './ListingDetailModal';
import { HealthcareAmenitiesFilterModal } from './HealthcareAmenitiesFilterModal';
import { SearchListingsSkeleton } from './skeletons/SearchListingsSkeleton';
import { PillowSaveButton } from './PillowSaveButton';
import { SearchListingCard } from './SearchListingCard';
import { GoogleMapsSplitView } from './GoogleMapsSplitView';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';

interface SearchListingsViewProps {
  isNightShiftMode: boolean;
  savedListingIds: string[];
  onToggleSave: (id: string) => void;
  isVerified: boolean;
  onGoToVerification: () => void;
  onRequestToBookListing?: (listing: HousingListing) => void;
  initialHospital?: string;
  initialDuration?: string;
  initialRadius?: number;
  isLoading?: boolean;
  m2BypassMode?: boolean;
  onToggleM2Bypass?: () => void;
  isDeveloper?: boolean;
}

export const SearchListingsView: React.FC<SearchListingsViewProps> = ({
  isNightShiftMode,
  savedListingIds,
  onToggleSave,
  isVerified,
  onGoToVerification,
  onRequestToBookListing,
  initialHospital = 'Duke University Hospital (Durham, NC)',
  initialDuration = '13',
  initialRadius = 5,
  isLoading,
  m2BypassMode = false,
  onToggleM2Bypass,
  isDeveloper = false,
}) => {


  const [selectedHospital, setSelectedHospital] = useState(initialHospital);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState('');
  const [commuteBuffer, setCommuteBuffer] = useState<number>(initialRadius);
  const isInitialCustom = !['4', '8', '13', '26'].includes(initialDuration);
  const [selectedDuration, setSelectedDuration] = useState(isInitialCustom ? 'custom' : initialDuration);
  const [customDuration, setCustomDuration] = useState<number>(isInitialCustom ? parseInt(initialDuration) : 1);
  const [earliestCheckIn, setEarliestCheckIn] = useState('Oct 1, 2024');
  const [activeDetailListing, setActiveDetailListing] = useState<HousingListing | null>(null);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'split-map' | 'grid'>('split-map');
  const [sortOption, setSortOption] = useState<'closest' | 'price_low' | 'quiet_score'>('closest');
  const [activeFilterChip, setActiveFilterChip] = useState<'all' | 'entire' | 'private' | 'blackout' | 'laundry' | 'parking'>('all');
  const [commuteMode, setCommuteMode] = useState<'transit' | 'drive'>('transit');
  const [selectedMapListingId, setSelectedMapListingId] = useState<string>('nc-duke-condo');
  const [mapZoom, setMapZoom] = useState(1);
  const [mapNotification, setMapNotification] = useState<string | null>(null);
  const [isGsaModalOpen, setIsGsaModalOpen] = useState(false);
useBodyScrollLock(isGsaModalOpen);

  const handleSelectOnMap = useCallback((id: string) => {
    setSelectedMapListingId(id);
  }, []);

  const handleViewDetails = useCallback((listing: HousingListing) => {
    setActiveDetailListing(listing);
  }, []);

  const [activeAmenityCount, setActiveAmenityCount] = useState(4);
  const [internalLoading, setInternalLoading] = useState(true);

  // Progressive disclosure for assignment details (dates, duration, radius buffer)
  const [isAssignmentDrawerExpanded, setIsAssignmentDrawerExpanded] = useState(false);

  // Filter Panel Expansion & Criteria (Smooth Height Transitions)
  const [isFilterPanelExpanded, setIsFilterPanelExpanded] = useState(false);
  const [maxPrice, setMaxPrice] = useState<number>(3500);
  const [minRating, setMinRating] = useState<number>(0);
  const [filterBlackout, setFilterBlackout] = useState(false);
  const [filterScrubWasher, setFilterScrubWasher] = useState(false);
  const [filterQuietDay, setFilterQuietDay] = useState(false);
  const [filterSoundMachine, setFilterSoundMachine] = useState(false);
  const [filterDedicatedParking, setFilterDedicatedParking] = useState(false);
  const [filterPetFriendly, setFilterPetFriendly] = useState(false);
  const [filterContractFlex, setFilterContractFlex] = useState(false);

  // Reset all filters to default baseline
  const handleResetAllFilters = useCallback(() => {
    setActiveFilterChip('all');
    setMaxPrice(3500);
    setMinRating(0);
    setFilterBlackout(false);
    setFilterScrubWasher(false);
    setFilterQuietDay(false);
    setFilterSoundMachine(false);
    setFilterDedicatedParking(false);
    setFilterPetFriendly(false);
    setFilterContractFlex(false);
    setCommuteBuffer(initialRadius);
  }, [initialRadius]);

  // Active filter count for badge indicator
  const activePanelFilterCount = useMemo(() => {
    let count = 0;
    if (activeFilterChip !== 'all') count++;
    if (maxPrice < 3500) count++;
    if (minRating > 0) count++;
    if (filterBlackout) count++;
    if (filterScrubWasher) count++;
    if (filterQuietDay) count++;
    if (filterSoundMachine) count++;
    if (filterDedicatedParking) count++;
    if (filterPetFriendly) count++;
    if (filterContractFlex) count++;
    return count;
  }, [
    activeFilterChip,
    maxPrice,
    minRating,
    filterBlackout,
    filterScrubWasher,
    filterQuietDay,
    filterSoundMachine,
    filterDedicatedParking,
    filterPetFriendly,
    filterContractFlex,
  ]);

  // Initial simulated load for realistic clinical data fetching feedback
  useEffect(() => {
    const timer = setTimeout(() => {
      setInternalLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  // Re-trigger brief skeleton transition when hospital or key search criteria change
  const prevFilterRef = useRef({ selectedHospital, commuteBuffer, selectedDuration });
  useEffect(() => {
    if (
      prevFilterRef.current.selectedHospital !== selectedHospital ||
      prevFilterRef.current.commuteBuffer !== commuteBuffer ||
      prevFilterRef.current.selectedDuration !== selectedDuration
    ) {
      prevFilterRef.current = { selectedHospital, commuteBuffer, selectedDuration };
      setInternalLoading(true);
      const timer = setTimeout(() => {
        setInternalLoading(false);
      }, 450);
      return () => clearTimeout(timer);
    }
  }, [selectedHospital, commuteBuffer, selectedDuration]);

  const isDataLoading = isLoading !== undefined ? isLoading : internalLoading;

  const triggerLiveQueryRefresh = () => {
    setInternalLoading(true);
    setTimeout(() => {
      setInternalLoading(false);
    }, 600);
  };

  const hospitalDropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (hospitalDropdownRef.current && !hospitalDropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsDropdownOpen(false);
        setIsGsaModalOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  const durationOptions = [
    { label: '4 wks', value: '4' },
    { label: '8 wks', value: '8' },
    { label: '13 wks', value: '13' },
    { label: '26 wks', value: '26' },
    { label: 'Custom', value: 'custom' },
  ];

  const commuteOptions = [
    { miles: 3, label: '3 mi', desc: 'Shift walk/bike' },
    { miles: 5, label: '5 mi', desc: 'Quick commute' },
    { miles: 10, label: '10 mi', desc: 'Suburban retreat' },
    { miles: 15, label: '15 mi', desc: 'Max value radius' },
  ];

  const popularHubs = VERIFIED_HOSPITAL_HUBS;

  const filteredHospitals = useMemo(() => {
    if (!hospitalSearchQuery.trim()) return popularHubs;
    const q = hospitalSearchQuery.toLowerCase();
    return popularHubs.filter((h) => h.toLowerCase().includes(q));
  }, [hospitalSearchQuery, popularHubs]);

  // Filter listings based on current settings
  const filteredListings = useMemo(() => {
    // In a real app we would receive real properties from App via context/props.
    // For now we map to the existing mock to preserve the component.
    let dbListings = db.getListings() || [];
    let list = dbListings.length > 0 ? dbListings : [...MOCK_LISTINGS];

    // Filter by quick chip
    if (activeFilterChip === 'entire') {
      list = list.filter((l: any) => l.propertyType?.toLowerCase().includes('entire') || l.propertyType?.toLowerCase().includes('condo'));
    } else if (activeFilterChip === 'private') {
      list = list.filter((l: any) => l.propertyType?.toLowerCase().includes('room') || l.propertyType?.toLowerCase().includes('suite') || l.propertyType?.toLowerCase().includes('studio'));
    } else if (activeFilterChip === 'blackout') {
      list = list.filter((l: any) => l.highlightBadges?.some((b: any) => b.toLowerCase().includes('blackout')) || l.amenities?.blackoutCurtains);
    } else if (activeFilterChip === 'laundry') {
      list = list.filter((l: any) => l.highlightBadges?.some((b: any) => b.toLowerCase().includes('washer') || b.toLowerCase().includes('laundry')) || l.amenities?.washerDryerInUnit);
    } else if (activeFilterChip === 'parking') {
      list = list.filter((l: any) => l.highlightBadges?.some((b: any) => b.toLowerCase().includes('parking')) || l.amenities?.dedicatedParking);
    }

    // Extended filter criteria from panel
    if (maxPrice < 3500) {
      list = list.filter((l: any) => l.monthlyRate <= maxPrice);
    }
    if (minRating > 0) {
      list = list.filter((l: any) => l.nurseRating >= minRating);
    }
    if (filterBlackout) {
      list = list.filter((l: any) => l.amenities?.blackoutCurtains || l.highlightBadges?.some((b: any) => b.toLowerCase().includes('blackout')));
    }
    if (filterScrubWasher) {
      list = list.filter((l: any) => l.amenities?.washerDryerInUnit || l.highlightBadges?.some((b: any) => b.toLowerCase().includes('washer') || b.toLowerCase().includes('laundry')));
    }
    if (filterQuietDay) {
      list = list.filter((l: any) => l.amenities?.daySleeperQuietHours || l.highlightBadges?.some((b: any) => b.toLowerCase().includes('quiet')));
    }
    if (filterSoundMachine) {
      list = list.filter((l: any) => l.amenities?.whiteNoiseMachine);
    }
    if (filterDedicatedParking) {
      list = list.filter((l: any) => l.amenities?.dedicatedParking || l.highlightBadges?.some((b: any) => b.toLowerCase().includes('parking')));
    }
    if (filterPetFriendly) {
      list = list.filter((l: any) => l.amenities?.petFriendly);
    }
    if (filterContractFlex) {
      list = list.filter((l: any) => l.contractFlexProtection);
    }

    // Sort listings
    if (sortOption === 'closest') {
      list.sort((a: any, b: any) => a.driveTimeMinutes - b.driveTimeMinutes);
    } else if (sortOption === 'price_low') {
      list.sort((a: any, b: any) => a.monthlyRate - b.monthlyRate);
    } else if (sortOption === 'quiet_score') {
      list.sort((a: any, b: any) => b.nurseRating - a.nurseRating);
    }

    return list;
  }, [
    activeFilterChip,
    sortOption,
    maxPrice,
    minRating,
    filterBlackout,
    filterScrubWasher,
    filterQuietDay,
    filterSoundMachine,
    filterDedicatedParking,
    filterPetFriendly,
    filterContractFlex,
  ]);

  const selectedMapListing = useMemo(() => {
    return MOCK_LISTINGS.find((l: any) => l.id === selectedMapListingId) || filteredListings[0] || MOCK_LISTINGS[0];
  }, [selectedMapListingId, filteredListings]);

  return (
    <div className={`w-full min-h-screen transition-colors ${isNightShiftMode ? 'bg-[#08101C] text-[#E6ECF7]' : 'bg-[#faf8ff] text-[#001848]'}`}>
      {/* 1. COMPACT CLINICAL SEARCH & ASSIGNMENT HUB */}
      <section className="w-full bg-white dark:bg-[#111e33] border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-xs px-3 sm:px-6 lg:px-8 py-2.5">
        <div className="max-w-7xl mx-auto flex flex-col gap-2">
          {/* Main Controls Row: Single Compact Responsive Bar */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-2 sm:gap-2.5">
            {/* Hospital Selector (Primary Clinical Anchor) */}
            <div ref={hospitalDropdownRef} className="relative flex-1 min-w-[220px] sm:min-w-[260px]">
              <div
                onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                className="w-full h-10 px-3 rounded-xl bg-[#EFF6FB] dark:bg-[#182840] border border-transparent hover:border-[#0A6FA8]/30 dark:hover:border-[#3E9AD1]/40 transition-colors flex items-center justify-between cursor-pointer group"
                role="button"
                tabIndex={0}
                aria-expanded={isDropdownOpen}
                aria-label="Select assigned hospital campus"
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setIsDropdownOpen(!isDropdownOpen);
                  }
                }}
              >
                <div className="flex items-center gap-2 min-w-0">
                  <span className="material-symbols-outlined text-[#0A6FA8] dark:text-[#3E9AD1] text-[18px] shrink-0">
                    local_hospital
                  </span>
                  <span className="text-xs sm:text-sm font-semibold text-[#0B2559] dark:text-white truncate">
                    {selectedHospital}
                  </span>
                </div>
                <span className="material-symbols-outlined text-[#404850] dark:text-[#93ccff] text-[18px] shrink-0 transition-transform duration-200 group-hover:text-[#0A6FA8]">
                  {isDropdownOpen ? 'expand_less' : 'expand_more'}
                </span>
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#15233a] rounded-xl shadow-xl z-50 border border-[#c0c7d1]/40 dark:border-[#2b4162] overflow-hidden flex flex-col max-w-lg"
                  >
                    {/* Quick search input */}
                    <div className="p-2 border-b border-[#c0c7d1]/20 dark:border-[#2b4162] bg-[#f8faff] dark:bg-[#111e33]">
                      <div className="relative">
                        <span className="material-symbols-outlined absolute left-2 top-1/2 -translate-y-1/2 text-gray-400 text-[16px]">
                          search
                        </span>
                        <input
                          type="text"
                          value={hospitalSearchQuery}
                          onChange={(e) => setHospitalSearchQuery(e.target.value)}
                          placeholder="Search or scroll campuses..."
                          className="w-full pl-7 pr-2.5 py-1 text-xs rounded-lg bg-white dark:bg-[#182840] border border-gray-200 dark:border-[#233550] text-[#001848] dark:text-white focus:outline-none focus:ring-1 focus:ring-[#005684]"
                          autoFocus
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    </div>

                    {/* Scrollable list container */}
                    <div
                      className="max-h-60 overflow-y-auto custom-scrollbar py-1"
                      style={{ WebkitOverflowScrolling: 'touch' }}
                      onWheel={(e) => e.stopPropagation()}
                    >
                      {filteredHospitals.length === 0 ? (
                        <div className="px-3 py-4 text-center text-xs text-gray-500 dark:text-gray-400">
                          No hospital matches "{hospitalSearchQuery}".
                        </div>
                      ) : (
                        filteredHospitals.map((hosp) => (
                          <div
                            key={hosp}
                            onClick={() => {
                              setSelectedHospital(hosp);
                              setIsDropdownOpen(false);
                              setHospitalSearchQuery('');
                            }}
                            className={`px-3 py-2 text-xs font-semibold hover:bg-[#f2f3ff] dark:hover:bg-[#1f3350] cursor-pointer flex items-center justify-between transition-colors ${
                              selectedHospital === hosp ? 'bg-[#eaedff] dark:bg-[#1f3350] text-[#005684]' : 'text-[#001848] dark:text-white'
                            }`}
                          >
                            <span className="truncate pr-2">{hosp}</span>
                            {selectedHospital === hosp ? (
                              <span className="material-symbols-outlined text-[14px] text-[#195b4c] shrink-0">check</span>
                            ) : (
                              <span className="text-[9px] text-gray-400 dark:text-gray-500 font-mono shrink-0">Verified</span>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    {/* Scroll indicator footer */}
                    <div className="px-2.5 py-1 bg-[#f8faff] dark:bg-[#111e33] border-t border-[#c0c7d1]/20 dark:border-[#2b4162] flex items-center justify-between text-[10px] text-[#404850] dark:text-[#9CB3D3]">
                      <span>{filteredHospitals.length} campuses</span>
                      <span className="flex items-center gap-0.5">
                        <span className="material-symbols-outlined text-[13px]">swap_vert</span>
                        Scroll to explore
                      </span>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Assignment Details Trigger (Progressive Disclosure) */}
            <button
              type="button"
              onClick={() => {
                setIsAssignmentDrawerExpanded((prev) => !prev);
                if (isFilterPanelExpanded) setIsFilterPanelExpanded(false);
              }}
              className={`h-10 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                isAssignmentDrawerExpanded
                  ? 'bg-[#0A6FA8] text-white shadow-xs'
                  : 'bg-[#EFF6FB] dark:bg-[#182840] text-[#0B2559] dark:text-[#E6ECF7] hover:bg-[#e2edf7] dark:hover:bg-[#20324e]'
              }`}
              title="Edit move-in date, contract rotation length, or commute radius"
            >
              <span className="material-symbols-outlined text-[16px] text-[#0A6FA8] dark:text-[#3E9AD1]">
                calendar_today
              </span>
              <span>
                {earliestCheckIn} · {selectedDuration === 'custom' ? `${customDuration} wks` : `${selectedDuration} wks`} · {commuteBuffer} mi
              </span>
              <span
                className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                  isAssignmentDrawerExpanded ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {/* Clinical Filters Trigger (Progressive Disclosure) */}
            <button
              type="button"
              id="toggle-filter-panel-button"
              onClick={() => {
                setIsFilterPanelExpanded((prev) => !prev);
                if (isAssignmentDrawerExpanded) setIsAssignmentDrawerExpanded(false);
              }}
              className={`h-10 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                isFilterPanelExpanded || activePanelFilterCount > 0
                  ? 'bg-[#001848] text-white shadow-xs'
                  : 'bg-[#EFF6FB] dark:bg-[#182840] text-[#0B2559] dark:text-[#E6ECF7] hover:bg-[#e2edf7] dark:hover:bg-[#20324e]'
              }`}
              title="Filter by rent ceiling, day-sleeper quiet score, and shift logistics"
            >
              <span className="material-symbols-outlined text-[16px]">tune</span>
              <span>Filters</span>
              {activePanelFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#001848] text-[10px] flex items-center justify-center font-extrabold shadow-2xs">
                  {activePanelFilterCount}
                </span>
              )}
              <span
                className={`material-symbols-outlined text-[16px] transition-transform duration-200 ${
                  isFilterPanelExpanded ? 'rotate-180' : ''
                }`}
              >
                expand_more
              </span>
            </button>

            {/* Quick Actions & Layout Toggle (Right-aligned) */}
            <div className="flex items-center gap-1.5 ml-auto shrink-0">
              <button
                type="button"
                onClick={() => setIsGsaModalOpen(true)}
                className="hidden xl:inline-flex items-center gap-1.5 h-9 px-2.5 rounded-xl bg-amber-500/10 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200 text-xs font-semibold hover:bg-amber-500/20 transition-colors cursor-pointer border border-amber-500/20"
                title="Calculate allowable federal GSA lodging per-diem (Phase 2 Contract Scope)"
              >
                <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                <span>GSA Stipend</span>
                <span className="text-[9px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200 font-mono font-bold">Phase 2</span>
              </button>

              <button
                type="button"
                onClick={triggerLiveQueryRefresh}
                disabled={isDataLoading}
                title="Refresh listings for assigned campus"
                className="h-9 w-9 rounded-xl bg-[#EFF6FB] dark:bg-[#182840] hover:bg-[#e2edf7] dark:hover:bg-[#20324e] text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center cursor-pointer transition-colors"
              >
                <span className={`material-symbols-outlined text-[16px] ${isDataLoading ? 'animate-spin' : ''}`}>
                  sync
                </span>
              </button>

              <div className="inline-flex items-center p-0.5 rounded-xl bg-[#EFF6FB] dark:bg-[#182840]">
                <button
                  type="button"
                  onClick={() => setViewMode('split-map')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all duration-150 ${
                    viewMode === 'split-map'
                      ? 'bg-white dark:bg-[#0B2559] text-[#001848] dark:text-white shadow-xs'
                      : 'text-[#404850] dark:text-[#c0c7d1]'
                  }`}
                  title="View split map and listings"
                >
                  <span className="material-symbols-outlined text-[15px]">map</span>
                  <span className="hidden sm:inline">Split Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all duration-150 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#0B2559] text-[#001848] dark:text-white shadow-xs'
                      : 'text-[#404850] dark:text-[#c0c7d1]'
                  }`}
                  title="View full grid layout"
                >
                  <span className="material-symbols-outlined text-[15px]">grid_view</span>
                  <span className="hidden sm:inline">Grid</span>
                </button>
              </div>
            </div>
          </div>

          {/* PROGRESSIVE DISCLOSURE 1: ASSIGNMENT DATES & RADIUS DRAWER */}
          <AnimatePresence initial={false}>
            {isAssignmentDrawerExpanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  transition: {
                    height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.2, delay: 0.04 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.12 },
                  },
                }}
                className="overflow-hidden border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] pt-3 pb-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[#EFF6FB]/60 dark:bg-[#15233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  {/* Move-in Date */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#404850] dark:text-[#93ccff] mb-1">
                      Earliest Move-In
                    </label>
                    <div className="relative">
                      <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#0A6FA8] dark:text-[#3E9AD1] pointer-events-none text-[15px]">
                        calendar_today
                      </span>
                      <input
                        type="text"
                        value={earliestCheckIn}
                        onChange={(e) => setEarliestCheckIn(e.target.value)}
                        className="w-full h-9 pl-8 pr-2 rounded-xl bg-white dark:bg-[#182840] text-[#001848] dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#0A6FA8] border border-[rgba(11,37,89,0.08)]"
                      />
                    </div>
                  </div>

                  {/* Rotation Duration */}
                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-[#404850] dark:text-[#93ccff] mb-1">
                      Rotation Length
                    </label>
                    <div className="flex items-center gap-1">
                      {durationOptions.map((opt) => (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => setSelectedDuration(opt.value)}
                          className={`flex-1 h-9 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                            selectedDuration === opt.value
                              ? 'bg-[#0A6FA8] text-white shadow-2xs'
                              : 'bg-white dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 dark:hover:bg-[#1f3350] border border-[rgba(11,37,89,0.08)]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                    {selectedDuration === 'custom' && (
                      <input
                        type="number"
                        min="1"
                        value={customDuration || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setCustomDuration(isNaN(val) ? 0 : val);
                        }}
                        placeholder="Weeks count"
                        className="w-full h-8 px-2.5 mt-1.5 rounded-lg bg-white dark:bg-[#182840] text-[#001848] dark:text-white text-xs font-semibold focus:outline-none focus:ring-1 focus:ring-[#0A6FA8] border border-[rgba(11,37,89,0.08)]"
                      />
                    )}
                  </div>

                  {/* Commute Radius */}
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <label className="text-[10px] font-bold uppercase tracking-wider text-[#404850] dark:text-[#93ccff]">
                        Max Commute Buffer
                      </label>
                      <button
                        type="button"
                        onClick={() => setIsAssignmentDrawerExpanded(false)}
                        className="text-[11px] font-bold text-[#0A6FA8] dark:text-[#3E9AD1] hover:underline cursor-pointer"
                      >
                        Done
                      </button>
                    </div>
                    <div className="flex items-center gap-1">
                      {commuteOptions.map((opt) => (
                        <button
                          key={opt.miles}
                          type="button"
                          onClick={() => setCommuteBuffer(opt.miles)}
                          className={`flex-1 h-9 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                            commuteBuffer === opt.miles
                              ? 'bg-[#001848] text-white shadow-2xs'
                              : 'bg-white dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 dark:hover:bg-[#1f3350] border border-[rgba(11,37,89,0.08)]'
                          }`}
                        >
                          {opt.label}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Quick Filter Chips Row */}
          <div className="flex items-center justify-between gap-2 overflow-x-auto pt-1 pb-0.5 custom-scrollbar text-xs">
            <div className="flex items-center gap-1.5 shrink-0">
              {[
                { id: 'all', label: 'All' },
                { id: 'entire', label: 'Entire home' },
                { id: 'private', label: 'Private suite' },
                { id: 'blackout', label: 'Blackout curtains' },
                { id: 'laundry', label: 'In-unit washer' },
                { id: 'parking', label: 'Reserved parking' },
              ].map((chip) => {
                const isSelected = activeFilterChip === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setActiveFilterChip(chip.id as any)}
                    className={`px-3 py-1 rounded-full whitespace-nowrap font-medium text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B2559] text-white shadow-2xs'
                        : 'bg-[#EFF6FB] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-[#e2edf7] dark:hover:bg-[#20324e]'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}

              <button
                type="button"
                id="open-full-filter-modal-button"
                onClick={() => setIsFilterModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#0A6FA8] dark:text-[#3E9AD1] hover:bg-[#EFF6FB] dark:hover:bg-[#182840] transition-colors cursor-pointer ml-1"
                title="Open comprehensive 25-point clinical amenities checklist"
              >
                <span className="material-symbols-outlined text-[14px]">checklist</span>
                <span>25-Pt Checklist</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-[#195b4c] dark:text-[#aff0db] shrink-0 bg-[#195b4c]/10 dark:bg-[#aff0db]/10 px-2.5 py-1 rounded-full">
              <span className="material-symbols-outlined text-[13px]">verified</span>
              <span>$0 Traveler Booking Fee</span>
            </div>
          </div>

          {/* EXPANDABLE FILTER PANEL WITH SMOOTH HEIGHT & FADE-IN TRANSITIONS */}
          <AnimatePresence initial={false}>
            {isFilterPanelExpanded && (
              <motion.div
                id="search-filter-panel"
                key="search-filter-panel"
                initial={{ height: 0, opacity: 0 }}
                animate={{
                  height: 'auto',
                  opacity: 1,
                  transition: {
                    height: { duration: 0.35, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.25, delay: 0.05 },
                  },
                }}
                exit={{
                  height: 0,
                  opacity: 0,
                  transition: {
                    height: { duration: 0.28, ease: [0.16, 1, 0.3, 1] },
                    opacity: { duration: 0.16 },
                  },
                }}
                className="overflow-hidden border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] bg-gradient-to-b from-[#f8faff] to-white dark:from-[#0c182c] dark:to-[#111e33] mt-3 -mx-4 sm:-mx-6 lg:-mx-12 px-4 sm:px-6 lg:px-12 py-5"
              >
                <div className="max-w-7xl mx-auto flex flex-col gap-5">
                  {/* Panel Header */}
                  <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] gap-2">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-lg bg-[#005684]/10 dark:bg-[#93ccff]/15 flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                        <span className="material-symbols-outlined text-[15px]">tune</span>
                      </span>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#001848] dark:text-white">
                          Clinical Criteria & Stipends
                        </h3>
                        <p className="text-[11px] text-[#404850] dark:text-[#93ccff]">
                          Adjust stipend limits, quiet scores, and shift amenities
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {activePanelFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={handleResetAllFilters}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 cursor-pointer group"
                        >
                          <span className="material-symbols-outlined text-[14px]">refresh</span>
                          <span className="group-hover:underline">Reset ({activePanelFilterCount})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsFilterModalOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#005684] dark:text-[#93ccff] cursor-pointer group"
                      >
                        <span className="material-symbols-outlined text-[14px]">checklist</span>
                        <span className="group-hover:underline">25-Point Checklist</span>
                      </button>
                    </div>
                  </div>

                  {/* 3 Modular Columns */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    {/* 1. Monthly Per-Diem / Budget Limit */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-2xs flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-[#001848] dark:text-white mb-2">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-[#005684] dark:text-[#93ccff]">
                              payments
                            </span>
                            Monthly Rent Ceiling
                          </span>
                          <span className="text-sm font-black text-[#005684] dark:text-[#93ccff]">
                            {maxPrice >= 3500 ? 'Any ($3,500+)' : `$${maxPrice.toLocaleString()} / mo`}
                          </span>
                        </div>

                        <input
                          type="range"
                          min="1500"
                          max="3500"
                          step="100"
                          value={maxPrice}
                          onChange={(e) => setMaxPrice(Number(e.target.value))}
                          className="w-full accent-[#005684] h-2 bg-[#eaedff] dark:bg-[#182840] rounded-lg cursor-pointer"
                        />

                        {/* Quick Presets */}
                        <div className="flex items-center gap-1.5 mt-3">
                          {[2000, 2500, 3000, 3500].map((preset) => (
                            <button
                              key={preset}
                              type="button"
                              onClick={() => setMaxPrice(preset)}
                              className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                maxPrice === preset
                                  ? 'bg-[#005684] text-white shadow-2xs'
                                  : 'bg-[#f2f3ff] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-[#eaedff]'
                              }`}
                            >
                              {preset === 3500 ? 'Any' : `$${preset / 1000}k`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] text-[#195b4c] dark:text-[#aff0db] bg-[#195b4c]/10 dark:bg-[#aff0db]/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
                        <span className="material-symbols-outlined text-[14px]">verified</span>
                        <span>$0 Traveler Booking Fee on all contracts</span>
                      </div>
                    </div>

                    {/* 2. Clinical Sleep & Acoustic Quality */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-2xs flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-[#001848] dark:text-white mb-2">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-[#005684] dark:text-[#93ccff]">
                              bedtime
                            </span>
                            Sleep Acoustic Standards
                          </span>
                        </div>

                        {/* Rating threshold pills */}
                        <div className="flex items-center gap-1.5 mb-3">
                          {[
                            { val: 0, label: 'Any Rating' },
                            { val: 4.8, label: '4.8+ ★' },
                            { val: 4.9, label: '4.9+ ★' },
                          ].map((opt) => (
                            <button
                              key={opt.val}
                              type="button"
                              onClick={() => setMinRating(opt.val)}
                              className={`flex-1 py-1 rounded-lg text-[11px] font-bold transition-colors cursor-pointer ${
                                minRating === opt.val
                                  ? 'bg-[#005684] text-white shadow-2xs'
                                  : 'bg-[#f2f3ff] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-[#eaedff]'
                              }`}
                            >
                              {opt.label}
                            </button>
                          ))}
                        </div>

                        {/* Toggles */}
                        <div className="space-y-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#001848] dark:text-white">
                            <input
                              type="checkbox"
                              checked={filterBlackout}
                              onChange={(e) => setFilterBlackout(e.target.checked)}
                              className="w-4 h-4 rounded text-[#005684] accent-[#005684] cursor-pointer"
                            />
                            <span>Blackout Curtains (100% light block)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#001848] dark:text-white">
                            <input
                              type="checkbox"
                              checked={filterQuietDay}
                              onChange={(e) => setFilterQuietDay(e.target.checked)}
                              className="w-4 h-4 rounded text-[#005684] accent-[#005684] cursor-pointer"
                            />
                            <span>Day-Sleeper Quiet Hours (≤35dB)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#001848] dark:text-white">
                            <input
                              type="checkbox"
                              checked={filterSoundMachine}
                              onChange={(e) => setFilterSoundMachine(e.target.checked)}
                              className="w-4 h-4 rounded text-[#005684] accent-[#005684] cursor-pointer"
                            />
                            <span>White Noise Sound Machine</span>
                          </label>
                        </div>
                      </div>

                      <div className="text-[10px] text-[#404850] dark:text-[#93ccff]">
                        Acoustically inspected for night shift day-sleepers.
                      </div>
                    </div>

                    {/* 3. Shift Logistics & Clinician Protections */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-2xs flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-[#001848] dark:text-white mb-2">
                          <span className="flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-[16px] text-[#005684] dark:text-[#93ccff]">
                              local_laundry_service
                            </span>
                            Shift Logistics & Protection
                          </span>
                        </div>

                        <div className="space-y-2 mt-2">
                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#001848] dark:text-white">
                            <input
                              type="checkbox"
                              checked={filterScrubWasher}
                              onChange={(e) => setFilterScrubWasher(e.target.checked)}
                              className="w-4 h-4 rounded text-[#005684] accent-[#005684] cursor-pointer"
                            />
                            <span>In-Unit Scrub Washer & Dryer</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#001848] dark:text-white">
                            <input
                              type="checkbox"
                              checked={filterDedicatedParking}
                              onChange={(e) => setFilterDedicatedParking(e.target.checked)}
                              className="w-4 h-4 rounded text-[#005684] accent-[#005684] cursor-pointer"
                            />
                            <span>Dedicated Reserved Parking Spot</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#001848] dark:text-white">
                            <input
                              type="checkbox"
                              checked={filterContractFlex}
                              onChange={(e) => setFilterContractFlex(e.target.checked)}
                              className="w-4 h-4 rounded text-[#005684] accent-[#005684] cursor-pointer"
                            />
                            <span>Contract Flex Protection ($0 Cancellation)</span>
                          </label>

                          <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-[#001848] dark:text-white">
                            <input
                              type="checkbox"
                              checked={filterPetFriendly}
                              onChange={(e) => setFilterPetFriendly(e.target.checked)}
                              className="w-4 h-4 rounded text-[#005684] accent-[#005684] cursor-pointer"
                            />
                            <span>Pet-Friendly Sanctuary</span>
                          </label>
                        </div>
                      </div>

                      <div className="text-[10px] text-[#404850] dark:text-[#93ccff]">
                        All homes include verified high-speed Wi-Fi for charting.
                      </div>
                    </div>
                  </div>

                  {/* Panel Footer */}
                  <div className="flex items-center justify-between pt-2 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
                    <div className="flex items-center gap-2" aria-live="polite">
                      <span className="text-xs font-bold text-[#001848] dark:text-white">
                        {filteredListings.length} {filteredListings.length === 1 ? 'Sanctuary' : 'Sanctuaries'} Found
                      </span>
                      {activePanelFilterCount > 0 && (
                        <span className="text-[10px] font-semibold text-[#005684] dark:text-[#93ccff] bg-[#005684]/10 dark:bg-[#93ccff]/15 px-2 py-0.5 rounded-full">
                          {activePanelFilterCount} active criteria applied
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setIsFilterPanelExpanded(false)}
                      className="px-4 py-2 rounded-xl bg-[#001848] text-white text-xs font-bold hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] cursor-pointer transition-colors flex items-center gap-1.5 shadow-xs"
                    >
                      <span>Done Filtering</span>
                      <span className="material-symbols-outlined text-[15px]">keyboard_arrow_up</span>
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </section>

      {/* 2. RESULTS CONTENT AREA */}
      <section className="w-full">
        {isDataLoading ? (
          <SearchListingsSkeleton
            viewMode={viewMode}
            isNightShiftMode={isNightShiftMode}
            hospitalName={selectedHospital}
            count={4}
          />
        ) : (
          <>
            {/* Split Map View Mode */}
            {viewMode === 'split-map' && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-12 min-h-[820px]">
            {/* LEFT 7 COLS: Listings Feed */}
            <div className="lg:col-span-7 px-3 sm:px-6 lg:px-8 py-3.5 flex flex-col gap-4">
              {/* Feed Header & Sort Controls */}
              <div className="flex flex-wrap items-center justify-between pb-2.5 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] gap-2">
                <div className="flex items-baseline gap-2" aria-live="polite">
                  <h2 className="text-base sm:text-lg font-bold text-[#001848] dark:text-white tabular-nums">
                    {filteredListings.length} {filteredListings.length === 1 ? 'Sanctuary' : 'Sanctuaries'}
                  </h2>
                  <span className="text-xs text-[#404850] dark:text-[#93ccff] truncate max-w-[280px]">
                    near {selectedHospital.split(' - ')[0]} (≤{commuteBuffer} mi)
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  <label htmlFor="search-sort-select" className="text-xs font-semibold text-[#404850] dark:text-[#93ccff]">
                    Sort:
                  </label>
                  <select
                    id="search-sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="text-xs font-semibold bg-white dark:bg-[#182840] border border-[rgba(11,37,89,0.12)] dark:border-[#233550] rounded-lg px-2.5 py-1 text-[#001848] dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#005684]"
                  >
                    <option value="closest">Closest</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="quiet_score">Quiet Rating</option>
                  </select>
                </div>
              </div>

              {/* Listings Cards Feed */}
              {filteredListings.length === 0 ? (
                <motion.div
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="py-16 px-6 text-center rounded-2xl bg-white dark:bg-[#111e33] border border-dashed border-[rgba(11,37,89,0.15)] dark:border-[#233550] flex flex-col items-center justify-center gap-3"
                >
                  <span className="w-12 h-12 rounded-full bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                    <span className="material-symbols-outlined text-[24px]">filter_alt_off</span>
                  </span>
                  <h3 className="text-sm font-bold text-[#001848] dark:text-white">
                    No sanctuaries match the current filters
                  </h3>
                  <p className="text-xs text-[#404850] dark:text-[#93ccff] max-w-sm">
                    Try raising your rent ceiling or unchecking specialized day-sleeper amenities.
                  </p>
                  <button
                    type="button"
                    onClick={handleResetAllFilters}
                    className="mt-2 px-4 py-2 rounded-xl bg-[#005684] text-white text-xs font-bold hover:bg-[#001848] transition-colors shadow-xs cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </motion.div>
              ) : (
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AnimatePresence mode="popLayout">
                    {filteredListings.map((listing: any) => {
                      const isSaved = savedListingIds.includes(listing.id);
                      const isSelectedOnMap = selectedMapListingId === listing.id;

                      return (
                        <SearchListingCard
                          key={listing.id}
                          listing={listing}
                          isSaved={isSaved}
                          isSelectedOnMap={isSelectedOnMap}
                          onToggleSave={onToggleSave}
                          onSelectOnMap={handleSelectOnMap}
                          onViewDetails={handleViewDetails}
                          onRequestToBook={onRequestToBookListing}
                          selectedHospital={selectedHospital}
                          viewMode="split-map"
                          isNightShiftMode={isNightShiftMode}
                        />
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* RIGHT 5 COLS: Interactive SVG Map */}
            <div className="lg:col-span-5 relative lg:sticky lg:top-14 lg:h-[calc(100vh-56px)] bg-[#eef3f9] dark:bg-[#0a1424] border-l border-[rgba(11,37,89,0.08)] dark:border-[#233550] p-3 sm:p-4 flex flex-col justify-between overflow-hidden">
              {/* Map Canvas Header Overlay */}
              <div className="relative z-10 flex items-center justify-between bg-white/90 dark:bg-[#111e33]/90 backdrop-blur-xs p-2.5 sm:p-3 rounded-2xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005684] text-[18px]">map</span>
                  <div className="text-xs font-bold text-[#001848] dark:text-white">
                    <span>Medical Zone: </span>
                    <span className="text-[#005684] dark:text-[#93ccff]">{selectedHospital.split(' - ')[0]}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1 bg-[#f2f3ff] dark:bg-[#182840] p-0.5 rounded-lg text-[11px] font-bold">
                  <button
                    type="button"
                    onClick={() => setCommuteMode('transit')}
                    className={`px-2 py-0.5 rounded ${commuteMode === 'transit' ? 'bg-[#005684] text-white' : 'text-[#404850] dark:text-gray-300'}`}
                  >
                    Transit
                  </button>
                  <button
                    type="button"
                    onClick={() => setCommuteMode('drive')}
                    className={`px-2 py-0.5 rounded ${commuteMode === 'drive' ? 'bg-[#005684] text-white' : 'text-[#404850] dark:text-gray-300'}`}
                  >
                    Drive
                  </button>
                </div>
              </div>

              {/* Live Interactive Google Maps Split View */}
              <div className="relative my-2 sm:my-3 flex-1 min-h-[420px] lg:min-h-0 w-full rounded-2xl overflow-hidden shadow-sm">
                <GoogleMapsSplitView
                  isNightShiftMode={isNightShiftMode}
                  listings={filteredListings}
                  selectedListingId={selectedMapListingId}
                  onSelectListing={(listing: any) => {
                    setSelectedMapListingId(listing.id);
                    setActiveDetailListing(listing);
                  }}
                  hospitalName={selectedHospital}
                  radiusMiles={commuteBuffer}
                />
              </div>

              {/* Bottom Selected Listing Preview Card */}
              {selectedMapListing && (
                <div className="relative z-10 bg-white dark:bg-[#111e33] rounded-2xl p-3 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-md flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <img
                      src={selectedMapListing.images[0]}
                      alt={selectedMapListing.title}
                      className="w-14 h-14 rounded-xl object-cover"
                    />
                    <div>
                      <div className="flex items-center gap-1.5 text-[11px] text-[#195b4c] font-bold">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        <span>{selectedMapListing.distanceBadge || `${selectedMapListing.driveTimeMinutes} min to hospital`}</span>
                      </div>
                      <h4 className="text-xs font-bold text-[#001848] dark:text-white line-clamp-1">
                        {selectedMapListing.title}
                      </h4>
                      <div className="text-xs font-extrabold text-[#005684] dark:text-[#93ccff]">
                        ${selectedMapListing.monthlyRate.toLocaleString()} / mo
                      </div>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => setActiveDetailListing(selectedMapListing)}
                    className="px-3 py-2 rounded-xl bg-[#005684] hover:bg-[#004266] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#004266] text-white text-xs font-bold transition-colors cursor-pointer shrink-0"
                  >
                    View Stay
                  </button>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 3-Column Grid View Mode */}
        {viewMode === 'grid' && (
          <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-4">
            <div className="flex flex-wrap items-center justify-between pb-2.5 mb-4 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] gap-2">
              <div className="flex items-baseline gap-2" aria-live="polite">
                <h2 className="text-base sm:text-lg font-bold text-[#001848] dark:text-white tabular-nums">
                  {filteredListings.length} {filteredListings.length === 1 ? 'Sanctuary' : 'Sanctuaries'}
                </h2>
                <span className="text-xs text-[#404850] dark:text-[#93ccff]">
                  near {selectedHospital.split(' - ')[0]} (≤{commuteBuffer} mi)
                </span>
              </div>

              <div className="flex items-center gap-1.5">
                <label htmlFor="grid-sort-select" className="text-xs font-semibold text-[#404850] dark:text-[#93ccff]">
                  Sort:
                </label>
                <select
                  id="grid-sort-select"
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value as any)}
                  className="text-xs font-semibold bg-white dark:bg-[#182840] border border-[rgba(11,37,89,0.12)] dark:border-[#233550] rounded-lg px-2.5 py-1 text-[#001848] dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#005684]"
                >
                  <option value="closest">Closest</option>
                  <option value="price_low">Price: Low to High</option>
                  <option value="quiet_score">Quiet Rating</option>
                </select>
              </div>
            </div>

            {filteredListings.length === 0 ? (
              <motion.div
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                className="py-20 px-6 text-center rounded-3xl bg-white dark:bg-[#111e33] border border-dashed border-[rgba(11,37,89,0.15)] dark:border-[#233550] flex flex-col items-center justify-center gap-3"
              >
                <span className="w-14 h-14 rounded-full bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                  <span className="material-symbols-outlined text-[28px]">filter_alt_off</span>
                </span>
                <h3 className="text-base font-bold text-[#001848] dark:text-white">
                  No sanctuaries match the current filters
                </h3>
                <p className="text-xs text-[#404850] dark:text-[#93ccff] max-w-sm">
                  Try raising your rent ceiling or unchecking specialized day-sleeper amenities.
                </p>
                <button
                  type="button"
                  onClick={handleResetAllFilters}
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#005684] text-white text-xs font-bold hover:bg-[#001848] transition-colors shadow-xs cursor-pointer"
                >
                  Reset All Filters
                </button>
              </motion.div>
            ) : (
              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredListings.map((listing: any) => {
                    const isSaved = savedListingIds.includes(listing.id);
                    return (
                      <SearchListingCard
                        key={listing.id}
                        listing={listing}
                        isSaved={isSaved}
                        onToggleSave={onToggleSave}
                        onViewDetails={handleViewDetails}
                        onRequestToBook={onRequestToBookListing}
                        selectedHospital={selectedHospital}
                        viewMode="grid"
                        isNightShiftMode={isNightShiftMode}
                      />
                    );
                  })}
                </AnimatePresence>
              </motion.div>
            )}
          </div>
        )}
          </>
        )}
      </section>

      {/* MODALS */}
      <ListingDetailModal
        listing={activeDetailListing}
        onClose={() => setActiveDetailListing(null)}
        isNightShiftMode={isNightShiftMode}
        isSaved={activeDetailListing ? savedListingIds.includes(activeDetailListing.id) : false}
        onToggleSave={onToggleSave}
        isVerified={isVerified}
        onGoToVerification={onGoToVerification}
        selectedHospital={selectedHospital}
        onRequestToBook={(listing: any) => {
          setActiveDetailListing(null);
          onRequestToBookListing?.(listing);
        }}
      />

      <HealthcareAmenitiesFilterModal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        onApply={() => {
          setIsFilterModalOpen(false);
          setActiveAmenityCount(5);
        }}
        isNightShiftMode={isNightShiftMode}
        activeHospitalName={selectedHospital}
      />

      {/* GSA Stipend Audit Modal (Gated for Phase 1 Acceptance) */}
      {isGsaModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/70 backdrop-blur-xs flex justify-center items-start"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsGsaModalOpen(false);
            }
          }}
        >
          {!m2BypassMode ? (
            <div
              className="w-full max-w-lg my-auto bg-white dark:bg-[#111e33] rounded-3xl p-6 sm:p-8 shadow-2xl border border-amber-500/30 text-[#001848] dark:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">lock_clock</span>
                  </div>
                  <div>
                    <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/15 text-amber-800 dark:text-amber-300 mb-1">
                      <span className="material-symbols-outlined text-[12px]">event_upcoming</span>
                      Milestone 2 Contract Deliverable
                    </div>
                    <h3 className="font-bold text-base leading-tight">
                      GSA Per-Diem Stipend Comparison
                    </h3>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGsaModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-200 cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="py-4 space-y-3 text-xs text-[#404850] dark:text-[#c0c7d1]">
                <p className="leading-relaxed">
                  In accordance with Lawrence Roberts&apos; confirmed Phase 1 core marketplace scope, federal GSA lodging per-diem comparison, agency tax deductions, and duplicate living expense calculation are scheduled as <strong>Milestone 2 deliverables</strong>.
                </p>

                <div className="p-3.5 rounded-2xl bg-[#EFF6FB] dark:bg-[#182840] border border-[#005684]/15 space-y-2">
                  <div className="text-[11px] font-bold text-[#001848] dark:text-white uppercase tracking-wider">
                    Phase 1 vs. Milestone 2 Boundaries
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div className="p-2 rounded-xl bg-white dark:bg-[#111e33] border border-emerald-500/20">
                      <div className="font-bold text-[#195b4c] dark:text-[#aff0db] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">check_circle</span>
                        Phase 1 Live
                      </div>
                      <div className="text-gray-500 mt-0.5">Direct RN rates, $0 traveler fee, quiet guarantees.</div>
                    </div>
                    <div className="p-2 rounded-xl bg-white dark:bg-[#111e33] border border-amber-500/20">
                      <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                        <span className="material-symbols-outlined text-[13px]">lock</span>
                        Milestone 2 Gated
                      </div>
                      <div className="text-gray-500 mt-0.5">IRS duplicate lodging ledger &amp; GSA per diem audit.</div>
                    </div>
                  </div>
                </div>

                <p className="text-[11px] text-gray-500 italic">
                  To maintain strict acceptance boundaries and avoid scope creep, this module is gated during Phase 1 core review.
                </p>
              </div>

              <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                  type="button"
                  onClick={() => setIsGsaModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#001848] hover:bg-[#005684] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Return to Phase 1 Search
                </button>
                {onToggleM2Bypass && (
                  <button
                    type="button"
                    onClick={() => {
                      onToggleM2Bypass();
                    }}
                    className="px-3 py-2.5 rounded-xl border border-purple-500/30 text-purple-700 dark:text-purple-300 text-xs font-mono font-semibold hover:bg-purple-50 dark:hover:bg-purple-950/20 cursor-pointer"
                    title="Developer toggle to preview in-flight Milestone 2 module"
                  >
                    Bypass Gate (Dev)
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div
              className="w-full max-w-lg my-auto bg-white dark:bg-[#111e33] rounded-3xl p-6 sm:p-8 shadow-lg border border-purple-500/30 text-[#001848] dark:text-white"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#195b4c] text-[24px]">verified</span>
                  <div>
                    <h3 className="font-bold text-base">GSA Per-Diem Stipend Comparison</h3>
                    <span className="text-[10px] font-mono text-purple-600 dark:text-purple-300 font-bold">[Milestone 2 Unlocked]</span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIsGsaModalOpen(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center hover:bg-gray-200 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-200"
                >
                  ✕
                </button>
              </div>
              <div className="py-4 space-y-3 text-xs text-[#404850] dark:text-[#c0c7d1]">
                <p>
                  Under IRS Revenue Procedure 2024-34, traveling healthcare professionals can receive tax-free housing stipends when duplicating expenses.
                </p>
                <div className="p-4 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] space-y-2">
                  <div className="flex justify-between font-bold text-sm text-[#001848] dark:text-white">
                    <span>San Francisco Lodging Cap:</span>
                    <span>$3,120 / month</span>
                  </div>
                  <div className="flex justify-between text-xs text-[#195b4c] font-semibold">
                    <span>Nurses Pillow Average Rent:</span>
                    <span>$1,950 / month</span>
                  </div>
                  <div className="flex justify-between text-xs font-bold text-[#005684] pt-1 border-t border-gray-200 dark:border-gray-700">
                    <span>Stipend Surplus Retained:</span>
                    <span>+$1,170 / month tax-free</span>
                  </div>
                </div>
                <p className="text-[11px] text-gray-500">
                  All itemized invoices generate automatically in your traveler receipt portal.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsGsaModalOpen(false)}
                  className="flex-1 py-2.5 rounded-xl bg-[#001848] text-white text-xs font-bold cursor-pointer"
                >
                  Close Comparison
                </button>
                {onToggleM2Bypass && (
                  <button
                    type="button"
                    onClick={() => onToggleM2Bypass()}
                    className="px-3 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-mono text-gray-600 dark:text-gray-300 cursor-pointer"
                  >
                    Lock Gate
                  </button>
                )}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
