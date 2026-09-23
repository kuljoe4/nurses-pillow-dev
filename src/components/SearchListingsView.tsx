import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HousingListing } from '../types';
import { MOCK_LISTINGS, VERIFIED_HOSPITAL_HUBS } from '../data/mockData';
import { ListingDetailModal } from './ListingDetailModal';
import { HealthcareAmenitiesFilterModal } from './HealthcareAmenitiesFilterModal';
import { SearchListingsSkeleton } from './skeletons/SearchListingsSkeleton';

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
}

export const SearchListingsView: React.FC<SearchListingsViewProps> = ({
  isNightShiftMode,
  savedListingIds,
  onToggleSave,
  isVerified,
  onGoToVerification,
  onRequestToBookListing,
  initialHospital = 'UCSF Medical Center - Mission Bay (San Francisco, CA)',
  initialDuration = '13',
  initialRadius = 5,
  isLoading,
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
  const [selectedMapListingId, setSelectedMapListingId] = useState<string>('sf-dogpatch-studio');
  const [mapZoom, setMapZoom] = useState(1);
  const [mapNotification, setMapNotification] = useState<string | null>(null);
  const [isGsaModalOpen, setIsGsaModalOpen] = useState(false);
  const [activeAmenityCount, setActiveAmenityCount] = useState(4);
  const [internalLoading, setInternalLoading] = useState(true);

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
    let list = [...MOCK_LISTINGS];

    // Filter by quick chip
    if (activeFilterChip === 'entire') {
      list = list.filter((l) => l.propertyType?.toLowerCase().includes('entire') || l.propertyType?.toLowerCase().includes('condo'));
    } else if (activeFilterChip === 'private') {
      list = list.filter((l) => l.propertyType?.toLowerCase().includes('room') || l.propertyType?.toLowerCase().includes('suite') || l.propertyType?.toLowerCase().includes('studio'));
    } else if (activeFilterChip === 'blackout') {
      list = list.filter((l) => l.highlightBadges?.some((b) => b.toLowerCase().includes('blackout')) || l.amenities?.blackoutCurtains);
    } else if (activeFilterChip === 'laundry') {
      list = list.filter((l) => l.highlightBadges?.some((b) => b.toLowerCase().includes('washer') || b.toLowerCase().includes('laundry')) || l.amenities?.washerDryerInUnit);
    } else if (activeFilterChip === 'parking') {
      list = list.filter((l) => l.highlightBadges?.some((b) => b.toLowerCase().includes('parking')) || l.amenities?.dedicatedParking);
    }

    // Extended filter criteria from panel
    if (maxPrice < 3500) {
      list = list.filter((l) => l.monthlyRate <= maxPrice);
    }
    if (minRating > 0) {
      list = list.filter((l) => l.nurseRating >= minRating);
    }
    if (filterBlackout) {
      list = list.filter((l) => l.amenities?.blackoutCurtains || l.highlightBadges?.some((b) => b.toLowerCase().includes('blackout')));
    }
    if (filterScrubWasher) {
      list = list.filter((l) => l.amenities?.washerDryerInUnit || l.highlightBadges?.some((b) => b.toLowerCase().includes('washer') || b.toLowerCase().includes('laundry')));
    }
    if (filterQuietDay) {
      list = list.filter((l) => l.amenities?.daySleeperQuietHours || l.highlightBadges?.some((b) => b.toLowerCase().includes('quiet')));
    }
    if (filterSoundMachine) {
      list = list.filter((l) => l.amenities?.whiteNoiseMachine);
    }
    if (filterDedicatedParking) {
      list = list.filter((l) => l.amenities?.dedicatedParking || l.highlightBadges?.some((b) => b.toLowerCase().includes('parking')));
    }
    if (filterPetFriendly) {
      list = list.filter((l) => l.amenities?.petFriendly);
    }
    if (filterContractFlex) {
      list = list.filter((l) => l.contractFlexProtection);
    }

    // Sort listings
    if (sortOption === 'closest') {
      list.sort((a, b) => a.driveTimeMinutes - b.driveTimeMinutes);
    } else if (sortOption === 'price_low') {
      list.sort((a, b) => a.monthlyRate - b.monthlyRate);
    } else if (sortOption === 'quiet_score') {
      list.sort((a, b) => b.nurseRating - a.nurseRating);
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
    return MOCK_LISTINGS.find((l) => l.id === selectedMapListingId) || filteredListings[0] || MOCK_LISTINGS[0];
  }, [selectedMapListingId, filteredListings]);

  return (
    <div className={`w-full min-h-screen transition-colors ${isNightShiftMode ? 'bg-[#08101C] text-[#E6ECF7]' : 'bg-[#faf8ff] text-[#001848]'}`}>
      {/* 1. TOP DEDICATED SEARCH BAR & ASSIGNMENT CONTROLS */}
      <section className="w-full bg-white dark:bg-[#111e33] border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-xs px-4 sm:px-6 lg:px-12 py-4">
        <div className="max-w-7xl mx-auto flex flex-col gap-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="w-8 h-8 rounded-lg bg-[#005684]/10 dark:bg-[#93ccff]/15 flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                <span className="material-symbols-outlined text-[18px]">travel_explore</span>
              </span>
              <div>
                <h1 className="text-base sm:text-lg font-bold text-[#001848] dark:text-white leading-tight">
                  Search Healthcare Sanctuaries
                </h1>
                <p className="text-xs text-[#404850] dark:text-[#93ccff]">
                  Strictly verified for day-sleepers, shift rotations, and clinical proximity
                </p>
              </div>
            </div>

            {/* Quick Stipend & Fee Transparency Pill */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGsaModalOpen(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#195b4c]/10 text-[#195b4c] dark:bg-[#aff0db]/15 dark:text-[#aff0db] text-xs font-semibold hover:bg-[#195b4c] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#195b4c]/20 transition-colors cursor-pointer"
              >
                <span className="material-symbols-outlined text-[15px]">calculate</span>
                <span>GSA Stipend Audit</span>
              </button>
              <div className="hidden sm:inline-flex items-center gap-1 px-3 py-1.5 rounded-full bg-[#eaedff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff] text-xs font-bold">
                <span className="material-symbols-outlined text-[14px]">verified</span>
                <span>$0 Traveler Booking Fee</span>
              </div>
            </div>
          </div>

          {/* Search Inputs Row */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
            {/* Hospital Selector (5 cols) */}
            <div className="md:col-span-5 relative">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#404850] dark:text-[#93ccff] mb-1">
                Assigned Hospital Campus
              </label>
              <div ref={hospitalDropdownRef} className="relative">
                <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-[#005684] dark:text-[#93ccff] pointer-events-none text-[18px]">
                  local_hospital
                </span>
                <input
                  type="text"
                  readOnly
                  value={selectedHospital}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-11 pl-10 pr-8 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] text-[#001848] dark:text-white text-xs sm:text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005684]"
                />
                <span
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="material-symbols-outlined absolute right-2.5 top-1/2 -translate-y-1/2 text-[#404850] dark:text-[#93ccff] cursor-pointer text-[18px]"
                >
                  arrow_drop_down
                </span>

                <AnimatePresence>
                  {isDropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: -6, scale: 0.98 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: -6, scale: 0.98 }}
                      transition={{ duration: 0.18, ease: 'easeOut' }}
                      className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#15233a] rounded-xl shadow-xl z-50 border border-[#c0c7d1]/40 dark:border-[#2b4162] overflow-hidden flex flex-col"
                    >
                      {/* Quick filter input */}
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
            </div>

            {/* Check-In & Duration (4 cols) */}
            <div className="md:col-span-4 grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#404850] dark:text-[#93ccff] mb-1">
                  Earliest Check-In
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-2.5 top-1/2 -translate-y-1/2 text-[#005684] dark:text-[#93ccff] pointer-events-none text-[16px]">
                    calendar_today
                  </span>
                  <input
                    type="text"
                    value={earliestCheckIn}
                    onChange={(e) => setEarliestCheckIn(e.target.value)}
                    className="w-full h-11 pl-8 pr-2 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] text-[#001848] dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005684]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-bold uppercase tracking-wider text-[#404850] dark:text-[#93ccff] mb-1">
                  Duration
                </label>
                <select
                  value={selectedDuration}
                  onChange={(e) => setSelectedDuration(e.target.value)}
                  className="w-full h-11 px-3 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] text-[#001848] dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005684] cursor-pointer"
                >
                  {durationOptions.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.value === 'custom' ? opt.label : `${opt.label} rotation`}
                    </option>
                  ))}
                </select>
                <AnimatePresence>
                  {selectedDuration === 'custom' && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut' }}
                      className="overflow-hidden mt-2"
                    >
                      <input
                        type="number"
                        min="1"
                        value={customDuration || ''}
                        onChange={(e) => {
                          const val = parseInt(e.target.value);
                          setCustomDuration(isNaN(val) ? 0 : val);
                        }}
                        placeholder="Custom (weeks)"
                        className="w-full h-11 px-3 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] text-[#001848] dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005684]"
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Radius Buffer (3 cols) */}
            <div className="md:col-span-3">
              <label className="block text-[10px] font-bold uppercase tracking-wider text-[#404850] dark:text-[#93ccff] mb-1">
                Max Commute Buffer: {commuteBuffer} miles
              </label>
              <div className="flex items-center gap-1.5">
                {commuteOptions.map((opt) => (
                  <button
                    key={opt.miles}
                    type="button"
                    onClick={() => setCommuteBuffer(opt.miles)}
                    className={`flex-1 h-11 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer ${
                      commuteBuffer === opt.miles
                        ? 'bg-[#005684] text-white shadow-xs'
                        : 'bg-[#f2f3ff] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff]'
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Quick Filter Chips & View Mode Sub-Bar */}
          <div className="flex flex-wrap items-center justify-between pt-2 border-t border-gray-100 dark:border-gray-800 gap-3">
            {/* Filter Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto py-1 text-xs">
              {[
                { id: 'all', label: 'All Stays' },
                { id: 'entire', label: 'Entire Home' },
                { id: 'private', label: 'Private Suite / Room' },
                { id: 'blackout', label: 'Blackout Guaranteed' },
                { id: 'laundry', label: 'In-Unit Scrub Washer' },
                { id: 'parking', label: 'Dedicated Parking' },
              ].map((chip) => {
                const isSelected = activeFilterChip === chip.id;
                return (
                  <button
                    key={chip.id}
                    type="button"
                    onClick={() => setActiveFilterChip(chip.id as any)}
                    className={`px-3 py-1.5 rounded-full whitespace-nowrap font-semibold transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#001848] text-white'
                        : 'bg-[#f2f3ff] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff]'
                    }`}
                  >
                    {chip.label}
                  </button>
                );
              })}

              <button
                type="button"
                id="toggle-filter-panel-button"
                onClick={() => setIsFilterPanelExpanded((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer whitespace-nowrap ml-1 ${
                  isFilterPanelExpanded || activePanelFilterCount > 0
                    ? 'bg-[#005684] text-white shadow-xs'
                    : 'bg-[#eaedff] dark:bg-[#1f3350] text-[#005684] dark:text-[#93ccff] hover:bg-[#dae2ff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#dae2ff]'
                }`}
                title="Toggle clinical criteria filter panel"
              >
                <span className="material-symbols-outlined text-[15px]">tune</span>
                <span>Filters</span>
                {activePanelFilterCount > 0 && (
                  <span className="w-4 h-4 rounded-full bg-white text-[#005684] text-[10px] flex items-center justify-center font-extrabold shadow-2xs">
                    {activePanelFilterCount}
                  </span>
                )}
                <span
                  className={`material-symbols-outlined text-[16px] transition-transform duration-250 ${
                    isFilterPanelExpanded ? 'rotate-180' : ''
                  }`}
                >
                  expand_more
                </span>
              </button>

              <button
                type="button"
                id="open-full-filter-modal-button"
                onClick={() => setIsFilterModalOpen(true)}
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-semibold text-[#404850] dark:text-[#c0c7d1] hover:text-[#005684] dark:hover:text-[#93ccff] hover:bg-[#f2f3ff] dark:hover:bg-[#182840] transition-colors cursor-pointer"
                title="Open comprehensive 25-point clinical amenities checklist"
              >
                <span className="material-symbols-outlined text-[14px]">checklist</span>
                <span>Full Checklist</span>
              </button>
            </div>

            {/* Layout Toggle (Split-Map vs Grid) */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={triggerLiveQueryRefresh}
                disabled={isDataLoading}
                title="Fetch live verified hospital inventory"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#f2f3ff] dark:bg-[#182840] hover:bg-[#eaedff] dark:hover:bg-[#1f3350] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] text-xs font-bold text-[#005684] dark:text-[#93ccff] cursor-pointer transition-colors shadow-2xs"
              >
                <span className={`material-symbols-outlined text-[15px] ${isDataLoading ? 'animate-spin' : ''}`}>
                  sync
                </span>
                <span>{isDataLoading ? 'Querying...' : 'Live Query'}</span>
              </button>

              <div className="inline-flex items-center p-0.5 rounded-full bg-[#f2f3ff] dark:bg-[#182840] border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
                <button
                  type="button"
                  onClick={() => setViewMode('split-map')}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all duration-200 ease-in-out ${
                    viewMode === 'split-map'
                      ? 'bg-[#005684] text-white shadow-xs'
                      : 'text-[#404850] dark:text-[#c0c7d1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">map</span>
                  <span>Split Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 cursor-pointer transition-all duration-200 ease-in-out ${
                    viewMode === 'grid'
                      ? 'bg-[#005684] text-white shadow-xs'
                      : 'text-[#404850] dark:text-[#c0c7d1]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[15px]">grid_view</span>
                  <span>Grid View</span>
                </button>
              </div>
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
                  <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] gap-3">
                    <div className="flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-[#005684]/10 dark:bg-[#93ccff]/15 flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                        <span className="material-symbols-outlined text-[17px]">tune</span>
                      </span>
                      <div>
                        <h3 className="text-xs font-bold uppercase tracking-wider text-[#001848] dark:text-white">
                          Clinical Sanctuary Filter Criteria
                        </h3>
                        <p className="text-[11px] text-[#404850] dark:text-[#93ccff]">
                          Adjust stipend limits, daytime acoustic ratings, and shift logistics in real time
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {activePanelFilterCount > 0 && (
                        <button
                          type="button"
                          onClick={handleResetAllFilters}
                          className="inline-flex items-center gap-1 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:underline cursor-pointer"
                        >
                          <span className="material-symbols-outlined text-[14px]">refresh</span>
                          <span>Reset All Filters ({activePanelFilterCount})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsFilterModalOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#005684] dark:text-[#93ccff] hover:underline cursor-pointer"
                      >
                        <span className="material-symbols-outlined text-[14px]">open_in_new</span>
                        <span>25-Point Checklist Modal</span>
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
            <div className="lg:col-span-7 px-4 sm:px-6 lg:px-8 py-6 flex flex-col gap-6 overflow-y-auto max-h-[900px]">
              {/* Feed Header & Sort Controls */}
              <div className="flex flex-wrap items-center justify-between pb-3 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] gap-2">
                <div aria-live="polite">
                  <span className="text-xs font-bold text-[#005684] dark:text-[#93ccff] uppercase tracking-wider">
                    Verified Sanctuary Stays
                  </span>
                  <h2 className="text-lg font-bold text-[#001848] dark:text-white">
                    {filteredListings.length} Spaces Found within {commuteBuffer} miles of {selectedHospital.split(' - ')[0]}
                  </h2>
                </div>

                <div className="flex items-center gap-2">
                  <label htmlFor="search-sort-select" className="text-xs font-semibold text-[#404850] dark:text-[#93ccff]">
                    Sort:
                  </label>
                  <select
                    id="search-sort-select"
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value as any)}
                    className="text-xs font-semibold bg-white dark:bg-[#182840] border border-[rgba(11,37,89,0.12)] dark:border-[#233550] rounded-lg px-2.5 py-1.5 text-[#001848] dark:text-white cursor-pointer focus:outline-none focus:ring-1 focus:ring-[#005684]"
                  >
                    <option value="closest">Closest to Hospital</option>
                    <option value="price_low">Price: Low to High</option>
                    <option value="quiet_score">Highest Quiet Rating</option>
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
                <motion.div layout className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AnimatePresence mode="popLayout">
                    {filteredListings.map((listing) => {
                      const isSaved = savedListingIds.includes(listing.id);
                      const isSelectedOnMap = selectedMapListingId === listing.id;

                      return (
                        <motion.div
                          layout
                          key={listing.id}
                          initial={{ opacity: 0, scale: 0.96 }}
                          animate={{ opacity: 1, scale: 1 }}
                          exit={{ opacity: 0, scale: 0.96 }}
                          transition={{
                            height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                            layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                            opacity: { duration: 0.22 },
                          }}
                          onClick={() => setSelectedMapListingId(listing.id)}
                          className={`rounded-2xl overflow-hidden bg-white dark:bg-[#111e33] border transition-shadow duration-200 cursor-pointer flex flex-col justify-between group ${
                            isSelectedOnMap
                              ? 'border-[#005684] ring-2 ring-[#005684]/30 shadow-lg'
                              : 'border-[rgba(11,37,89,0.08)] dark:border-[#233550] hover:border-[#005684]/50 shadow-sm hover:shadow-md'
                          }`}
                        >
                          {/* Image Header */}
                          <div className="relative h-48 w-full overflow-hidden bg-gray-100">
                            <img
                              src={listing.images[0]}
                              alt={listing.title}
                              referrerPolicy="no-referrer"
                              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                            />
                            <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold">
                              <span className="material-symbols-outlined text-[13px]">near_me</span>
                              <span>{listing.distanceBadge || `${listing.driveTimeMinutes} min commute`}</span>
                            </div>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggleSave(listing.id);
                              }}
                              aria-label="Save listing"
                              className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center text-[#001848] dark:text-white hover:scale-110 transition-transform shadow-xs"
                            >
                              <span className={`material-symbols-outlined text-[18px] ${isSaved ? 'text-rose-500 fill-1' : 'text-gray-600 dark:text-gray-300'}`}>
                                favorite
                              </span>
                            </button>
                          </div>

                          {/* Listing Info */}
                          <div className="p-4 flex-1 flex flex-col justify-between gap-3">
                            <div>
                              <div className="flex items-center justify-between text-[11px] text-[#404850] dark:text-[#93ccff] font-bold uppercase tracking-wider mb-1">
                                <span>{listing.propertyType || 'ENTIRE CONDO'}</span>
                                <div className="flex items-center gap-1 text-amber-500">
                                  <span className="material-symbols-outlined text-[15px]">star</span>
                                  <span className="text-[#001848] dark:text-white font-bold">{listing.nurseRating}</span>
                                  <span className="text-gray-400 font-normal">({listing.reviewsCount})</span>
                                </div>
                              </div>

                              <h3 className="text-sm font-bold text-[#001848] dark:text-white line-clamp-1 group-hover:text-[#005684] focus-visible:text-[#005684] transition-colors">
                                {listing.title}
                              </h3>

                              <div className="mt-2 flex items-baseline gap-1">
                                <span className="text-xl font-extrabold text-[#001848] dark:text-white">
                                  ${listing.monthlyRate.toLocaleString()}
                                </span>
                                <span className="text-xs text-[#404850] dark:text-[#93ccff]">/ month</span>
                                <span className="text-[10px] text-[#195b4c] font-bold bg-[#195b4c]/10 px-1.5 py-0.5 rounded ml-auto">
                                  $0 Traveler Fee
                                </span>
                              </div>

                              {/* Amenity Badges */}
                              <div className="flex flex-wrap gap-1 mt-3">
                                {(listing.highlightBadges || ['Blackout Curtains', '≤35dB Quiet', 'Scrub Washer']).slice(0, 3).map((badge, idx) => (
                                  <span
                                    key={idx}
                                    className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#f2f3ff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff]"
                                  >
                                    {badge}
                                  </span>
                                ))}
                              </div>
                            </div>

                            {/* Actions */}
                            <div className="pt-3 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex items-center justify-between gap-2">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setActiveDetailListing(listing);
                                }}
                                className="text-xs font-bold text-[#005684] dark:text-[#93ccff] hover:underline cursor-pointer"
                              >
                                View Details
                              </button>

                              {onRequestToBookListing && (
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    onRequestToBookListing(listing);
                                  }}
                                  className="px-3 py-1.5 rounded-lg bg-[#001848] dark:bg-[#005684] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white text-xs font-bold transition-colors cursor-pointer"
                                >
                                  Book Stay
                                </button>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </AnimatePresence>
                </motion.div>
              )}
            </div>

            {/* RIGHT 5 COLS: Interactive SVG Map */}
            <div className="lg:col-span-5 relative bg-[#eef3f9] dark:bg-[#0a1424] border-l border-[rgba(11,37,89,0.08)] dark:border-[#233550] p-4 flex flex-col justify-between overflow-hidden">
              {/* Map Canvas Header Overlay */}
              <div className="relative z-10 flex items-center justify-between bg-white/90 dark:bg-[#111e33]/90 backdrop-blur-xs p-3 rounded-2xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-sm">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#005684] text-[20px]">map</span>
                  <div className="text-xs font-bold text-[#001848] dark:text-white">
                    <span>Active Medical Zone: </span>
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

              {/* Stylized SVG Map Graphics */}
              <div className="relative my-4 flex-1 min-h-[480px] w-full rounded-2xl overflow-hidden bg-[#e5ecf5] dark:bg-[#0c1a2d] border border-[rgba(11,37,89,0.08)] flex items-center justify-center">
                {/* SVG Visual Map */}
                <svg className="w-full h-full absolute inset-0" viewBox="0 0 600 500" fill="none" xmlns="http://www.w3.org/2000/svg">
                  {/* Grid Lines */}
                  <defs>
                    <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                      <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(11,37,89,0.06)" strokeWidth="1" />
                    </pattern>
                  </defs>
                  <rect width="600" height="500" fill="url(#grid)" />

                  {/* Water Body */}
                  <path
                    d="M 450 0 C 470 120, 520 220, 600 280 L 600 0 Z"
                    fill="rgba(0,86,132,0.12)"
                    stroke="rgba(0,86,132,0.25)"
                    strokeWidth="2"
                  />

                  {/* Commute Transit Transit Line */}
                  <path
                    d="M 300 250 Q 360 210, 420 180 T 480 140"
                    stroke="#005684"
                    strokeWidth="3"
                    strokeDasharray="6 4"
                    opacity="0.8"
                  />

                  {/* Hospital Hub (Center) */}
                  <circle cx="300" cy="250" r="44" fill="rgba(0,86,132,0.15)" className="" />
                  <circle cx="300" cy="250" r="22" fill="#005684" stroke="white" strokeWidth="3" />
                  <text x="300" y="255" textAnchor="middle" fill="white" fontSize="16" fontWeight="bold">H</text>

                  {/* Buffer Radius Circle */}
                  <circle cx="300" cy="250" r={commuteBuffer * 16} fill="none" stroke="#005684" strokeWidth="1.5" strokeDasharray="4 4" opacity="0.4" />
                </svg>

                {/* Listing Pins (Interactive overlay) */}
                <div className="absolute inset-0 pointer-events-auto">
                  {filteredListings.slice(0, 8).map((listing, idx) => {
                    const offsets = [
                      { top: '35%', left: '32%' },
                      { top: '48%', left: '60%' },
                      { top: '65%', left: '38%' },
                      { top: '28%', left: '64%' },
                      { top: '58%', left: '20%' },
                      { top: '22%', left: '42%' },
                      { top: '72%', left: '55%' },
                      { top: '40%', left: '75%' },
                    ];
                    const pos = offsets[idx % offsets.length];
                    const isSelected = selectedMapListingId === listing.id;

                    return (
                      <button
                        key={listing.id}
                        type="button"
                        onClick={() => setSelectedMapListingId(listing.id)}
                        style={{ top: pos.top, left: pos.left }}
                        className={`absolute -translate-x-1/2 -translate-y-1/2 px-2.5 py-1 rounded-full text-xs font-extrabold shadow-md transition-all duration-200 ease-in-out cursor-pointer flex items-center gap-1 ${
                          isSelected
                            ? 'bg-[#001848] text-white scale-125 z-20 ring-2 ring-white ring-offset-1'
                            : 'bg-white dark:bg-[#111e33] text-[#001848] dark:text-white hover:scale-110 z-10 border border-[rgba(11,37,89,0.15)]'
                        }`}
                      >
                        <span className="material-symbols-outlined text-[13px] text-amber-500">bed</span>
                        <span>${listing.monthlyRate.toLocaleString()}</span>
                      </button>
                    );
                  })}
                </div>

                {/* Map Floating Zoom Controls */}
                <div className="absolute bottom-4 right-4 flex flex-col gap-1 z-20 bg-white dark:bg-[#111e33] rounded-xl p-1 shadow-md border border-[rgba(11,37,89,0.1)]">
                  <button
                    type="button"
                    onClick={() => setMapZoom(Math.min(mapZoom+ 0.2, 2))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-sm text-[#001848] dark:text-white hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840] rounded"
                  >
                   +
                  </button>
                  <button
                    type="button"
                    onClick={() => setMapZoom(Math.max(mapZoom - 0.2, 0.6))}
                    className="w-7 h-7 flex items-center justify-center font-bold text-sm text-[#001848] dark:text-white hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840] rounded"
                  >
                    −
                  </button>
                </div>
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
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8">
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
              <motion.div layout className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence mode="popLayout">
                  {filteredListings.map((listing) => {
                    const isSaved = savedListingIds.includes(listing.id);
                    return (
                      <motion.div
                        layout
                        key={listing.id}
                        initial={{ opacity: 0, scale: 0.96 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.96 }}
                        transition={{
                          layout: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
                          opacity: { duration: 0.22 },
                        }}
                        className="bg-white dark:bg-[#111e33] rounded-3xl overflow-hidden shadow-sm hover:shadow-lg transition-shadow duration-200 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col justify-between group"
                      >
                        <div className="relative h-56 w-full overflow-hidden bg-gray-100">
                          <img
                            src={listing.images[0]}
                            alt={listing.title}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          />
                          <div className="absolute top-4 left-4 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-black/65 backdrop-blur-xs text-white text-xs font-semibold">
                            <span className="material-symbols-outlined text-[14px]">near_me</span>
                            <span>{listing.distanceBadge || `${listing.driveTimeMinutes} min to hospital`}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => onToggleSave(listing.id)}
                            aria-label="Save listing"
                            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center text-[#001848] dark:text-white hover:scale-110 transition-transform shadow-xs"
                          >
                            <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'text-rose-500 fill-1' : 'text-gray-600 dark:text-gray-300'}`}>
                              favorite
                            </span>
                          </button>
                        </div>

                        <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                          <div>
                            <div className="flex items-center justify-between text-xs text-[#404850] dark:text-[#93ccff] font-bold uppercase tracking-wider mb-1">
                              <span>{listing.propertyType || 'ENTIRE CONDO'}</span>
                              <div className="flex items-center gap-1 text-amber-500">
                                <span className="material-symbols-outlined text-[16px]">star</span>
                                <span className="text-[#001848] dark:text-white font-bold">{listing.nurseRating}</span>
                                <span className="text-gray-400 font-normal">({listing.reviewsCount})</span>
                              </div>
                            </div>

                            <h3 className="text-base font-bold text-[#001848] dark:text-white line-clamp-1 mb-2">
                              {listing.title}
                            </h3>

                            <div className="flex items-baseline gap-1 mb-3">
                              <span className="text-2xl font-black text-[#001848] dark:text-white">
                                ${listing.monthlyRate.toLocaleString()}
                              </span>
                              <span className="text-xs text-[#404850] dark:text-[#93ccff]">/ month</span>
                              <span className="text-[11px] text-[#195b4c] font-bold bg-[#195b4c]/10 px-2 py-0.5 rounded-full ml-auto">
                                $0 Traveler Fee
                              </span>
                            </div>

                            <div className="flex flex-wrap gap-1.5">
                              {(listing.highlightBadges || ['Blackout Curtains', '≤35dB Quiet Daytime', 'In-unit Scrub Washer']).map((badge, idx) => (
                                <span
                                  key={idx}
                                  className="px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f2f3ff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff]"
                                >
                                  {badge}
                                </span>
                              ))}
                            </div>
                          </div>

                          <div className="pt-4 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => setActiveDetailListing(listing)}
                              className="font-bold text-xs sm:text-sm text-[#005684] dark:text-[#93ccff] hover:underline cursor-pointer"
                            >
                              View Stay Details
                            </button>
                            {onRequestToBookListing && (
                              <button
                                type="button"
                                onClick={() => onRequestToBookListing(listing)}
                                className="px-4 py-2 rounded-xl bg-[#001848] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white text-xs font-bold transition-colors cursor-pointer"
                              >
                                Book Sanctuary
                              </button>
                            )}
                          </div>
                        </div>
                      </motion.div>
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
        onRequestToBook={(listing) => {
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

      {/* GSA Stipend Audit Modal */}
      {isGsaModalOpen && (
        <div
          className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/70 backdrop-blur-xs flex justify-center items-start"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsGsaModalOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-lg my-auto bg-white dark:bg-[#111e33] rounded-3xl p-6 sm:p-8 shadow-lg border border-[rgba(11,37,89,0.1)] text-[#001848] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#195b4c] text-[24px]">verified</span>
                <h3 className="font-bold text-base">GSA Per-Diem Stipend Comparison</h3>
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
            <button
              type="button"
              onClick={() => setIsGsaModalOpen(false)}
              className="w-full py-2.5 rounded-xl bg-[#001848] text-white text-xs font-bold mt-2"
            >
              Got It, Continue Search
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
