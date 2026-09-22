import React, { useState, useMemo, useEffect, useRef } from 'react';
import { HousingListing } from '../types';
import { MOCK_LISTINGS } from '../data/mockData';
import { ListingDetailModal } from './ListingDetailModal';

interface FindHousingViewProps {
  isNightShiftMode: boolean;
  savedListingIds: string[];
  onToggleSave: (id: string) => void;
  isVerified: boolean;
  onGoToVerification: () => void;
  onGoToEmailVerification?: () => void;
  onGoToPhoneVerification?: () => void;
  onRequestToBookListing?: (listing: HousingListing) => void;
  onGoToSearchListings: (params?: { hospital?: string; duration?: string; radius?: number }) => void;
  onGoToHostPortal?: () => void;
  userRole?: string;
  userName?: string;
}

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
  const [selectedHospital, setSelectedHospital] = useState('Duke University Hospital - Durham, NC');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [commuteBuffer, setCommuteBuffer] = useState<number>(5);
  const [selectedDuration, setSelectedDuration] = useState('13');
  const [customDuration, setCustomDuration] = useState<number>(1);
  const [earliestCheckIn, setEarliestCheckIn] = useState('Oct 1, 2024');
  const [activeProtectionTab, setActiveProtectionTab] = useState<'clinicians' | 'hosts'>(
    userRole === 'host' ? 'hosts' : 'clinicians'
  );
  const [activeDetailListing, setActiveDetailListing] = useState<HousingListing | null>(null);

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
  ];

  const commuteOptions = [
    { miles: 3, label: '3 miles', desc: 'Shift walk/bike' },
    { miles: 5, label: '5 miles', desc: 'Quick commute' },
    { miles: 10, label: '10 miles', desc: 'Suburban retreat' },
    { miles: 15, label: '15 miles', desc: 'Max value radius' },
  ];

  const popularHubs = [
    'Duke University Hospital - Durham, NC',
    'UNC Medical Center - Chapel Hill, NC',
    'WakeMed Raleigh Campus - Raleigh, NC',
    'Atrium Health Carolinas Medical Center - Charlotte, NC',
    'Stanford Health Care - Main Hospital (Stanford, CA)',
    'UCSF Medical Center - Mission Bay (San Francisco, CA)',
    'Cedars-Sinai Medical Center - Los Angeles, CA',
  ];

  // Curated Featured Listings for the Home Page
  const featuredListings = useMemo(() => {
    return MOCK_LISTINGS.slice(0, 6);
  }, []);

  const handleExecuteSearch = () => {
    onGoToSearchListings({
      hospital: selectedHospital,
      duration: selectedDuration === 'custom' ? customDuration.toString() : selectedDuration,
      radius: commuteBuffer,
    });
  };

  return (
    <div className={`w-full transition-colors ${isNightShiftMode ? 'bg-[#08101C] text-[#E6ECF7]' : 'bg-[#faf8ff] text-[#001848]'}`}>
      {/* 1. HERO SECTION & ASSIGNMENT CARD */}
      <section className="relative overflow-hidden px-4 sm:px-6 lg:px-12 py-10 sm:py-16 lg:py-20">
        {/* Soft Ambient Glows */}
        <div className="absolute -top-32 -left-24 w-[480px] h-[480px] rounded-full bg-[#005684]/10 dark:bg-[#0a6fa8]/20 blur-3xl pointer-events-none" />
        <div className="absolute top-1/2 -right-32 w-[520px] h-[520px] rounded-full bg-[#195b4c]/10 dark:bg-[#195b4c]/20 blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto flex flex-col items-center text-center relative z-10">
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
          <div className="flex items-center gap-1.5 mb-3">
            <span className="material-symbols-outlined text-[#745b0d] dark:text-[#E4C36D] text-[20px]" style={{ fontVariationSettings:"'FILL' 1" }}>
              hotel_class
            </span>
            <span
              className="text-[28px] sm:text-[32px] leading-[38px] text-[#745b0d] dark:text-[#E4C36D]"
              style={{ fontFamily:"'Kaushan Script', cursive" }}
            >
              Rest Well. Heal Better.
            </span>
            <span className="material-symbols-outlined text-[#745b0d] dark:text-[#E4C36D] text-[20px]" style={{ fontVariationSettings:"'FILL' 1" }}>
              hotel_class
            </span>
          </div>

          {/* Main Headline */}
          <h1 className="text-3xl sm:text-4xl lg:text-[46px] lg:leading-[54px] font-bold text-[#001848] dark:text-white max-w-4xl tracking-tight mb-4">
            Find your home near your next assignment.
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-[#404850] dark:text-[#c0c7d1] max-w-2xl leading-relaxed mb-8">
            Curated furnished quiet spaces vetted for day-sleepers, shift schedules, and contract flexibility.
          </p>

          {/* Signature Assignment Card */}
          <div className="w-full max-w-4xl bg-white dark:bg-[#111e33] rounded-3xl p-6 lg:p-8 shadow-md text-left relative border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            {/* Header info bar */}
            <div className="flex flex-wrap items-center justify-between pb-5 mb-6 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] gap-3">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-[#005684]/15 dark:bg-[#93ccff]/15 flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                  <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                </span>
                <div>
                  <h3 className="text-xs font-bold text-[#001848] dark:text-white uppercase tracking-wider">
                    Clinical Housing Portal
                  </h3>
                  <p className="text-sm font-semibold text-[#005684] dark:text-[#93ccff]">Where are you assigned?</p>
                </div>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#195b4c]/10 dark:bg-[#aff0db]/15 text-[#195b4c] dark:text-[#aff0db] text-xs font-semibold">
                <span className="w-2 h-2 rounded-full bg-[#195b4c] dark:bg-[#aff0db]" />
                <span>1,420 Sanitized Suites Available</span>
              </div>
            </div>

            {/* Hospital Search Autocomplete */}
            <div className="relative mb-6">
              <label className="block text-xs font-bold text-[#001848] dark:text-white uppercase tracking-wider mb-2">
                Hospital or Medical System
              </label>
              <div ref={hospitalDropdownRef} className="relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#005684] dark:text-[#93ccff] pointer-events-none">
                  domain
                </span>
                <input
                  type="text"
                  readOnly
                  value={selectedHospital}
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-full h-14 pl-12 pr-32 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] text-[#001848] dark:text-white text-sm font-semibold cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#005684]"
                />
                <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db] text-[11px] font-bold">
                    <span className="material-symbols-outlined text-[14px]">verified</span>
                    Verified Facility
                  </span>
                  <span
                    onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                    className="material-symbols-outlined text-[#404850] dark:text-[#93ccff] cursor-pointer"
                  >
                    arrow_drop_down
                  </span>
                </div>

                {/* Dropdown Menu */}
                {isDropdownOpen && (
                  <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#15233a] rounded-xl shadow-md z-30 py-2 border border-[#c0c7d1]/30 dark:border-[#2b4162] overflow-hidden">
                    {popularHubs.map((hosp) => (
                      <div
                        key={hosp}
                        onClick={() => {
                          setSelectedHospital(hosp);
                          setIsDropdownOpen(false);
                        }}
                        className={`px-4 py-3 hover:bg-[#f2f3ff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#f2f3ff] dark:hover:bg-[#1f3350] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1f3350] cursor-pointer flex items-center justify-between transition-colors ${
                          selectedHospital === hosp ? 'bg-[#eaedff] dark:bg-[#1f3350]' : ''
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="material-symbols-outlined text-[#005684] dark:text-[#3E9AD1] text-[18px]">
                            local_hospital
                          </span>
                          <span className="text-sm font-semibold text-[#001848] dark:text-white">{hosp}</span>
                        </div>
                        <span className="material-symbols-outlined text-[#195b4c] text-[16px]">check_circle</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Dual Column: Check-in & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-6">
              {/* Check-In Date */}
              <div>
                <label className="block text-xs font-bold text-[#001848] dark:text-white uppercase tracking-wider mb-2">
                  Earliest Check-In
                </label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#005684] dark:text-[#93ccff] pointer-events-none text-[20px]">
                    calendar_today
                  </span>
                  <input
                    type="text"
                    value={earliestCheckIn}
                    onChange={(e) => setEarliestCheckIn(e.target.value)}
                    placeholder="e.g. Oct 1, 2024"
                    className="w-full h-13 pl-12 pr-4 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] text-[#001848] dark:text-white text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-[#005684]"
                  />
                </div>
              </div>

              {/* Assignment Duration */}
              <div>
                <label className="block text-xs font-bold text-[#001848] dark:text-white uppercase tracking-wider mb-2">
                  Assignment Duration
                </label>
                <div className="grid grid-cols-5 gap-2 h-13">
                  {durationOptions.map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDuration(opt.value)}
                      className={`rounded-xl text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer flex items-center justify-center ${
                        selectedDuration === opt.value
                          ? 'bg-[#005684] text-white shadow-xs'
                          : 'bg-[#f2f3ff] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff]'
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
                      className="w-full h-11 px-3 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] text-[#001848] dark:text-white text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-[#005684]"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Commute Buffer Slider & Action */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold text-[#001848] dark:text-white uppercase tracking-wider">
                  Max Commute Buffer
                </label>
                <span className="text-xs font-extrabold text-[#005684] dark:text-[#93ccff]">
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
                        ? 'border-[#005684] bg-[#eaedff]/60 dark:bg-[#005684]/20'
                        : 'border-[rgba(11,37,89,0.08)] dark:border-[#233550] bg-[#f2f3ff] dark:bg-[#182840] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff]'
                    }`}
                  >
                    <div className="text-xs font-bold text-[#001848] dark:text-white">{opt.label}</div>
                    <div className="text-[11px] text-[#404850] dark:text-[#c0c7d1]">{opt.desc}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Main Search Action Button */}
            <button
              type="button"
              onClick={handleExecuteSearch}
              className="w-full h-14 rounded-2xl bg-[#001848] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white text-base font-bold transition-all duration-200 ease-in-out shadow-md flex items-center justify-center gap-2 group cursor-pointer"
            >
              <span>Search 1,420 Sanitized Stays</span>
              <span className="material-symbols-outlined text-[20px] group-hover:translate-x-1 transition-transform">
                arrow_forward
              </span>
            </button>
          </div>

          {/* Quick Hubs */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-2 text-xs text-[#404850] dark:text-[#c0c7d1]">
            <span className="font-semibold">Popular Clinical Hubs:</span>
            {popularHubs.slice(0, 5).map((hub) => (
              <button
                key={hub}
                type="button"
                onClick={() => {
                  setSelectedHospital(hub);
                  onGoToSearchListings({ hospital: hub, duration: selectedDuration, radius: commuteBuffer });
                }}
                className="px-3 py-1 rounded-full bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] hover:border-[#005684] font-medium transition-colors cursor-pointer text-[#001848] dark:text-white"
              >
                {hub.split(' - ')[0]}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* 2. TRUST SANCTUARY BANNER */}
      <section className="w-full bg-[#f2f3ff] dark:bg-[#111e33] px-4 sm:px-6 lg:px-12 py-10 transition-colors border-y border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Trust 1 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#cde5ff] dark:bg-[#005684]/40 flex items-center justify-center text-[#001d32] dark:text-[#93ccff] shrink-0">
                <span className="material-symbols-outlined text-[24px]">verified_user</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#001848] dark:text-white">License-Verified Nurses</h4>
                <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-1 leading-relaxed">
                  Only active clinical licenses granted access. Safe community of verified healthcare professionals.
                </p>
              </div>
            </div>

            {/* Trust 2 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#aff0db]/50 dark:bg-[#195b4c]/40 flex items-center justify-center text-[#195b4c] dark:text-[#aff0db] shrink-0">
                <span className="material-symbols-outlined text-[24px]">bedtime</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#001848] dark:text-white">Daytime Quiet Guarantee</h4>
                <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-1 leading-relaxed">
                  Decibel checked spaces for post-night shift sleep. Sound isolation under 35dB guaranteed.
                </p>
              </div>
            </div>

            {/* Trust 3 */}
            <div className="flex items-start gap-4 p-5 rounded-2xl bg-white dark:bg-[#15233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] shadow-xs">
              <div className="w-12 h-12 rounded-xl bg-[#ffdc84]/50 dark:bg-[#745b0d]/40 flex items-center justify-center text-[#745b0d] dark:text-[#ffdc84] shrink-0">
                <span className="material-symbols-outlined text-[24px]">price_check</span>
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#001848] dark:text-white">Zero Hidden Fees</h4>
                <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-1 leading-relaxed">
                  Fair pricing transparently aligned with your stipend. $0 traveler booking fee policy.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 3. FEATURED LISTINGS ONLY ON HOME PAGE */}
      <section className="w-full px-4 sm:px-6 lg:px-12 py-14 lg:py-20 max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#005684]/10 text-[#005684] dark:bg-[#93ccff]/15 dark:text-[#93ccff] mb-2">
              <span className="material-symbols-outlined text-[14px]">hotel_class</span>
              <span>Curated by Nurses Pillow</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-[#001848] dark:text-white tracking-tight">
              Featured Sanctuary Stays
            </h2>
            <p className="text-sm text-[#404850] dark:text-[#c0c7d1] mt-1">
              Top-rated shift-ready homes with verified quiet certifications near major medical centers.
            </p>
          </div>

          <button
            type="button"
            onClick={handleExecuteSearch}
            className="inline-flex items-center gap-1 text-sm font-bold text-[#005684] dark:text-[#93ccff] hover:underline cursor-pointer"
          >
            <span>Explore all 28 stays in Interactive Map</span>
            <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
          </button>
        </div>

        {/* 3-Column Grid of Featured Listings */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {featuredListings.map((listing) => {
            const isSaved = savedListingIds.includes(listing.id);
            return (
              <div
                key={listing.id}
                className="bg-white dark:bg-[#111e33] rounded-3xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200 ease-in-out border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col justify-between group"
              >
                {/* Image Header */}
                <div className="relative h-60 w-full overflow-hidden bg-gray-100">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/65 backdrop-blur-xs text-white text-xs font-semibold">
                    <span className="material-symbols-outlined text-[14px]">near_me</span>
                    <span>{listing.distanceBadge || `${listing.driveTimeMinutes} min to hospital`}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => onToggleSave(listing.id)}
                    aria-label="Save listing"
                    className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 dark:bg-black/70 backdrop-blur-xs flex items-center justify-center text-[#001848] dark:text-white hover:scale-110 transition-transform shadow-xs cursor-pointer"
                  >
                    <span className={`material-symbols-outlined text-[20px] ${isSaved ? 'text-rose-500 fill-1' : 'text-gray-600 dark:text-gray-300'}`}>
                      favorite
                    </span>
                  </button>
                </div>

                {/* Content */}
                <div className="p-6 flex-1 flex flex-col justify-between gap-4">
                  <div>
                    <div className="flex items-center justify-between text-xs text-[#404850] dark:text-[#93ccff] font-bold uppercase tracking-wider mb-1.5">
                      <span>{listing.propertyType || 'ENTIRE CONDO'}</span>
                      <div className="flex items-center gap-1 text-amber-500">
                        <span className="material-symbols-outlined text-[16px]">star</span>
                        <span className="text-[#001848] dark:text-white font-bold">{listing.nurseRating}</span>
                        <span className="text-gray-400 font-normal">({listing.reviewsCount})</span>
                      </div>
                    </div>

                    <h3 className="text-base font-bold text-[#001848] dark:text-white line-clamp-1 mb-2 group-hover:text-[#005684] focus-visible:text-[#005684] transition-colors">
                      {listing.title}
                    </h3>

                    <div className="flex items-baseline gap-1 mb-4">
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

                  {/* Actions */}
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
              </div>
            );
          })}
        </div>

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
      <section className="w-full bg-[#f2f3ff] dark:bg-[#111e33] px-4 sm:px-6 lg:px-12 py-16 lg:py-24 transition-colors">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-2xl sm:text-3xl font-bold text-[#001848] dark:text-white tracking-tight mb-2">
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
                  ? 'bg-white dark:bg-[#005684] text-[#001848] dark:text-white shadow-xs'
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
                  ? 'bg-white dark:bg-[#005684] text-[#001848] dark:text-white shadow-xs'
                  : 'text-[#404850] dark:text-[#93ccff]'
              }`}
            >
              For Property Hosts
            </button>
          </div>

          {/* 3 Protection Cards - Dynamic based on activeProtectionTab */}
          {activeProtectionTab === 'clinicians' ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
              <div className="bg-white dark:bg-[#15233a] p-8 rounded-3xl shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#005684] text-white flex items-center justify-center font-bold text-sm mb-6">
                    1
                  </div>
                  <h3 className="text-lg font-bold text-[#001848] dark:text-white mb-2">Hospital Search</h3>
                  <p className="text-sm text-[#404850] dark:text-[#c0c7d1] leading-relaxed">
                    Search listings indexed strictly by verified drive time, hospital shuttle lines, or walking transit to your medical center.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <span className="text-xs text-[#005684] dark:text-[#93ccff] font-semibold">
                    Radius slider &amp; day-shift filters
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#15233a] p-8 rounded-3xl shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#005684] text-white flex items-center justify-center font-bold text-sm mb-6">
                    2
                  </div>
                  <h3 className="text-lg font-bold text-[#001848] dark:text-white mb-2">4–Step Verification</h3>
                  <p className="text-sm text-[#404850] dark:text-[#c0c7d1] leading-relaxed">
                    Quick 2FA mobile auth, Stripe biometric ID match, and automated Nursys nursing board check create your vetted profile in minutes.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <span className="text-xs text-[#005684] dark:text-[#93ccff] font-semibold">
                    License numbers remain private
                  </span>
                </div>
              </div>

              <div className="bg-white dark:bg-[#15233a] p-8 rounded-3xl shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
                <div>
                  <div className="w-10 h-10 rounded-full bg-[#005684] text-white flex items-center justify-center font-bold text-sm mb-6">
                    3
                  </div>
                  <h3 className="text-lg font-bold text-[#001848] dark:text-white mb-2">$0 Booking Fees</h3>
                  <p className="text-sm text-[#404850] dark:text-[#c0c7d1] leading-relaxed">
                    Travelers pay exactly what hosts list. Escrow pre-authorization hold with 24–hour host response SLA and shift-cancellation tiers.
                  </p>
                </div>
                <div className="mt-6 pt-4 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <span className="text-xs text-[#005684] dark:text-[#93ccff] font-semibold">
                    All utilities itemized &amp; guaranteed
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8 text-left">
                <div className="bg-white dark:bg-[#15233a] p-8 rounded-3xl shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#195b4c] dark:bg-[#aff0db] text-white dark:text-[#0B1626] flex items-center justify-center font-bold text-sm mb-6">
                      1
                    </div>
                    <h3 className="text-lg font-bold text-[#001848] dark:text-white mb-2">100% Verified Clinicians</h3>
                    <p className="text-sm text-[#404850] dark:text-[#c0c7d1] leading-relaxed">
                      Every guest is an active licensed healthcare professional verified via primary-source Nursys and state medical boards. Zero party tolerance, quiet day-sleepers, and respectful professionals.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                    <span className="text-xs text-[#195b4c] dark:text-[#aff0db] font-semibold">
                      Board-verified license &amp; ID screening
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#15233a] p-8 rounded-3xl shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#005684] text-white flex items-center justify-center font-bold text-sm mb-6">
                      2
                    </div>
                    <h3 className="text-lg font-bold text-[#001848] dark:text-white mb-2">Guaranteed Mid-Term Income</h3>
                    <p className="text-sm text-[#404850] dark:text-[#c0c7d1] leading-relaxed">
                      Enjoy predictable 30 to 90-day stays aligned with 13-week hospital rotations. Transparent 5% flat platform fee with automated direct deposits powered by Stripe Connect Escrow.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                    <span className="text-xs text-[#005684] dark:text-[#93ccff] font-semibold">
                      Zero guest churn • Flat 5% host take-rate
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#15233a] p-8 rounded-3xl shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
                  <div>
                    <div className="w-10 h-10 rounded-full bg-[#745b0d] text-white flex items-center justify-center font-bold text-sm mb-6">
                      3
                    </div>
                    <h3 className="text-lg font-bold text-[#001848] dark:text-white mb-2">Contract Flex Vacancy Protection</h3>
                    <p className="text-sm text-[#404850] dark:text-[#c0c7d1] leading-relaxed">
                      If a nurse's clinical placement is unexpectedly cancelled by the hospital with staffing agency documentation, hosts receive a guaranteed 14-day vacancy stipend payout and re-listing boost.
                    </p>
                  </div>
                  <div className="mt-6 pt-4 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                    <span className="text-xs text-[#745b0d] dark:text-[#ffdf91] font-semibold">
                      14-day vacancy stipend guarantee
                    </span>
                  </div>
                </div>
              </div>

              {onGoToHostPortal && (
                <div className="pt-2">
                  <button
                    type="button"
                    onClick={onGoToHostPortal}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#001848] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white text-xs sm:text-sm font-bold shadow-sm transition-all duration-200 ease-in-out cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[18px]">add_home</span>
                    <span>Enter Host Workspace &amp; Add Sanctuary Listing →</span>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </section>

      {/* 5. HOST COMMUNITY INVITATION CARD (Accessible, Clean Light Contrast) */}
      <section className="px-4 sm:px-6 lg:px-12 py-16 max-w-7xl mx-auto w-full">
        <div className="rounded-3xl p-8 sm:p-12 bg-white dark:bg-[#111e33] border border-[rgba(11,37,89,0.12)] dark:border-[#233550] shadow-lg relative overflow-hidden">
          <div className="max-w-3xl relative z-10">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#195b4c]/10 text-[#195b4c] dark:bg-[#aff0db]/15 dark:text-[#aff0db] mb-4">
              <span className="material-symbols-outlined text-[14px]">home_work</span>
              <span>Host Partner Network</span>
            </div>

            <h2 className="text-2xl sm:text-3xl font-bold text-[#001848] dark:text-white tracking-tight mb-3">
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
                  className="px-6 py-3.5 rounded-xl bg-[#001848] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white text-xs font-bold shadow-sm transition-all duration-200 ease-in-out cursor-pointer"
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
        </div>
      </section>

      {/* DETAIL MODAL */}
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
    </div>
  );
};
