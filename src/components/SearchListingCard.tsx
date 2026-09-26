import React, { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { HousingListing } from '../types';
import { PillowSaveButton } from './PillowSaveButton';

export interface SearchListingCardProps {
  listing: HousingListing;
  isSaved: boolean;
  isSelectedOnMap?: boolean;
  onToggleSave: (id: string) => void;
  onSelectOnMap?: (id: string) => void;
  onViewDetails: (listing: HousingListing) => void;
  onRequestToBook?: (listing: HousingListing) => void;
  selectedHospital?: string;
  viewMode?: 'split-map' | 'grid';
  isNightShiftMode?: boolean;
}

export const SearchListingCard: React.FC<SearchListingCardProps> = React.memo(({

  listing,
  isSaved,
  isSelectedOnMap = false,
  onToggleSave,
  onSelectOnMap,
  onViewDetails,
  onRequestToBook,
  selectedHospital,
  viewMode = 'split-map',
  isNightShiftMode = false,
}) => {
  const shouldReduceMotion = useReducedMotion();
  const [isHovered, setIsHovered] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  // Determine if secondary details drawer should be shown
  const isExpanded = isHovered || isMobileExpanded;

  // Transparent Fee Calculations (per AGENTS.md rule 4.C Transparent Pricing)
  const monthlyRent = listing.monthlyRate || 1950;
  const cleaningFee = 150; // Standard clinical sanitization
  const depositHold = listing.securityDeposit ?? 250; // Refundable security deposit hold
  const travelerFee = 0; // $0 Traveler Booking Fee
  const totalMoveInHold = monthlyRent + cleaningFee + depositHold + travelerFee;

  // Transit times
  const driveMinutes = listing.driveTimeMinutes || 8;
  const transitMinutes = Math.round(driveMinutes * 1.8);
  const hospitalDisplay = selectedHospital
    ? selectedHospital.split(' - ')[0]
    : listing.nearestHospital || 'Medical Center';

  const isGrid = viewMode === 'grid';

  return (
    <motion.div
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onFocus={() => setIsHovered(true)}
      onBlur={(e) => {
        // Only blur if focus left the card entirely
        if (!e.currentTarget.contains(e.relatedTarget as Node)) {
          setIsHovered(false);
        }
      }}
      onClick={() => {
        if (onSelectOnMap) onSelectOnMap(listing.id);
      }}
      tabIndex={0}
      role="article"
      aria-label={`${listing.title}, $${monthlyRent.toLocaleString()} per month near ${hospitalDisplay}`}
      className={`relative rounded-2xl overflow-hidden bg-white dark:bg-[#111e33] border transition-all duration-200 ease-in-out duration-250 cursor-pointer flex flex-col justify-between group outline-none ${
        isSelectedOnMap
          ? 'border-[#0A6FA8] ring-2 ring-[#0A6FA8]/40 shadow-lg'
          : isExpanded
          ? 'border-[#0A6FA8]/60 shadow-[0_8px_24px_rgba(11,37,89,0.12)] dark:shadow-[0_8px_24px_rgba(0,0,0,0.5)] -translate-y-0.5'
          : 'border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-xs hover:border-[#0A6FA8]/40 hover:shadow-md'
      }`}
    >
      {/* 1. VISUAL PHOTO BANNER */}
      <div className={`relative w-full overflow-hidden bg-gray-100 dark:bg-[#0c182c] ${isGrid ? 'h-52 sm:h-56' : 'h-44 sm:h-48'}`}>
        <img
          src={listing.images[0]}
          alt={listing.title}
          loading="lazy"
          decoding="async"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500 ease-out"
        />

        {/* Minimalist Top Left Badge: Distance Anchor */}
        <div className="absolute top-2.5 left-2.5 inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold select-none">
          <span className="material-symbols-outlined text-[13px] text-[#aff0db]">near_me</span>
          <span>{listing.distanceBadge || `${driveMinutes} min commute`}</span>
        </div>

        {/* Top Right: Signature Pillow Save Button */}
        <div
          className="absolute top-2.5 right-2.5 z-10"
          onClick={(e) => e.stopPropagation()}
        >
          <PillowSaveButton
            isSaved={isSaved}
            onToggle={() => onToggleSave(listing.id)}
            className="w-8 h-8 rounded-full bg-white/95 dark:bg-black/75 backdrop-blur-xs shadow-xs"
            size={17}
          />
        </div>

        {/* Subtle Hover Cue Tag (disappears on hover/expand to give room) */}
        {!isExpanded && (
          <div className="absolute bottom-2 right-2.5 hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-white/90 dark:bg-[#111e33]/90 backdrop-blur-xs text-[10px] font-bold text-[#0B2559]/80 dark:text-[#E6ECF7]/80 shadow-2xs pointer-events-none transition-opacity duration-200">
            <span className="material-symbols-outlined text-[12px] text-[#0A6FA8] dark:text-[#3E9AD1]">visibility</span>
            <span>Hover for fees &amp; transit</span>
          </div>
        )}
      </div>

      {/* 2. CARD BODY: PRIMARY RESTING DETAILS */}
      <div className="p-3.5 sm:p-4 flex-1 flex flex-col justify-between gap-2.5">
        <div>
          {/* Upper Meta: Property Type & Clinician Reviews */}
          <div className="flex items-center justify-between text-[11px] text-[#404850] dark:text-[#93ccff] font-bold uppercase tracking-wider mb-1">
            <span>{listing.propertyType || 'ENTIRE CONDO'}</span>
            <div className="flex items-center gap-1 text-amber-500 tabular-nums">
              <span className="material-symbols-outlined text-[15px]">star</span>
              <span className="text-[#0B2559] dark:text-white font-bold">{listing.nurseRating}</span>
              <span className="text-gray-400 font-normal">({listing.reviewsCount})</span>
            </div>
          </div>

          {/* Listing Title */}
          <h3 className="text-sm sm:text-base font-bold text-[#0B2559] dark:text-white line-clamp-1 group-hover:text-[#0A6FA8] focus-visible:text-[#0A6FA8] dark:group-hover:text-[#3E9AD1] focus-visible:text-[#3E9AD1] transition-colors">
            {listing.title}
          </h3>

          {/* Primary Rent Headline & $0 Traveler Fee Guarantee */}
          <div className="mt-1.5 flex items-baseline gap-1.5">
            <span className="text-xl sm:text-2xl font-black text-[#0B2559] dark:text-white tabular-nums">
              ${monthlyRent.toLocaleString()}
            </span>
            <span className="text-xs text-[#404850] dark:text-[#93ccff]">/ month</span>
            <span className="text-[10px] sm:text-[11px] text-[#195b4c] dark:text-[#aff0db] font-bold bg-[#195b4c]/10 dark:bg-[#aff0db]/15 px-2 py-0.5 rounded-full ml-auto">
              $0 Traveler Fee
            </span>
          </div>

          {/* Resting Amenity Chips (Clean, low visual noise) */}
          <div className="flex flex-wrap gap-1 mt-2.5">
            {(listing.highlightBadges || ['Blackout Curtains', '≤35dB Quiet', 'Scrub Washer']).slice(0, 3).map((badge, idx) => (
              <span
                key={idx}
                className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-[#EFF6FB] dark:bg-[#182840] text-[#0A6FA8] dark:text-[#3E9AD1]"
              >
                {badge}
              </span>
            ))}
          </div>
        </div>

        {/* 3. MOBILE TOGGLE TRIGGER (Touch screens have no mouse hover) */}
        <div className="sm:hidden pt-2 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex items-center justify-between">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setIsMobileExpanded(!isMobileExpanded);
            }}
            className="text-[11px] font-bold text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center gap-1 cursor-pointer"
          >
            <span>{isMobileExpanded ? 'Hide commute & fees' : 'Show commute & fees'}</span>
            <span className={`material-symbols-outlined text-[15px] transition-transform ${isMobileExpanded ? 'rotate-180' : ''}`}>
              expand_more
            </span>
          </button>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewDetails(listing);
            }}
            className="text-[11px] font-bold text-[#0B2559] dark:text-white hover:underline cursor-pointer"
          >
            Details →
          </button>
        </div>

        {/* 4. PROGRESSIVE HOVER/EXPANDED DRAWER: SECONDARY COMMUTE & TOTAL FEES */}
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              animate={shouldReduceMotion ? { opacity: 1 } : { opacity: 1, height: 'auto' }}
              exit={shouldReduceMotion ? { opacity: 0 } : { opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
              className="overflow-hidden pt-2.5 mt-1 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550]"
            >
              {/* SECTION A: DISTANCE & COMMUTE LOGISTICS */}
              <div className="p-2.5 rounded-xl bg-[#EFF6FB]/70 dark:bg-[#16253c] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-1.5 mb-2.5">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-[#0B2559] dark:text-white flex items-center gap-1 truncate max-w-[210px]">
                    <span className="material-symbols-outlined text-[14px] text-[#0A6FA8] dark:text-[#3E9AD1] shrink-0">
                      local_hospital
                    </span>
                    <span className="truncate">{hospitalDisplay}</span>
                  </span>
                  <span className="text-[10px] font-bold text-[#195b4c] dark:text-[#aff0db] shrink-0">
                    Shift-Safe Route
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-1.5 text-[10px] text-[#404850] dark:text-[#c0c7d1]">
                  <div className="flex items-center gap-1 bg-white/70 dark:bg-[#111e33] px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[12px] text-[#0A6FA8]">directions_car</span>
                    <span className="tabular-nums font-semibold">{driveMinutes} min drive</span>
                  </div>
                  <div className="flex items-center gap-1 bg-white/70 dark:bg-[#111e33] px-2 py-1 rounded-lg">
                    <span className="material-symbols-outlined text-[12px] text-[#0A6FA8]">directions_bus</span>
                    <span className="tabular-nums font-semibold">~{transitMinutes} min transit</span>
                  </div>
                </div>
              </div>

              {/* SECTION B: ITEMISED TOTAL FEES BREAKDOWN */}
              <div className="p-2.5 rounded-xl bg-[#f8faff] dark:bg-[#0c182c] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-1 text-[11px]">
                <div className="text-[10px] font-bold uppercase tracking-wider text-[#404850] dark:text-[#93ccff] mb-1 flex items-center justify-between">
                  <span>Transparent Fee Audit</span>
                  <span className="text-[9px] text-[#195b4c] dark:text-[#aff0db] font-semibold">No Surprise Add-ons</span>
                </div>

                <div className="flex justify-between text-[#404850] dark:text-[#c0c7d1] text-[10px]">
                  <span>Monthly Lodging</span>
                  <span className="font-semibold tabular-nums text-[#0B2559] dark:text-white">
                    ${monthlyRent.toLocaleString()}
                  </span>
                </div>

                <div className="flex justify-between text-[#404850] dark:text-[#c0c7d1] text-[10px]">
                  <span>Clinical Sanitization</span>
                  <span className="font-semibold tabular-nums text-[#0B2559] dark:text-white">
                    ${cleaningFee}
                  </span>
                </div>

                <div className="flex justify-between text-[#404850] dark:text-[#c0c7d1] text-[10px]">
                  <span>Security Deposit Hold</span>
                  <span className="font-semibold tabular-nums text-[#0B2559] dark:text-white">
                    ${depositHold}
                  </span>
                </div>

                <div className="flex justify-between text-[#195b4c] dark:text-[#aff0db] text-[10px] font-semibold">
                  <span>Traveler Booking Fee</span>
                  <span className="tabular-nums">$0.00</span>
                </div>

                <div className="pt-1.5 mt-1 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex justify-between items-baseline font-bold text-xs">
                  <span className="text-[#0B2559] dark:text-white">Total Move-In Hold</span>
                  <span className="text-[#0A6FA8] dark:text-[#3E9AD1] font-black tabular-nums">
                    ${totalMoveInHold.toLocaleString()}
                  </span>
                </div>
              </div>

              {/* SECTION C: DIRECT ACTIONS */}
              <div className="pt-2.5 flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onViewDetails(listing);
                  }}
                  className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1] hover:underline cursor-pointer py-1"
                >
                  Full Checklist
                </button>

                {onRequestToBook && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onRequestToBook(listing);
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0C7EBF] active:bg-[#095C8C] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs flex items-center gap-1"
                  >
                    <span>Request to book</span>
                    <span className="material-symbols-outlined text-[13px]">arrow_forward</span>
                  </button>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* 5. RESTING ACTION BAR (Only shown when not expanded to maintain clean line) */}
        {!isExpanded && (
          <div className="hidden sm:flex pt-2.5 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] items-center justify-between gap-2">
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                onViewDetails(listing);
              }}
              className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1] hover:underline cursor-pointer"
            >
              View Details
            </button>

            {onRequestToBook && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onRequestToBook(listing);
                }}
                className="px-3 py-1 rounded-full bg-[#EFF6FB] dark:bg-[#182840] hover:bg-[#0A6FA8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] hover:text-white dark:hover:bg-[#0A6FA8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] text-[#0A6FA8] dark:text-[#3E9AD1] text-xs font-bold transition-all duration-200 ease-in-out cursor-pointer"
              >
                Book Stay
              </button>
            )}
          </div>
        )}
      </div>
    </motion.div>
  );
});
