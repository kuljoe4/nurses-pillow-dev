import React, { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { HousingListing } from '../types';
import { MOCK_LISTINGS, VERIFIED_HOSPITAL_HUBS } from '../data/mockData';
import { ListingDetailModal } from './ListingDetailModal';
import { PillowSaveButton } from './PillowSaveButton';
import { GoogleHospitalAutocomplete } from './GoogleHospitalAutocomplete';
import {
  heroContainerVariant,
  heroItemVariant,
  heroSearchCardVariant,
} from '../lib/animation-utilities';
import { GoogleMapsTravelTimeDisplay } from './GoogleMapsTravelTimeDisplay';
import { calculateCommuteDuration } from '../lib/googleMapsCommute';
import { ClinicalDatePicker } from './ClinicalDatePicker';

interface ObservedListingCardProps {
  listing: HousingListing;
  index: number;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onSelectListing: (listing: HousingListing) => void;
  onRequestToBook?: (listing: HousingListing) => void;
  shouldReduceMotion?: boolean | null;
  selectedHospital?: string;
  isNightShiftMode?: boolean;
}

/**
 * ObservedListingCard uses lightweight viewport detection
 * with smooth GPU-friendly transform and opacity transitions.
 * Integrates Google Maps-powered commute duration to user's selected hospital.
 */
const ObservedListingCard: React.FC<ObservedListingCardProps> = React.memo(({
  listing,
  index,
  isSaved,
  onToggleSave,
  onSelectListing,
  onRequestToBook,
  shouldReduceMotion,
  selectedHospital = 'Duke University Hospital',
  isNightShiftMode = false,
}) => {
  // ⚡ Bolt Performance Optimization: Wrapped with useCallback to provide a stable reference
  // to PillowSaveButton which is wrapped in React.memo, preventing unnecessary re-renders.
  const handleToggleSave = useCallback(() => {
    onToggleSave(listing.id);
  }, [onToggleSave, listing.id]);

  // Dynamically calculate commute metrics to the user's selected hospital
  const commute = useMemo(() => {
    return calculateCommuteDuration(listing, selectedHospital);
  }, [listing, selectedHospital]);

  return (
    <motion.div
      initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
      whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-30px' }}
      transition={{
        duration: 0.3,
        delay: shouldReduceMotion ? 0 : (index % 3) * 0.08,
        ease: [0.16, 1, 0.3, 1],
      }}
      className="bg-white dark:bg-[#111e33] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-shadow duration-200 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col justify-between group"
    >
      {/* Image Header */}
      <div className="relative h-60 w-full overflow-hidden bg-gray-100">
        <img
          src={listing.images[0]}
          alt={listing.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {/* Dynamic Google Maps Commute Badge on Image */}
        <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/75 backdrop-blur-xs text-white text-xs font-semibold shadow-md">
          <span className="material-symbols-outlined text-[14px] text-[#aff0db]">directions_car</span>
          <span className="tabular-nums">{commute.driveMinutes} min drive</span>
          <span className="opacity-60">·</span>
          <span className="tabular-nums opacity-90">{commute.distanceMiles} mi</span>
        </div>
        <div className="absolute top-4 right-4 z-10">
          <PillowSaveButton
            isSaved={isSaved}
            onToggle={handleToggleSave}
            className="w-10 h-10 rounded-full bg-white/95 dark:bg-[#111e33]/90 shadow-md backdrop-blur-xs"
            size={20}
          />
        </div>
      </div>

      {/* Content */}
      <div className="p-6 flex-1 flex flex-col justify-between gap-4">
        <div className="space-y-3">
          <div className="flex items-center justify-between text-xs text-[#404850] dark:text-[#93ccff] font-bold uppercase tracking-wider">
            <span>{listing.propertyType || 'ENTIRE CONDO'}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <span className="material-symbols-outlined text-[16px]">star</span>
              <span className="text-[#001848] dark:text-white font-bold">{listing.nurseRating}</span>
              <span className="text-gray-400 font-normal">({listing.reviewsCount})</span>
            </div>
          </div>

          <h3 className="text-base font-bold text-[#001848] dark:text-white line-clamp-1 group-hover:text-[#005684] focus-visible:text-[#005684] transition-colors">
            {listing.title}
          </h3>

          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-black text-[#001848] dark:text-white tabular-nums">
              ${listing.monthlyRate.toLocaleString()}
            </span>
            <span className="text-xs text-[#404850] dark:text-[#93ccff]">/ month</span>
            <span className="text-[11px] text-[#195b4c] font-bold bg-[#195b4c]/10 px-2 py-0.5 rounded-full ml-auto">
              $0 Traveler Fee
            </span>
          </div>

          {/* Google Maps-Powered Travel Time Module */}
          <GoogleMapsTravelTimeDisplay
            commute={commute}
            isNightShiftMode={isNightShiftMode}
          />

          <div className="flex flex-wrap gap-1.5 pt-1">
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

        {/* Actions */}
        <div className="pt-4 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex items-center justify-between gap-2">
          <button
            type="button"
            onClick={() => onSelectListing(listing)}
            className="font-bold text-xs sm:text-sm text-[#005684] dark:text-[#93ccff] hover:underline cursor-pointer"
          >
            View Stay Details
          </button>
          {onRequestToBook && (
            <button
              type="button"
              onClick={() => onRequestToBook(listing)}
              className="px-4 py-2 rounded-xl bg-[#001848] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white text-xs font-bold transition-colors cursor-pointer"
            >
              Book Sanctuary
            </button>
          )}
        </div>
      </div>
    </motion.div>
  );
});

interface FindHousingViewProps {
  isNightShiftMode: boolean;
  savedListingIds: string[];
  onToggleSave: (id: string) => void;
  isVerified: boolean;
  onGoToVerification: () => void;
  onGoToEmailVerification?: () => void;
  onGoToPhoneVerification?: () => void;
  onRequestToBookListing?: (listing: HousingListing) => void;
  onGoToSearchListings: (params?: { hospital?: string; duration?: string; radius?: number; checkInDate?: string; checkOutDate?: string }) => void;
  onGoToHostPortal?: () => void;
  userRole?: string;
  userName?: string;
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

export const FindHousingView: React.FC<FindHousingViewProps> = ({
  isNightShiftMode,
  savedListingIds,
  onToggleSave,
  isVerified,
  onGoToVerification,
  onRequestToBookListing,
  onGoToSearchListings,
  onGoToHostPortal,
  userRole,
  userName,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [selectedHospital, setSelectedHospital] = useState('Duke University Hospital - Durham, NC');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [hospitalSearchQuery, setHospitalSearchQuery] = useState('');
  const [commuteBuffer, setCommuteBuffer] = useState<number>(5);
  const [selectedDuration, setSelectedDuration] = useState('13');
  const [customDuration, setCustomDuration] = useState<number>(1);
  const [earliestCheckIn, setEarliestCheckIn] = useState('2026-10-05');
  const [latestCheckOut, setLatestCheckOut] = useState('');
  const [dateValidationError, setDateValidationError] = useState('');
  const [isCustomizingAssignment, setIsCustomizingAssignment] = useState(false);
  const [activeListingFilter, setActiveListingFilter] = useState<'all' | 'close' | 'quiet' | 'laundry' | 'pets'>('all');
  const [activeProtectionTab, setActiveProtectionTab] = useState<'clinicians' | 'hosts'>(
    userRole === 'host' ? 'hosts' : 'clinicians'
  );
  const [activeDetailListing, setActiveDetailListing] = useState<HousingListing | null>(null);

  // ⚡ Bolt Performance Optimization: Wrapped with useCallback to provide a stable reference
  // to child components like ObservedListingCard that use React.memo,
  // preventing unnecessary re-renders when FindHousingView re-renders.
  const handleSelectListing = useCallback((listing: HousingListing) => {
    setActiveDetailListing(listing);
  }, []);

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
    { label: 'Custom Dates', value: 'customDates' },
  ];

  const commuteOptions = [
    { miles: 3, label: '3 miles', desc: 'Shift walk/bike' },
    { miles: 5, label: '5 miles', desc: 'Quick commute' },
    { miles: 10, label: '10 miles', desc: 'Suburban retreat' },
    { miles: 15, label: '15 miles', desc: 'Max value radius' },
  ];

  const popularHubs = VERIFIED_HOSPITAL_HUBS;

  const filteredHospitals = useMemo(() => {
    if (!hospitalSearchQuery.trim()) return popularHubs;
    const q = hospitalSearchQuery.toLowerCase();
    return popularHubs.filter((h) => h.toLowerCase().includes(q));
  }, [hospitalSearchQuery, popularHubs]);

  // Curated Featured Listings for the Home Page
  const featuredListings = useMemo(() => {
    return MOCK_LISTINGS.slice(0, 6);
  }, []);

  const displayedFeaturedListings = useMemo(() => {
    if (activeListingFilter === 'close') {
      return featuredListings.filter((l) => (l.driveTimeMinutes || 10) <= 6 || (l.distanceBadge && l.distanceBadge.includes('0.')));
    }
    if (activeListingFilter === 'quiet') {
      return featuredListings.filter(
        (l) =>
          l.amenities?.daySleeperQuietHours ||
          l.amenities?.blackoutCurtains ||
          l.highlightBadges?.some((b) => b.includes('Quiet') || b.includes('dB') || b.includes('Blackout'))
      );
    }
    if (activeListingFilter === 'laundry') {
      return featuredListings.filter(
        (l) =>
          l.amenities?.washerDryerInUnit ||
          l.highlightBadges?.some((b) => b.toLowerCase().includes('laundry'))
      );
    }
    if (activeListingFilter === 'pets') {
      return featuredListings.filter((l) => l.amenities?.petFriendly);
    }
    return featuredListings;
  }, [featuredListings, activeListingFilter]);

  const handleExecuteSearch = useCallback(() => {
    setDateValidationError('');
    // Validate custom dates if selected
    if (selectedDuration === 'customDates') {
      if (!earliestCheckIn || !latestCheckOut) {
        setDateValidationError('Both check-in and check-out dates are required.');
        return;
      }
      if (new Date(latestCheckOut) <= new Date(earliestCheckIn)) {
        setDateValidationError('Check-out date must be after check-in date.');
        return;
      }
    }

    onGoToSearchListings({
      hospital: selectedHospital,
      duration: selectedDuration === 'custom' ? customDuration.toString() : selectedDuration === 'customDates' ? 'customDates' : selectedDuration,
      radius: commuteBuffer,
      checkInDate: earliestCheckIn,
      checkOutDate: selectedDuration === 'customDates' ? latestCheckOut : undefined,
    });
  }, [selectedHospital, selectedDuration, customDuration, commuteBuffer, earliestCheckIn, latestCheckOut, onGoToSearchListings]);

  return (
    <div className={`w-full transition-colors ${isNightShiftMode ? 'bg-[#08101C] text-[#E6ECF7]' : 'bg-[#faf8ff] text-[#001848]'}`}>
      {/* 1. HERO SECTION & ASSIGNMENT CARD */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-12 pt-6 sm:pt-10 lg:pt-12 pb-12 sm:pb-16 lg:pb-20">
        {/* Soft Ambient Radial Accents (zero blur-filter rasterization overhead) */}
        <div
          className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full pointer-events-none opacity-60 dark:opacity-40"
          style={{
            background: 'radial-gradient(circle, rgba(10, 111, 168, 0.15) 0%, transparent 70%)',
          }}
        />
        <div
          className="absolute top-1/2 -right-32 w-[520px] h-[520px] rounded-full pointer-events-none opacity-50 dark:opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(25, 91, 76, 0.15) 0%, transparent 70%)',
          }}
        />

        <motion.div
          variants={shouldReduceMotion ? undefined : heroContainerVariant}
          initial={shouldReduceMotion ? undefined : 'hidden'}
          animate={shouldReduceMotion ? undefined : 'visible'}
          className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10"
        >
          {/* Host Perspective Notice when logged in as Host */}
          {userRole === 'host' && (
            <div className="mb-6 w-full max-w-2xl px-4 py-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-lg">home</span>
                <span className="font-bold">Active Perspective: Property Host ({userName || 'Michael Vance'})</span>
              </div>
              {onGoToHostPortal && (
                <button
                  type="button"
                  onClick={onGoToHostPortal}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-amber-700 text-white font-bold transition-all duration-200 ease-in-out shadow-xs cursor-pointer flex items-center gap-1 shrink-0"
                >
                  <span>Go to Host Portal</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              )}
            </div>
          )}

          {/* Brand Script Greeting */}
          <motion.div
            variants={heroItemVariant}
            className="flex justify-center mb-3"
          >
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/80 dark:bg-[#111e33]/80 border border-[#F1CF78]/60 shadow-[0_2px_8px_rgba(11,37,89,0.06)] backdrop-blur-xs cursor-default select-none transition-transform hover:scale-[1.02]">
              <img src="/nurses-pillow-logo.png" alt="Nurses Pillow" className="w-5 h-5 object-contain drop-shadow-xs" />
              <span
                className="text-[26px] sm:text-[30px] leading-tight text-[#745b0d] dark:text-[#E4C36D]"
                style={{ fontFamily:"'Kaushan Script', cursive" }}
              >
                Rest Well. Heal Better.
              </span>
              <span className="w-2 h-2 rounded-full bg-[#195b4c] dark:bg-[#aff0db]" />
            </div>
          </motion.div>

          {/* Main Headline */}
          <motion.h1
            variants={heroItemVariant}
            className="text-3xl sm:text-4xl lg:text-[46px] lg:leading-[54px] font-bold text-[#001848] dark:text-white max-w-4xl tracking-tight mb-4"
          >
            Find your home near your next assignment.
          </motion.h1>

          {/* Subtitle */}
          <motion.p
            variants={heroItemVariant}
            className="text-base sm:text-lg text-[#404850] dark:text-[#c0c7d1] max-w-2xl leading-relaxed mb-8"
          >
            Curated furnished quiet spaces vetted for day-sleepers, shift schedules, and contract flexibility.
          </motion.p>

          {/* Signature Assignment Card (Dominant Raised Surface per AGENTS.md) */}
          <motion.div
            variants={heroSearchCardVariant}
            className="w-full max-w-4xl bg-white dark:bg-[#111e33] rounded-[24px] p-6 sm:p-8 shadow-[0_12px_36px_rgba(11,37,89,0.08)] dark:shadow-[0_12px_36px_rgba(0,0,0,0.4)] text-left relative border border-[rgba(11,37,89,0.08)] dark:border-[#233550]"
          >
            {/* Header info bar */}
            <div className="flex flex-wrap items-center justify-between pb-4 mb-5 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] gap-3">
              <div className="flex items-center gap-2.5">
                <span className="w-8 h-8 rounded-lg bg-[#EFF6FB] dark:bg-[#182840] flex items-center justify-center text-[#0A6FA8] dark:text-[#3E9AD1]">
                  <span className="material-symbols-outlined text-[20px]">local_hospital</span>
                </span>
                <div>
                  <h3 className="text-xs font-bold text-[#0B2559]/70 dark:text-[#E6ECF7]/70 uppercase tracking-wider">
                    Where are you assigned?
                  </h3>
                  <p className="text-sm font-semibold text-[#0B2559] dark:text-white">
                    Verified Travel Nurse Sanctuary Housing
                  </p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1EFE9] dark:bg-[#195b4c]/20 text-[#2F6E5E] dark:text-[#aff0db] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#2F6E5E] dark:bg-[#aff0db]" />
                <span>Nursys® Primary-Source RN Verified</span>
              </div>
            </div>

            {/* Hospital Search Autocomplete (Dominant Entry Point with Affordance) */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.3, delay: 0.05, ease: [0.16, 1, 0.3, 1] }}
              className="relative mb-5"
            >
              <label className="block text-xs font-bold text-[#0B2559]/70 dark:text-[#E6ECF7]/70 uppercase tracking-wider mb-2">
                Where are you assigned? (Hospital or clinic)
              </label>
              <div className="relative">
                <GoogleHospitalAutocomplete
                  value={selectedHospital}
                  onChange={(hosp) => setSelectedHospital(hosp)}
                  isNightShiftMode={isNightShiftMode}
                  placeholder="Where are you assigned? (e.g. Duke University, UNC, WakeMed)..."
                />
              </div>
            </motion.div>

            {/* Progressive Disclosure Bar: Staged Data Summary+ Expand Button */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-3 pb-2 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <div className="flex flex-wrap items-center gap-x-1.5 gap-y-1 text-xs sm:text-sm text-[#0B2559] dark:text-[#E6ECF7]">
                <button
                  type="button"
                  onClick={() => {
                    setIsCustomizingAssignment((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg hover:bg-[#0A6FA8]/10 text-left transition-colors cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#0A6FA8] focus-visible:outline-none"
                  title="Click to select move-in date"
                >
                  <span className="text-[#0B2559]/60 dark:text-[#E6ECF7]/60 font-medium">Move-in</span>
                  <span className="font-bold text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums group-hover:underline">
                    {formatDateFriendly(earliestCheckIn)}
                  </span>
                  <span className="material-symbols-outlined text-[15px] text-[#0A6FA8] dark:text-[#3E9AD1] opacity-70 group-hover:opacity-100 transition-opacity">
                    edit_calendar
                  </span>
                </button>
                <span className="text-[#0B2559]/30 dark:text-[#E6ECF7]/30">·</span>
                <button
                  type="button"
                  onClick={() => setIsCustomizingAssignment(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#0A6FA8]/10 text-left transition-colors cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#0A6FA8] focus-visible:outline-none"
                  title="Click to customize rotation duration"
                >
                  <span className="font-bold text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums group-hover:underline">
                    {selectedDuration === 'custom' ? `${customDuration} wks` : selectedDuration === 'customDates' ? 'Custom Dates' : `${selectedDuration} weeks`}
                  </span>
                </button>
                <span className="text-[#0B2559]/30 dark:text-[#E6ECF7]/30">·</span>
                <button
                  type="button"
                  onClick={() => setIsCustomizingAssignment(true)}
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-lg hover:bg-[#0A6FA8]/10 text-left transition-colors cursor-pointer group focus-visible:ring-2 focus-visible:ring-[#0A6FA8] focus-visible:outline-none"
                  title="Click to customize commute radius"
                >
                  <span className="font-bold text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums group-hover:underline">
                    Within {commuteBuffer} mi
                  </span>
                </button>
              </div>

              <button
                type="button"
                onClick={() => setIsCustomizingAssignment(!isCustomizingAssignment)}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1] cursor-pointer py-1 px-2.5 rounded-lg hover:bg-[#EFF6FB] dark:hover:bg-[#182840] transition-colors self-start sm:self-auto group focus-visible:ring-2 focus-visible:ring-[#0A6FA8] focus-visible:outline-none"
              >
                <span className="group-hover:underline">{isCustomizingAssignment ? 'Fewer options' : 'Customize dates & radius'}</span>
                <span
                  className="material-symbols-outlined text-[16px] transition-transform duration-200"
                  style={{ transform: isCustomizingAssignment ? 'rotate(180deg)' : 'rotate(0deg)' }}
                >
                  expand_more
                </span>
              </button>
            </div>

            {/* Progressive Disclosure Drawer (Collapsible Advanced Controls) */}
            <AnimatePresence>
              {isCustomizingAssignment && (
                <motion.div
                  initial={{ opacity: 0, height: 0, y: -8 }}
                  animate={{ opacity: 1, height: 'auto', y: 0 }}
                  exit={{ opacity: 0, height: 0, y: -8 }}
                  transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1] }}
                  className="pt-4 pb-2 space-y-5 px-1 -mx-1"
                >
                  {/* Dual Column: Check-in & Duration */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {/* Date Range Group (Optimized for Cognitive Load & Space) */}
                    <div className={selectedDuration === 'customDates' ? "grid grid-cols-2 gap-3" : "w-full"}>
                      <div className="flex flex-col gap-1">
                        <ClinicalDatePicker
                          value={earliestCheckIn}
                          onChange={setEarliestCheckIn}
                          label="Check-In"
                          subLabel="Shift Start"
                          isNightShiftMode={isNightShiftMode}
                        />
                      </div>
                      {selectedDuration === 'customDates' && (
                        <div className="flex flex-col gap-1">
                          <ClinicalDatePicker
                            value={latestCheckOut}
                            onChange={(date) => {
                              setLatestCheckOut(date);
                              setDateValidationError('');
                            }}
                            label="Check-Out"
                            subLabel="Shift End"
                            isNightShiftMode={isNightShiftMode}
                            minDate={earliestCheckIn}
                            align="right"
                          />
                        </div>
                      )}
                      {dateValidationError && selectedDuration === 'customDates' && (
                        <span className="col-span-2 text-red-500 text-[11px] font-medium mt-0.5">{dateValidationError}</span>
                      )}
                    </div>

                    {/* Assignment Duration */}
                    <div>
                      <label className="block text-xs font-bold text-[#0B2559]/70 dark:text-[#E6ECF7]/70 uppercase tracking-wider mb-2">
                        Assignment Duration
                      </label>
                      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 h-auto sm:h-12">
                        {durationOptions.map((opt) => (
                          <button
                            key={opt.value}
                            type="button"
                            onClick={() => setSelectedDuration(opt.value)}
                            className={`rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center tabular-nums ${
                              selectedDuration === opt.value
                                ? 'bg-[#0A6FA8] text-white shadow-xs'
                                : 'bg-[#EFF6FB] dark:bg-[#182840] text-[#0B2559]/80 dark:text-[#c0c7d1] hover:bg-[#E5F0F8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8]'
                            }`}
                          >
                            {opt.label}
                          </button>
                        ))}
                      </div>
                      {selectedDuration === 'custom' && (
                        <div className="mt-2">
                          <input
                            type="number"
                            min="1"
                            value={customDuration || ''}
                            onChange={(e) => {
                              const val = parseInt(e.target.value);
                              setCustomDuration(isNaN(val) ? 0 : val);
                            }}
                            placeholder="Custom duration (weeks)"
                            className="w-full h-11 px-3 rounded-xl bg-[#EFF6FB] dark:bg-[#182840] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] text-[#0B2559] dark:text-white text-xs font-semibold tabular-nums focus:outline-none focus:ring-2 focus:ring-[#0A6FA8]"
                          />
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Commute Buffer Slider & Action */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <label className="text-xs font-bold text-[#0B2559]/70 dark:text-[#E6ECF7]/70 uppercase tracking-wider">
                        Max Commute Buffer
                      </label>
                      <span className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums">
                        Within {commuteBuffer} miles of hospital
                      </span>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                      {commuteOptions.map((opt) => (
                        <button
                          key={opt.miles}
                          type="button"
                          onClick={() => setCommuteBuffer(opt.miles)}
                          className={`p-3 rounded-xl text-left border transition-all duration-200 ease-in-out cursor-pointer ${
                            commuteBuffer === opt.miles
                              ? 'border-[#0A6FA8] bg-[#EFF6FB] dark:bg-[#0A6FA8]/20'
                              : 'border-[rgba(11,37,89,0.08)] dark:border-[#233550] bg-[#EFF6FB]/60 dark:bg-[#182840] hover:bg-[#E5F0F8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8]'
                          }`}
                        >
                          <div className="text-xs font-bold text-[#0B2559] dark:text-white tabular-nums">{opt.label}</div>
                          <div className="text-[11px] text-[#0B2559]/70 dark:text-[#c0c7d1]">{opt.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Main Search Action Button */}
            <motion.div
              initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
              whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-20px' }}
              transition={{ duration: 0.3, delay: 0.12, ease: [0.16, 1, 0.3, 1] }}
              className="pt-3"
            >
              <motion.button
                type="button"
                onClick={handleExecuteSearch}
                whileTap={{ scale: 0.98 }}
                whileHover={{ scale: 1.01 }}
                transition={{ duration: 0.15 }}
                className="w-full h-14 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] active:bg-[#095C8C] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] text-white text-base font-bold transition-all duration-200 ease-in-out shadow-md flex items-center justify-center gap-2 group cursor-pointer"
              >
                <span>Search housing near assignment</span>
                <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                  arrow_forward
                </span>
              </motion.button>
            </motion.div>

            {/* Micro Escrow Trust Strip */}
            <div className="mt-3 flex flex-wrap items-center justify-center gap-x-4 gap-y-1 text-[11px] text-[#0B2559]/70 dark:text-[#E6ECF7]/70 text-center">
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#2F6E5E] dark:text-[#aff0db]">check_circle</span>
                <span>$0 traveler booking fee</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#0A6FA8] dark:text-[#3E9AD1]">bedtime</span>
                <span>Daytime quiet guarantee (&lt;35 dB)</span>
              </span>
              <span className="flex items-center gap-1">
                <span className="material-symbols-outlined text-[14px] text-[#2F6E5E] dark:text-[#aff0db]">verified_user</span>
                <span>24h host response SLA</span>
              </span>
            </div>
          </motion.div>

          {/* Quick Hubs */}
          <motion.div
            variants={heroItemVariant}
            className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-[#404850] dark:text-[#c0c7d1]"
          >
            <span className="font-semibold text-[#0B2559] dark:text-[#E6ECF7]">Popular Clinical Hubs:</span>
            {popularHubs.slice(0, 5).map((hub) => (
              <motion.button
                key={hub}
                type="button"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.96 }}
                onClick={() => {
                  setSelectedHospital(hub);
                  onGoToSearchListings({ hospital: hub, duration: selectedDuration, radius: commuteBuffer });
                }}
                className="px-3 py-1 rounded-full bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] hover:border-[#0A6FA8] dark:hover:border-[#3E9AD1] font-medium transition-colors cursor-pointer text-[#0B2559] dark:text-white shadow-xs"
              >
                {hub.split(' - ')[0]}
              </motion.button>
            ))}
          </motion.div>
        </motion.div>
      </section>

      {/* 2. TRUST SANCTUARY BANNER (Scroll Reveal with Staggered Cards) */}
      <section className="w-full bg-[#f2f3ff] dark:bg-[#111e33] px-4 sm:px-6 lg:px-12 py-10 transition-colors border-y border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trust 1 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-[#cde5ff] dark:bg-[#005684]/40 flex items-center justify-center text-[#001d32] dark:text-[#93ccff] shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B2559] dark:text-white">License-Verified Nurses</h4>
                <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-1 leading-relaxed">
                  Only active clinical licenses granted access. Safe community of verified healthcare professionals.
                </p>
              </div>
            </motion.div>

            {/* Trust 2 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-[#aff0db]/50 dark:bg-[#195b4c]/40 flex items-center justify-center text-[#195b4c] dark:text-[#aff0db] shrink-0">
                <span className="material-symbols-outlined text-[24px]">bedtime</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B2559] dark:text-white">Daytime Quiet Guarantee</h4>
                <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-1 leading-relaxed">
                  Decibel checked spaces for post-night shift sleep. Sound isolation under 35dB guaranteed.
                </p>
              </div>
            </motion.div>

            {/* Trust 3 */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '-40px' }}
              transition={{ duration: 0.3, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] shadow-xs"
            >
              <div className="w-12 h-12 rounded-xl bg-[#ffdc84]/50 dark:bg-[#745b0d]/40 flex items-center justify-center text-[#745b0d] dark:text-[#ffdc84] shrink-0">
                <span className="material-symbols-outlined text-[24px]">price_check</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#0B2559] dark:text-white">Zero Hidden Fees</h4>
                <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-1 leading-relaxed">
                  Fair pricing transparently aligned with your stipend. $0 traveler booking fee policy.
                </p>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED LISTINGS ONLY ON HOME PAGE */}
      <section className="w-full px-4 sm:px-6 lg:px-12 py-14 lg:py-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#EFF6FB] text-[#0A6FA8] dark:bg-[#182840] dark:text-[#3E9AD1] mb-2 border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
              <span className="material-symbols-outlined text-[14px]">hotel_class</span>
              <span>Curated by Nurses Pillow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2559] dark:text-white tracking-tight">
              Featured Sanctuary Stays
            </h2>
            <p className="text-sm text-[#404850] dark:text-[#c0c7d1] mt-1">
              Top-rated shift-ready homes with verified quiet certifications near major medical centers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExecuteSearch}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#0A6FA8] dark:text-[#3E9AD1] cursor-pointer self-start md:self-auto group"
          >
            <span className="group-hover:underline">Explore all 28 stays in Interactive Map</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* Active Commute Anchor Header */}
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 p-3.5 rounded-2xl bg-[#EFF6FB] dark:bg-[#15233a] border border-[#0A6FA8]/20 shadow-xs">
          <div className="flex items-center gap-2.5 text-xs">
            <span className="w-7 h-7 rounded-xl bg-[#0A6FA8] text-white flex items-center justify-center shrink-0 shadow-xs">
              <span className="material-symbols-outlined text-[16px]">directions_car</span>
            </span>
            <div>
              <span className="text-[#0B2559]/70 dark:text-[#c0c7d1] block text-[11px]">
                Travel Time &amp; Commute Anchored To
              </span>
              <span className="font-bold text-[#0B2559] dark:text-white">
                {selectedHospital.split(' - ')[0]}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-[11px] text-[#2F6E5E] dark:text-[#aff0db] font-semibold bg-white/80 dark:bg-[#111e33] px-2.5 py-1 rounded-xl">
            <span className="w-2 h-2 rounded-full bg-[#2F6E5E] dark:bg-[#aff0db]" />
            <span>Hospital Travel Duration Active</span>
          </div>
        </div>

        {/* Interactive Search Filters with Staggered Viewport Reveal (Progressive Disclosure) */}
        <motion.div
          initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
          whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-20px' }}
          transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
          className="flex items-center gap-2 overflow-x-auto pb-4 mb-6 custom-scrollbar"
        >
          <span className="text-xs font-bold text-[#0B2559]/70 dark:text-[#E6ECF7]/70 whitespace-nowrap mr-1 flex items-center gap-1">
            <span className="material-symbols-outlined text-[16px] text-[#0A6FA8] dark:text-[#3E9AD1]">tune</span>
            <span>Filters:</span>
          </span>
          {[
            { id: 'all', label: `All Stays (${featuredListings.length})`, icon: 'apartment' },
            { id: 'close', label: '< 1 mi to Hospital', icon: 'directions_walk' },
            { id: 'quiet', label: 'Day-Sleep Quiet (<28 dB)', icon: 'bedtime' },
            { id: 'laundry', label: 'In-Unit Scrub Laundry', icon: 'local_laundry_service' },
            { id: 'pets', label: 'Pet Friendly', icon: 'pets' },
          ].map((pill, idx) => {
            const isSelected = activeListingFilter === pill.id;
            return (
              <motion.button
                key={pill.id}
                type="button"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 16 }}
                whileInView={shouldReduceMotion ? undefined : { opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{
                  duration: 0.3,
                  delay: shouldReduceMotion ? 0 : idx * 0.04,
                  ease: [0.16, 1, 0.3, 1],
                }}
                onClick={() => setActiveListingFilter(pill.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all duration-200 ease-in-out flex items-center gap-1.5 cursor-pointer ${
                  isSelected
                    ? 'bg-[#0A6FA8] text-white shadow-xs'
                    : 'bg-white dark:bg-[#15233a] text-[#0B2559]/80 dark:text-[#E6ECF7]/80 border border-[rgba(11,37,89,0.08)] dark:border-[#233550] hover:border-[#0A6FA8] hover:text-[#0A6FA8] focus-visible:text-[#0A6FA8]'
                }`}
              >
                <span className="material-symbols-outlined text-[15px]">{pill.icon}</span>
                <span className="tabular-nums">{pill.label}</span>
              </motion.button>
            );
          })}
        </motion.div>

        {/* 3-Column Grid of Featured Listings with Staggered Viewport Entrance */}
        {displayedFeaturedListings.length === 0 ? (
          <div className="text-center py-12 px-4 rounded-3xl bg-white dark:bg-[#111e33] border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <span className="material-symbols-outlined text-4xl text-[#0A6FA8] mb-2">filter_alt_off</span>
            <h4 className="text-base font-bold text-[#0B2559] dark:text-white mb-1">No Sanctuaries Match Filter</h4>
            <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mb-4">
              Try choosing another clinical amenity or view all curated hospital stays.
            </p>
            <button
              type="button"
              onClick={() => setActiveListingFilter('all')}
              className="px-4 py-2 rounded-full bg-[#0A6FA8] text-white text-xs font-bold shadow-xs cursor-pointer hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0C7EBF]"
            >
              Reset to All Stays
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {displayedFeaturedListings.map((listing, index) => {
              const isSaved = savedListingIds.includes(listing.id);
              return (
                <ObservedListingCard
                  key={listing.id}
                  listing={listing}
                  index={index}
                  isSaved={isSaved}
                  onToggleSave={onToggleSave}
                  onSelectListing={handleSelectListing}
                  onRequestToBook={onRequestToBookListing}
                  shouldReduceMotion={shouldReduceMotion}
                  selectedHospital={selectedHospital}
                  isNightShiftMode={isNightShiftMode}
                />
              );
            })}
          </div>
        )}

        {/* View All Stays Navigation Banner */}
        <div className="mt-12 p-6 sm:p-8 rounded-3xl bg-white dark:bg-[#111e33] border border-[rgba(11,37,89,0.1)] dark:border-[#233550] shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
          <div className="flex items-center gap-3">
            <span className="w-12 h-12 rounded-2xl bg-[#005684]/10 text-[#005684] flex items-center justify-center">
              <span className="material-symbols-outlined text-[24px]">map</span>
            </span>
            <div>
              <h3 className="font-bold text-base text-[#001848] dark:text-white">
                Looking for more hospital locations or transit lines?
              </h3>
              <p className="text-xs text-[#404850] dark:text-[#c0c7d1]">
                Filter by hospital shuttle routes, dedicated scrub washers, and certified quiet decibels.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={handleExecuteSearch}
            className="px-6 py-3 rounded-xl bg-[#001848] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white text-xs font-bold transition-all duration-200 ease-in-out shadow-xs cursor-pointer whitespace-nowrap"
          >
            Open Interactive Search &amp; Map →
          </button>
        </div>
      </section>

      {/* 4. HOW NURSES PILLOW PROTECTS YOUR ASSIGNMENT */}
      <section
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 800px' }}
        className="w-full bg-[#f2f3ff] dark:bg-[#111e33] px-4 sm:px-6 lg:px-12 py-16 lg:py-24 transition-colors"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-7xl mx-auto text-center"
        >
          <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2559] dark:text-white tracking-tight mb-2">
            How Nurses Pillow Protects Your Assignment
          </h2>
          <p className="text-sm sm:text-base text-[#404850] dark:text-[#c0c7d1] max-w-xl mx-auto mb-8">
            Tailored explicitly for traveling clinical schedules with zero marketplace games.
          </p>

          {/* Toggle Pills */}
          <div className="inline-flex p-1 rounded-full bg-[#eaedff] dark:bg-[#16253c] mb-12 shadow-xs">
            <button
              type="button"
              onClick={() => setActiveProtectionTab('clinicians')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer ${
                activeProtectionTab === 'clinicians'
                  ? 'bg-white dark:bg-[#0A6FA8] text-[#0B2559] dark:text-white shadow-xs'
                  : 'text-[#404850] dark:text-[#93ccff]'
              }`}
            >
              For Traveling Clinicians
            </button>
            <button
              type="button"
              onClick={() => setActiveProtectionTab('hosts')}
              className={`px-6 py-2 rounded-full text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer ${
                activeProtectionTab === 'hosts'
                  ? 'bg-white dark:bg-[#0A6FA8] text-[#0B2559] dark:text-white shadow-xs'
                  : 'text-[#404850] dark:text-[#93ccff]'
              }`}
            >
              For Property Hosts
            </button>
          </div>

          {/* 3 Protection Cards - Dynamic based on activeProtectionTab */}
          <AnimatePresence mode="wait">
            {activeProtectionTab === 'clinicians' ? (
              <motion.div
                key="clinicians"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left"
              >
                {[
                  {
                    step: 1,
                    title: 'Hospital Search',
                    body: 'Search listings indexed strictly by verified drive time, hospital shuttle lines, or walking transit to your medical center.',
                    meta: 'Radius slider & day-shift filters',
                  },
                  {
                    step: 2,
                    title: '4–Step Verification',
                    body: 'Quick 2FA mobile auth, Stripe biometric ID match, and automated Nursys nursing board check create your vetted profile in minutes.',
                    meta: 'License numbers remain private',
                  },
                  {
                    step: 3,
                    title: '$0 Booking Fees',
                    body: 'Travelers pay exactly what hosts list. Escrow pre-authorization hold with 24–hour host response SLA and shift-cancellation tiers.',
                    meta: 'All utilities itemized & guaranteed',
                  },
                ].map((card, idx) => (
                  <div
                    key={card.step}
                    className="bg-white dark:bg-[#15233a] p-8 rounded-[20px] shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between hover:shadow-md transition-shadow"
                  >
                    <div>
                      <div className="w-10 h-10 rounded-full bg-[#0A6FA8] text-white flex items-center justify-center font-bold text-sm mb-6">
                        {card.step}
                      </div>
                      <h3 className="text-lg font-bold text-[#0B2559] dark:text-white mb-2">{card.title}</h3>
                      <p className="text-sm text-[#404850] dark:text-[#c0c7d1] leading-relaxed">
                        {card.body}
                      </p>
                    </div>
                    <div className="mt-6 pt-4 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                      <span className="text-xs text-[#0A6FA8] dark:text-[#93ccff] font-semibold">
                        {card.meta}
                      </span>
                    </div>
                  </div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                key="hosts"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
                className="space-y-8"
              >
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
                  {[
                    {
                      step: 1,
                      color: 'bg-[#195b4c] dark:bg-[#aff0db] text-white dark:text-[#0B1626]',
                      metaColor: 'text-[#195b4c] dark:text-[#aff0db]',
                      title: '100% Verified Clinicians',
                      body: 'Every guest is an active licensed healthcare professional verified via primary-source Nursys and state medical boards. Zero party tolerance, quiet day-sleepers, and respectful professionals.',
                      meta: 'Board-verified license & ID screening',
                    },
                    {
                      step: 2,
                      color: 'bg-[#0A6FA8] text-white',
                      metaColor: 'text-[#0A6FA8] dark:text-[#93ccff]',
                      title: 'Guaranteed Mid-Term Income',
                      body: 'Enjoy predictable 30 to 90-day stays aligned with 13-week hospital rotations. Transparent 5% flat platform fee with automated direct deposits powered by Stripe Connect Escrow.',
                      meta: 'Zero guest churn • Flat 5% host take-rate',
                    },
                    {
                      step: 3,
                      color: 'bg-[#745b0d] text-white',
                      metaColor: 'text-[#745b0d] dark:text-[#ffdf91]',
                      title: 'Contract Flex Vacancy Protection',
                      body:"If a nurse's clinical placement is unexpectedly cancelled by the hospital with staffing agency documentation, hosts receive a guaranteed 14-day vacancy stipend payout and re-listing boost.",
                      meta: '14-day vacancy stipend guarantee',
                    },
                  ].map((card, idx) => (
                    <div
                      key={card.step}
                      className="bg-white dark:bg-[#15233a] p-8 rounded-[20px] shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between hover:shadow-md transition-shadow"
                    >
                      <div>
                        <div className={`w-10 h-10 rounded-full ${card.color} flex items-center justify-center font-bold text-sm mb-6`}>
                          {card.step}
                        </div>
                        <h3 className="text-lg font-bold text-[#0B2559] dark:text-white mb-2">{card.title}</h3>
                        <p className="text-sm text-[#404850] dark:text-[#c0c7d1] leading-relaxed">
                          {card.body}
                        </p>
                      </div>
                      <div className="mt-6 pt-4 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                        <span className={`text-xs ${card.metaColor} font-semibold`}>
                          {card.meta}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                {onGoToHostPortal && (
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={onGoToHostPortal}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] active:bg-[#095C8C] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] text-white text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 ease-in-out cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_home</span>
                      <span>Enter Host Workspace &amp; Add Sanctuary Listing →</span>
                    </button>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </section>

      {/* 5. HOST COMMUNITY INVITATION CARD (Accessible, Clean Light Contrast with Scroll Reveal) */}
      <section
        style={{ contentVisibility: 'auto', containIntrinsicSize: '0 600px' }}
        className="px-4 sm:px-6 lg:px-12 py-16 max-w-7xl mx-auto w-full"
      >
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-[24px] p-8 sm:p-12 bg-white dark:bg-[#111e33] border border-[rgba(11,37,89,0.12)] dark:border-[#233550] shadow-md relative overflow-hidden"
        >
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#195b4c]/10 text-[#195b4c] dark:bg-[#aff0db]/15 dark:text-[#aff0db] mb-4">
              <span className="material-symbols-outlined text-[14px]">home_work</span>
              <span>Host Partner Network</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#0B2559] dark:text-white tracking-tight mb-3">
              Have a quiet property near a major hospital?
            </h2>

            <p className="text-sm sm:text-base text-[#404850] dark:text-[#c0c7d1] leading-relaxed mb-6">
              Connect directly with verified traveling RNs, MDs, and allied specialists. Enjoy guaranteed 13-week rotations, zero party risks, and transparent payments with 5% flat platform take-rate.
            </p>

            <div className="flex flex-wrap items-center gap-4">
              {onGoToHostPortal && (
                <button
                  type="button"
                  onClick={onGoToHostPortal}
                  className="px-6 py-3.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] active:bg-[#095C8C] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] text-white text-xs font-bold shadow-sm transition-all duration-200 ease-in-out cursor-pointer"
                >
                  Enter Host Portal
                </button>
              )}
              <div className="flex items-center gap-2 text-xs text-[#195b4c] font-bold">
                <span className="material-symbols-outlined text-[16px]">check_circle</span>
                <span>100% Nursys Verified Clinician Guests</span>
              </div>
            </div>
          </div>
        </motion.div>
      </section>

      {/* DETAIL MODAL */}
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
    </div>
  );
};
