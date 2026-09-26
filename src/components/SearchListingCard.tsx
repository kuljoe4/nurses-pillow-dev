import React, { useState } from 'react';
import { motion } from 'framer-motion';
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
      onMouseEnter={() => { if (onSelectOnMap) onSelectOnMap(listing.id); }}

      onFocus={() => { if (onSelectOnMap) onSelectOnMap(listing.id); }}

      onClick={() => onViewDetails(listing)}
      tabIndex={0}
      role="article"
      aria-label={`${listing.title}, $${monthlyRent.toLocaleString()} per month near ${hospitalDisplay}`}
      className={`relative rounded-2xl overflow-hidden bg-white dark:bg-[#111e33] border transition-all duration-250 cursor-pointer flex flex-col justify-between group outline-none ${
        isSelectedOnMap
          ? 'border-[#0A6FA8] ring-2 ring-[#0A6FA8]/40 shadow-lg'
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
          <h3 className="text-sm sm:text-base font-bold text-[#0B2559] dark:text-white line-clamp-1 group-hover:text-[#0A6FA8] dark:group-hover:text-[#3E9AD1] transition-colors">
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

        {/* 3. RESTING ACTION BAR (Only shown when not expanded to maintain clean line) */}
        <div className="flex pt-2.5 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] items-center justify-between gap-2">
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
                className="px-3 py-1 rounded-full bg-[#EFF6FB] dark:bg-[#182840] hover:bg-[#0A6FA8] hover:text-white dark:hover:bg-[#0A6FA8] text-[#0A6FA8] dark:text-[#3E9AD1] text-xs font-bold transition-all cursor-pointer"
              >
                Book Stay
              </button>
            )}
          </div>
      </div>
    </motion.div>
  );
});
