import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { HousingListing } from '../types';
import { MOCK_LISTINGS, VERIFIED_HOSPITAL_HUBS } from '../data/mockData';
import { db } from '../services/database';
import { ClearedStateData, coverageService } from '../services/coverageService';
import {
  Building2,
  ChevronDown,
  Search,
  Check,
  ArrowUpDown,
  Calendar,
  SlidersHorizontal,
  RefreshCw,
  Map as MapIcon,
  LayoutGrid,
  ListChecks,
  ShieldCheck,
  CheckCircle2,
  FilterX,
  MapPin,
  ChevronUp,
  DollarSign,
  Moon,
  WashingMachine,
} from 'lucide-react';
import { ListingDetailModal } from './ListingDetailModal';
import { HealthcareAmenitiesFilterModal } from './HealthcareAmenitiesFilterModal';
import { SearchListingsSkeleton } from './skeletons/SearchListingsSkeleton';
import { PillowSaveButton } from './PillowSaveButton';
import { SearchListingCard } from './SearchListingCard';
import { GoogleMapsSplitView } from './GoogleMapsSplitView';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { ClinicalDatePicker } from './ClinicalDatePicker';
import { calculateCommuteDuration } from '../lib/googleMapsCommute';

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
  initialState?: string;
  clearedStates?: ClearedStateData[];
  isLoading?: boolean;
}

const formatDateFriendly = (dateStr: string) => {
  if (!dateStr) return 'Select date';
  try {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  } catch {
    return dateStr;
  }
};

export const SearchListingsView: React.FC<SearchListingsViewProps> = React.memo(({
  isNightShiftMode,
  savedListingIds,
  onToggleSave,
  isVerified,
  onGoToVerification,
  onRequestToBookListing,
  initialHospital = 'Duke University Hospital (Durham, NC)',
  initialDuration = '13',
  initialRadius = 5,
  initialState = 'ALL',
  clearedStates,
  isLoading,
}) => {
  const [selectedHospital, setSelectedHospital] = useState(initialHospital);

  useEffect(() => {
    if (initialHospital) {
      setSelectedHospital(initialHospital);
    }
  }, [initialHospital]);

  // Dynamic cleared states from database or props
  const [statesList, setStatesList] = useState<ClearedStateData[]>(clearedStates || []);
  useEffect(() => {
    if (clearedStates && clearedStates.length > 0) {
      setStatesList(clearedStates);
    } else {
      coverageService.fetchClearedStates().then((data) => {
        if (data && data.length > 0) setStatesList(data);
      });
    }
  }, [clearedStates]);

  // Regional cleared state filter (ALL, NC, MD, CT, ND, KS, and any future cleared states)
  const [selectedStateFilter, setSelectedStateFilter] = useState<string>(initialState || 'ALL');

  useEffect(() => {
    if (initialState) {
      setSelectedStateFilter(initialState);
    }
  }, [initialState]);

  const handleSelectState = (stateCode: string) => {
    setSelectedStateFilter(stateCode);
    if (stateCode !== 'ALL') {
      const stateObj = statesList.find((s) => s.code.toUpperCase() === stateCode.toUpperCase());
      if (stateObj && stateObj.topFacilities && stateObj.topFacilities.length > 0) {
        setSelectedHospital(stateObj.topFacilities[0]);
      }
    }
  };

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState('');
  const [commuteBuffer, setCommuteBuffer] = useState<number>(initialRadius);
  const isInitialCustom = !['4', '8', '13', '26'].includes(initialDuration);
  const [selectedDuration, setSelectedDuration] = useState(isInitialCustom ? 'custom' : initialDuration);
  const [customDuration, setCustomDuration] = useState<number>(isInitialCustom ? parseInt(initialDuration) : 1);
  const [earliestCheckIn, setEarliestCheckIn] = useState('2026-10-05');
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
    { miles: 1, label: '1 mi', desc: 'Shift walk / immediate' },
    { miles: 3, label: '3 mi', desc: 'Shift walk/bike' },
    { miles: 5, label: '5 mi', desc: 'Quick commute' },
    { miles: 10, label: '10 mi', desc: 'Suburban retreat' },
    { miles: 15, label: '15+ mi', desc: 'Max value radius' },
  ];

  const popularHubs = useMemo(() => {
    const facilities: string[] = [];
    statesList.forEach((st) => {
      if (st.topFacilities) {
        facilities.push(...st.topFacilities);
      }
    });
    return Array.from(new Set([...facilities, ...VERIFIED_HOSPITAL_HUBS]));
  }, [statesList]);

  const filteredHospitals = useMemo(() => {
    if (!hospitalSearchQuery.trim()) return popularHubs;
    const q = hospitalSearchQuery.toLowerCase();
    return popularHubs.filter((h) => h.toLowerCase().includes(q));
  }, [hospitalSearchQuery, popularHubs]);

  // Filter listings based on current settings
  const filteredListings = useMemo(() => {
    // In a real app we would receive real properties from App via context/props.
    // For now we map to the existing mock to preserve the component.
    const dbListings = db.getListings() || [];
    let list = dbListings.length > 0 ? dbListings : [...MOCK_LISTINGS];

    // Filter by Region / Cleared State (data-driven)
    if (selectedStateFilter && selectedStateFilter !== 'ALL') {
      list = list.filter((l: HousingListing) => l.state?.toUpperCase() === selectedStateFilter.toUpperCase());
    }

    // Filter by quick chip
    if (activeFilterChip === 'entire') {
      list = list.filter((l: HousingListing) => l.propertyType?.toLowerCase().includes('entire') || l.propertyType?.toLowerCase().includes('condo'));
    } else if (activeFilterChip === 'private') {
      list = list.filter((l: HousingListing) => l.propertyType?.toLowerCase().includes('room') || l.propertyType?.toLowerCase().includes('suite') || l.propertyType?.toLowerCase().includes('studio'));
    } else if (activeFilterChip === 'blackout') {
      list = list.filter((l: HousingListing) => l.highlightBadges?.some((b: string) => b.toLowerCase().includes('blackout')) || l.amenities?.blackoutCurtains);
    } else if (activeFilterChip === 'laundry') {
      list = list.filter((l: HousingListing) => l.highlightBadges?.some((b: string) => b.toLowerCase().includes('washer') || b.toLowerCase().includes('laundry')) || l.amenities?.washerDryerInUnit);
    } else if (activeFilterChip === 'parking') {
      list = list.filter((l: HousingListing) => l.highlightBadges?.some((b: string) => b.toLowerCase().includes('parking')) || l.amenities?.dedicatedParking);
    }

    // Filter by Commute Radius (1-15+ miles)
    if (commuteBuffer && commuteBuffer < 15) {
      list = list.filter((l: HousingListing) => {
        const commute = calculateCommuteDuration(l, selectedHospital);
        return commute.distanceMiles <= commuteBuffer;
      });
    }

    // Filter by Assignment Duration (4, 8, 13, 26 weeks)
    const targetWeeks = selectedDuration === 'custom' ? (customDuration || 13) : parseInt(selectedDuration, 10);
    if (targetWeeks) {
      list = list.filter((l: HousingListing) => {
        const minWeeks = l.minWeeks || ((l.propertyType?.toLowerCase().includes('entire') || l.propertyType?.toLowerCase().includes('condo')) ? 8 : 4);
        const maxWeeks = l.maxWeeks || 52;
        if (targetWeeks < minWeeks || targetWeeks > maxWeeks) return false;
        return true;
      });
    }

    // Extended filter criteria from panel
    if (maxPrice < 3500) {
      list = list.filter((l: HousingListing) => l.monthlyRate <= maxPrice);
    }
    if (minRating > 0) {
      list = list.filter((l: HousingListing) => l.nurseRating >= minRating);
    }
    if (filterBlackout) {
      list = list.filter((l: HousingListing) => l.amenities?.blackoutCurtains || l.highlightBadges?.some((b: string) => b.toLowerCase().includes('blackout')));
    }
    if (filterScrubWasher) {
      list = list.filter((l: HousingListing) => l.amenities?.washerDryerInUnit || l.highlightBadges?.some((b: string) => b.toLowerCase().includes('washer') || b.toLowerCase().includes('laundry')));
    }
    if (filterQuietDay) {
      list = list.filter((l: HousingListing) => l.amenities?.daySleeperQuietHours === true || l.highlightBadges?.some((b: string) => b.toLowerCase().includes('quiet') || b.toLowerCase().includes('day-sleeper')));
    }
    if (filterSoundMachine) {
      list = list.filter((l: HousingListing) => l.amenities?.whiteNoiseMachine);
    }
    if (filterDedicatedParking) {
      list = list.filter((l: HousingListing) => l.amenities?.dedicatedParking || l.highlightBadges?.some((b: string) => b.toLowerCase().includes('parking')));
    }
    if (filterPetFriendly) {
      list = list.filter((l: HousingListing) => l.amenities?.petFriendly);
    }
    if (filterContractFlex) {
      list = list.filter((l: HousingListing) => l.contractFlexProtection);
    }

    // Sort listings
    if (sortOption === 'closest') {
      list.sort((a: HousingListing, b: HousingListing) => a.driveTimeMinutes - b.driveTimeMinutes);
    } else if (sortOption === 'price_low') {
      list.sort((a: HousingListing, b: HousingListing) => a.monthlyRate - b.monthlyRate);
    } else if (sortOption === 'quiet_score') {
      list.sort((a: HousingListing, b: HousingListing) => b.nurseRating - a.nurseRating);
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
    commuteBuffer,
    selectedDuration,
    customDuration,
    selectedHospital,
    selectedStateFilter,
  ]);

  const selectedMapListing = useMemo(() => {
    return MOCK_LISTINGS.find((l: HousingListing) => l.id === selectedMapListingId) || filteredListings[0] || MOCK_LISTINGS[0];
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
                  <Building2 className="w-4 h-4 text-[#0A6FA8] dark:text-[#3E9AD1] shrink-0" />
                  <span className="text-xs sm:text-sm font-semibold text-[#0B2559] dark:text-white truncate">
                    {selectedHospital}
                  </span>
                </div>
                <ChevronDown
                  className={`w-4 h-4 text-[#404850] dark:text-[#93ccff] shrink-0 transition-transform duration-200 group-hover:text-[#0A6FA8] ${
                    isDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </div>

              <AnimatePresence>
                {isDropdownOpen && (
                  <motion.div
                    initial={{ opacity: 0, y: -4, scale: 0.98 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -4, scale: 0.98 }}
                    transition={{ duration: 0.16, ease: 'easeOut' }}
                    className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-[#15233a] rounded-xl shadow-md z-50 border border-[#c0c7d1]/40 dark:border-[#2b4162] overflow-hidden flex flex-col max-w-lg"
                  >
                    {/* Quick search input */}
                    <div className="p-2 border-b border-[#c0c7d1]/20 dark:border-[#2b4162] bg-[#f8faff] dark:bg-[#111e33]">
                      <div className="relative">
                        <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-gray-400" />
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
                            className={`px-3 py-2 text-xs font-semibold hover:bg-[#f2f3ff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#f2f3ff] dark:hover:bg-[#1f3350] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1f3350] cursor-pointer flex items-center justify-between transition-colors ${
                              selectedHospital === hosp ? 'bg-[#eaedff] dark:bg-[#1f3350] text-[#005684]' : 'text-[#001848] dark:text-white'
                            }`}
                          >
                            <span className="truncate pr-2">{hosp}</span>
                            {selectedHospital === hosp ? (
                              <Check className="w-3.5 h-3.5 text-[#195b4c] shrink-0" />
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
                      <span className="flex items-center gap-1">
                        <ArrowUpDown className="w-3 h-3" />
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
              className={`h-10 px-3 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-200 ease-in-out duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                isAssignmentDrawerExpanded
                  ? 'bg-[#0A6FA8] text-white shadow-xs'
                  : 'bg-[#EFF6FB] dark:bg-[#182840] text-[#0B2559] dark:text-[#E6ECF7] hover:bg-[#e2edf7] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#e2edf7] dark:hover:bg-[#20324e] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#20324e]'
              }`}
              title="Edit move-in date, contract rotation length, or commute radius"
            >
              <Calendar className="w-4 h-4 text-[#0A6FA8] dark:text-[#3E9AD1]" />
              <span>
                {formatDateFriendly(earliestCheckIn)} · {selectedDuration === 'custom' ? `${customDuration} wks` : `${selectedDuration} wks`} · {commuteBuffer} mi
              </span>
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isAssignmentDrawerExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Clinical Filters Trigger (Progressive Disclosure) */}
            <button
              type="button"
              id="toggle-filter-panel-button"
              onClick={() => {
                setIsFilterPanelExpanded((prev) => !prev);
                if (isAssignmentDrawerExpanded) setIsAssignmentDrawerExpanded(false);
              }}
              className={`h-10 px-3.5 rounded-xl text-xs font-semibold inline-flex items-center gap-1.5 transition-all duration-200 ease-in-out duration-200 cursor-pointer whitespace-nowrap shrink-0 ${
                isFilterPanelExpanded || activePanelFilterCount > 0
                  ? 'bg-[#001848] text-white shadow-xs'
                  : 'bg-[#EFF6FB] dark:bg-[#182840] text-[#0B2559] dark:text-[#E6ECF7] hover:bg-[#e2edf7] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#e2edf7] dark:hover:bg-[#20324e] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#20324e]'
              }`}
              title="Filter by rent ceiling, day-sleeper quiet score, and shift logistics"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>Filters</span>
              {activePanelFilterCount > 0 && (
                <span className="w-4 h-4 rounded-full bg-white text-[#001848] text-[10px] flex items-center justify-center font-extrabold shadow-2xs">
                  {activePanelFilterCount}
                </span>
              )}
              <ChevronDown
                className={`w-4 h-4 transition-transform duration-200 ${
                  isFilterPanelExpanded ? 'rotate-180' : ''
                }`}
              />
            </button>

            {/* Quick Actions & Layout Toggle (Right-aligned) */}
            <div className="flex items-center gap-1.5 ml-auto shrink-0">
              <button
                type="button"
                onClick={triggerLiveQueryRefresh}
                disabled={isDataLoading}
                title="Refresh listings for assigned campus"
                aria-label="Refresh listings for assigned campus"
                className="h-9 w-9 rounded-xl bg-[#EFF6FB] dark:bg-[#182840] hover:bg-[#e2edf7] dark:hover:bg-[#20324e] text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center cursor-pointer transition-colors"
              >
                <RefreshCw className={`w-4 h-4 ${isDataLoading ? 'animate-spin' : ''}`} />
              </button>

              <div className="inline-flex items-center p-0.5 rounded-xl bg-[#EFF6FB] dark:bg-[#182840]">
                <button
                  type="button"
                  onClick={() => setViewMode('split-map')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all duration-200 ease-in-out duration-150 ${
                    viewMode === 'split-map'
                      ? 'bg-white dark:bg-[#0B2559] text-[#001848] dark:text-white shadow-xs'
                      : 'text-[#404850] dark:text-[#c0c7d1]'
                  }`}
                  title="View split map and listings"
                >
                  <MapIcon className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Split Map</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewMode('grid')}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1 cursor-pointer transition-all duration-200 ease-in-out duration-150 ${
                    viewMode === 'grid'
                      ? 'bg-white dark:bg-[#0B2559] text-[#001848] dark:text-white shadow-xs'
                      : 'text-[#404850] dark:text-[#c0c7d1]'
                  }`}
                  title="View full grid layout"
                >
                  <LayoutGrid className="w-3.5 h-3.5" />
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
                className="border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] pt-3 pb-1 px-1 -mx-1"
              >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3 rounded-2xl bg-[#EFF6FB]/60 dark:bg-[#15233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  {/* Move-in Date */}
                  <div>
                    <ClinicalDatePicker
                      value={earliestCheckIn}
                      onChange={setEarliestCheckIn}
                      label="Earliest Move-In"
                      subLabel="Shift Start"
                      isNightShiftMode={isNightShiftMode}
                    />
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
                              : 'bg-white dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#1f3350] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1f3350] border border-[rgba(11,37,89,0.08)]'
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
                              : 'bg-white dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#1f3350] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1f3350] border border-[rgba(11,37,89,0.08)]'
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

          {/* Regional Cleared State Filter Bar (Synchronized with interactive footer map) */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 pb-1 custom-scrollbar text-xs border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]/60" role="group" aria-label="Filter listings by cleared state">
            <span className="text-[11px] font-bold text-[#0B2559]/70 dark:text-[#E6ECF7]/70 uppercase tracking-wider flex items-center gap-1 shrink-0 mr-1">
              <MapPin className="w-3.5 h-3.5 text-[#0A6FA8] dark:text-[#3E9AD1]" />
              <span>State:</span>
            </span>
            <button
              type="button"
              onClick={() => handleSelectState('ALL')}
              aria-pressed={selectedStateFilter === 'ALL'}
              className={`px-3 py-1 rounded-full whitespace-nowrap font-semibold text-xs transition-colors cursor-pointer border ${
                selectedStateFilter === 'ALL'
                  ? 'bg-[#0A6FA8] text-white border-[#0A6FA8] shadow-xs'
                  : 'bg-[#EFF6FB] dark:bg-[#182840] text-[#0B2559] dark:text-[#c0c7d1] border-transparent hover:border-[#0A6FA8]'
              }`}
            >
              All Cleared States
            </button>
            {statesList.map((st) => {
              const isSelected = selectedStateFilter.toUpperCase() === st.code.toUpperCase();
              return (
                <button
                  key={st.code}
                  type="button"
                  onClick={() => handleSelectState(st.code)}
                  aria-pressed={isSelected}
                  className={`px-3 py-1 rounded-full whitespace-nowrap font-semibold text-xs transition-colors cursor-pointer border flex items-center gap-1 ${
                    isSelected
                      ? 'bg-[#0B2559] text-white border-[#0B2559] shadow-xs'
                      : 'bg-[#EFF6FB] dark:bg-[#182840] text-[#0B2559] dark:text-[#c0c7d1] border-transparent hover:border-[#0B2559]'
                  }`}
                >
                  <span className="font-bold">{st.code}</span>
                  <span className="text-[10px] opacity-75">· {st.name}</span>
                  {st.isLaunchHub && (
                    <span className="w-1.5 h-1.5 rounded-full bg-[#F1CF78]" title="Primary Launch Hub" />
                  )}
                </button>
              );
            })}
          </div>

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
                    onClick={() => setActiveFilterChip(chip.id as 'all' | 'entire' | 'private' | 'blackout' | 'laundry' | 'parking')}
                    className={`px-3 py-1 rounded-full whitespace-nowrap font-medium text-xs transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#0B2559] text-white shadow-2xs'
                        : 'bg-[#EFF6FB] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-[#e2edf7] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#e2edf7] dark:hover:bg-[#20324e] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#20324e]'
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
                className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold text-[#0A6FA8] dark:text-[#3E9AD1] hover:bg-[#EFF6FB] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#EFF6FB] dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840] transition-colors cursor-pointer ml-1"
                title="Open comprehensive 25-point clinical amenities checklist"
              >
                <ListChecks className="w-3.5 h-3.5" />
                <span>25-Pt Checklist</span>
              </button>
            </div>

            <div className="hidden lg:flex items-center gap-1 text-[11px] font-bold text-[#195b4c] dark:text-[#aff0db] shrink-0 bg-[#195b4c]/10 dark:bg-[#aff0db]/10 px-2.5 py-1 rounded-full">
              <ShieldCheck className="w-3.5 h-3.5" />
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
                    height: { duration: 0.3, ease: [0.16, 1, 0.3, 1] },
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
                        <SlidersHorizontal className="w-3.5 h-3.5" />
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
                          <RefreshCw className="w-3.5 h-3.5" />
                          <span className="group-hover:underline">Reset ({activePanelFilterCount})</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={() => setIsFilterModalOpen(true)}
                        className="inline-flex items-center gap-1 text-xs font-semibold text-[#005684] dark:text-[#93ccff] cursor-pointer group"
                      >
                        <ListChecks className="w-3.5 h-3.5" />
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
                            <DollarSign className="w-4 h-4 text-[#005684] dark:text-[#93ccff]" />
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
                                  : 'bg-[#f2f3ff] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff]'
                              }`}
                            >
                              {preset === 3500 ? 'Any' : `$${preset / 1000}k`}
                            </button>
                          ))}
                        </div>
                      </div>

                      <div className="text-[10px] text-[#195b4c] dark:text-[#aff0db] bg-[#195b4c]/10 dark:bg-[#aff0db]/10 px-2.5 py-1.5 rounded-lg flex items-center gap-1.5 font-semibold">
                        <ShieldCheck className="w-3.5 h-3.5" />
                        <span>$0 Traveler Booking Fee on all contracts</span>
                      </div>
                    </div>

                    {/* 2. Clinical Sleep & Acoustic Quality */}
                    <div className="p-4 rounded-2xl bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-2xs flex flex-col justify-between gap-3">
                      <div>
                        <div className="flex items-center justify-between text-xs font-bold text-[#001848] dark:text-white mb-2">
                          <span className="flex items-center gap-1.5">
                            <Moon className="w-4 h-4 text-[#005684] dark:text-[#93ccff]" />
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
                                  : 'bg-[#f2f3ff] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff]'
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
                            <WashingMachine className="w-4 h-4 text-[#005684] dark:text-[#93ccff]" />
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
                      <ChevronUp className="w-3.5 h-3.5" />
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
                    onChange={(e) => setSortOption(e.target.value as 'closest' | 'price_low' | 'quiet_score')}
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
                    <FilterX className="w-6 h-6" aria-hidden="true" />
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
                    className="mt-2 px-4 py-2 rounded-xl bg-[#0A6FA8] text-white text-xs font-bold hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] transition-colors shadow-xs cursor-pointer"
                  >
                    Reset All Filters
                  </button>
                </motion.div>
              ) : (
                <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <AnimatePresence >
                    {filteredListings.map((listing) => {
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
                  <MapIcon className="w-4 h-4 text-[#005684] dark:text-[#3E9AD1]" aria-hidden="true" />
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
                  onSelectListing={(listing: HousingListing) => {
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
                        <CheckCircle2 className="w-3.5 h-3.5" aria-hidden="true" />
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
                  onChange={(e) => setSortOption(e.target.value as 'closest' | 'price_low' | 'quiet_score')}
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
                  <FilterX className="w-7 h-7" aria-hidden="true" />
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
                  className="mt-2 px-5 py-2.5 rounded-xl bg-[#0A6FA8] text-white text-xs font-bold hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] transition-colors shadow-xs cursor-pointer"
                >
                  Reset All Filters
                </button>
              </motion.div>
            ) : (
              <motion.div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <AnimatePresence >
                  {filteredListings.map((listing) => {
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
        onClose={useCallback(() => setActiveDetailListing(null), [])}
        isNightShiftMode={isNightShiftMode}
        isSaved={activeDetailListing ? savedListingIds.includes(activeDetailListing.id) : false}
        onToggleSave={onToggleSave}
        isVerified={isVerified}
        onGoToVerification={onGoToVerification}
        selectedHospital={selectedHospital}
        onRequestToBook={useCallback((listing: HousingListing) => {
          setActiveDetailListing(null);
          onRequestToBookListing?.(listing);
        }, [onRequestToBookListing])}
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
          className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/70 backdrop-blur-xs flex justify-center items-center"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setIsGsaModalOpen(false);
            }
          }}
        >
          <div
            className="w-full max-w-lg my-auto bg-white dark:bg-[#111e33] rounded-3xl p-6 sm:p-8 shadow-lg border border-[rgba(11,37,89,0.08)] dark:border-[#233550] text-[#001848] dark:text-white"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 dark:border-gray-800">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-6 h-6 text-[#195b4c] shrink-0" aria-hidden="true" />
                <div>
                  <h3 className="font-bold text-base">GSA Per-Diem Stipend Comparison</h3>
                  <span className="text-[10px] text-gray-500 dark:text-gray-400">Federal Lodging Allowance Analysis</span>
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
              <p>
                Under IRS Revenue Procedure guidelines, traveling healthcare professionals can receive tax-free housing stipends when duplicating expenses away from their tax home.
              </p>
              <div className="p-4 rounded-xl bg-[#EFF6FB] dark:bg-[#182840] space-y-2">
                <div className="flex justify-between font-bold text-sm text-[#001848] dark:text-white">
                  <span>Standard Regional Lodging Cap:</span>
                  <span>$2,850 / month</span>
                </div>
                <div className="flex justify-between text-xs text-[#195b4c] font-semibold">
                  <span>Nurses Pillow Average Rent:</span>
                  <span>$1,950 / month</span>
                </div>
                <div className="flex justify-between text-xs font-bold text-[#005684] dark:text-[#93ccff] pt-1 border-t border-gray-200 dark:border-gray-700">
                  <span>Estimated Stipend Surplus:</span>
                  <span>+$900 / month retained</span>
                </div>
              </div>
              <p className="text-[11px] text-gray-500">
                Itemized invoices with facility proximity and quiet guarantees generate automatically in your clinician portal.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsGsaModalOpen(false)}
                className="w-full py-2.5 rounded-xl bg-[#001848] text-white text-xs font-bold cursor-pointer hover:bg-[#0A6FA8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] transition-colors"
              >
                Close Comparison
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
});
