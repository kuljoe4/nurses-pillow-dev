import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HousingListing } from '../types';
import { PillowSaveButton } from './PillowSaveButton';

interface ProductPreviewHeroProps {
  listing: HousingListing;
  isSaved: boolean;
  onToggleSave: () => void;
  onSelectListing: (listing: HousingListing) => void;
  onRequestToBook?: (listing: HousingListing) => void;
  shouldReduceMotion?: boolean | null;
}

type PreviewTab = 'radar' | 'sleep_audit' | 'pricing';
type ShiftType = 'night' | 'day';

/**
 * ProductPreviewHero
 * Replaces generic stock photography with an authentic, interactive prototype
 * of the Nurses Pillow clinical product UI, giving traveling nurses immediate
 * proof of functionality, acoustic telemetry, and assignment matching.
 */
export const ProductPreviewHero: React.FC<ProductPreviewHeroProps> = ({
  listing,
  isSaved,
  onToggleSave,
  onSelectListing,
  onRequestToBook,
  shouldReduceMotion,
}) => {
  const [activeTab, setActiveTab] = useState<PreviewTab>('radar');
  const [shiftType, setShiftType] = useState<ShiftType>('night');
  const [commuteDistance, setCommuteDistance] = useState<number>(0.8);
  const [isAuditingSound, setIsAuditingSound] = useState(false);

  // Derive dynamic commute time based on distance
  const driveMinutes = Math.max(2, Math.round(commuteDistance * 3.5));
  const walkMinutes = Math.round(commuteDistance * 16);

  const handleSimulateSoundAudit = () => {
    setIsAuditingSound(true);
    setTimeout(() => {
      setIsAuditingSound(false);
    }, 1800);
  };

  return (
    <div className="w-full rounded-[24px] bg-white dark:bg-[#0E1A2E] border border-[rgba(11,37,89,0.12)] dark:border-[#233550] shadow-[0_16px_40px_rgba(11,37,89,0.1)] dark:shadow-[0_16px_40px_rgba(0,0,0,0.55)] overflow-hidden text-left transition-all">
      {/* 1. PRODUCT WINDOW CHROME & CONTROLS */}
      <div className="px-4 sm:px-6 py-3 bg-[#EFF6FB] dark:bg-[#0B1626] border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-wrap items-center justify-between gap-3">
        {/* Window dots & App Identification */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5" aria-hidden="true">
            <span className="w-3 h-3 rounded-full bg-[#FF5F56] border border-black/10 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#FFBD2E] border border-black/10 inline-block" />
            <span className="w-3 h-3 rounded-full bg-[#27C93F] border border-black/10 inline-block" />
          </div>
          <div className="h-4 w-px bg-[rgba(11,37,89,0.12)] dark:bg-[#233550]" />
          <div className="flex items-center gap-1.5 text-xs font-semibold text-[#0B2559] dark:text-[#E6ECF7]">
            <span className="material-symbols-outlined text-[16px] text-[#0A6FA8] dark:text-[#3E9AD1]">
              radar
            </span>
            <span className="tracking-tight">Clinical Sanctuary Matcher</span>
            <span className="hidden sm:inline text-[11px] font-normal text-[#0B2559]/60 dark:text-[#E6ECF7]/60">
              · Duke University Hospital Hub
            </span>
          </div>
        </div>

        {/* Interactive Feature Tabs */}
        <div className="flex items-center gap-1 bg-white dark:bg-[#111e33] p-1 rounded-xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
          <button
            type="button"
            onClick={() => setActiveTab('radar')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'radar'
                ? 'bg-[#0A6FA8] text-white shadow-xs font-bold'
                : 'text-[#0B2559]/70 dark:text-[#E6ECF7]/70 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">distance</span>
            <span>Commute</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sleep_audit')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'sleep_audit'
                ? 'bg-[#0A6FA8] text-white shadow-xs font-bold'
                : 'text-[#0B2559]/70 dark:text-[#E6ECF7]/70 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">volume_down</span>
            <span>Quiet Audit</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('pricing')}
            className={`px-2.5 py-1 rounded-lg text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
              activeTab === 'pricing'
                ? 'bg-[#0A6FA8] text-white shadow-xs font-bold'
                : 'text-[#0B2559]/70 dark:text-[#E6ECF7]/70 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
            <span>$0 Fee Ledger</span>
          </button>
        </div>
      </div>

      {/* 2. INTERACTIVE PRODUCT BODY */}
      <div className="p-4 sm:p-6 lg:p-7 grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
        {/* Left Side: Interactive Live Dashboard / Prototype Controls */}
        <div className="lg:col-span-7 space-y-4">
          {/* Shift Schedule Mode Selector */}
          <div className="flex flex-wrap items-center justify-between gap-3 p-3 rounded-2xl bg-[#EFF6FB] dark:bg-[#111e33] border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-[#0B2559] dark:text-[#E6ECF7]">
                Shift Schedule:
              </span>
              <div className="flex items-center gap-1 bg-white dark:bg-[#0B1626] p-0.5 rounded-xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
                <button
                  type="button"
                  onClick={() => setShiftType('night')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    shiftType === 'night'
                      ? 'bg-[#0B2559] text-white shadow-xs'
                      : 'text-[#0B2559]/70 dark:text-[#E6ECF7]/70 hover:text-[#0B2559]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px] text-amber-300">
                    dark_mode
                  </span>
                  <span>Night Shift (7p–7a)</span>
                </button>
                <button
                  type="button"
                  onClick={() => setShiftType('day')}
                  className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
                    shiftType === 'day'
                      ? 'bg-[#0A6FA8] text-white shadow-xs'
                      : 'text-[#0B2559]/70 dark:text-[#E6ECF7]/70 hover:text-[#0B2559]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[14px] text-amber-400">
                    light_mode
                  </span>
                  <span>Day Shift (7a–7p)</span>
                </button>
              </div>
            </div>

            {/* Live Verification Badge (Color + Dot + Label) */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#E1EFE9] text-[#2F6E5E] text-xs font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-[#2F6E5E]" />
              <span>Verified Day-Sleeper Ready</span>
            </div>
          </div>

          {/* Dynamic Tab Panes */}
          <AnimatePresence mode="wait">
            {activeTab === 'radar' && (
              <motion.div
                key="radar"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-4"
              >
                {/* Hospital Assignment Proximity Card */}
                <div className="p-4 rounded-2xl bg-white dark:bg-[#0B1626] border border-[rgba(11,37,89,0.1)] dark:border-[#233550] shadow-xs">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-xl bg-[#EFF6FB] dark:bg-[#111e33] text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center">
                        <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                      </span>
                      <div>
                        <h4 className="text-sm font-bold text-[#0B2559] dark:text-white">
                          Duke University Hospital
                        </h4>
                        <p className="text-[11px] text-[#0B2559]/60 dark:text-[#E6ECF7]/60">
                          2301 Erwin Rd, Durham, NC · Level 1 Trauma Center
                        </p>
                      </div>
                    </div>
                    <span className="px-2.5 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] text-[11px] font-bold">
                      Main Campus
                    </span>
                  </div>

                  {/* Interactive Commute Buffer Adjuster */}
                  <div className="pt-2 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-2">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[#0B2559]/70 dark:text-[#E6ECF7]/70 font-medium">
                        Adjust assignment commute buffer:
                      </span>
                      <span className="font-extrabold text-[#0A6FA8] dark:text-[#3E9AD1] tabular-nums">
                        {commuteDistance} mi ({driveMinutes} min drive · {walkMinutes} min walk)
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <input
                        type="range"
                        min="0.4"
                        max="3.0"
                        step="0.2"
                        value={commuteDistance}
                        onChange={(e) => setCommuteDistance(parseFloat(e.target.value))}
                        className="w-full accent-[#0A6FA8] cursor-pointer"
                        aria-label="Commute buffer distance"
                      />
                    </div>
                  </div>
                </div>

                {/* Clinical Match Metrics Grid */}
                <div className="grid grid-cols-3 gap-2.5">
                  <div className="p-3 rounded-xl bg-[#EFF6FB] dark:bg-[#111e33] border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                    <span className="text-[10px] uppercase font-bold text-[#0B2559]/60 dark:text-[#E6ECF7]/60 tracking-wider block mb-1">
                      Daytime Decibels
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-[#0B2559] dark:text-white tabular-nums">
                        24
                      </span>
                      <span className="text-xs text-[#0A6FA8] font-bold">dB</span>
                    </div>
                    <span className="text-[11px] text-[#2F6E5E] font-semibold block mt-0.5">
                      ✓ Sound-meter passed
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#EFF6FB] dark:bg-[#111e33] border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                    <span className="text-[10px] uppercase font-bold text-[#0B2559]/60 dark:text-[#E6ECF7]/60 tracking-wider block mb-1">
                      Blackout Coverage
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-[#0B2559] dark:text-white tabular-nums">
                        100
                      </span>
                      <span className="text-xs text-[#0A6FA8] font-bold">%</span>
                    </div>
                    <span className="text-[11px] text-[#2F6E5E] font-semibold block mt-0.5">
                      ✓ Zero light bleed
                    </span>
                  </div>

                  <div className="p-3 rounded-xl bg-[#EFF6FB] dark:bg-[#111e33] border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                    <span className="text-[10px] uppercase font-bold text-[#0B2559]/60 dark:text-[#E6ECF7]/60 tracking-wider block mb-1">
                      Traveler Platform Fee
                    </span>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-[#2F6E5E] tabular-nums">$0</span>
                    </div>
                    <span className="text-[11px] text-[#2F6E5E] font-semibold block mt-0.5">
                      ✓ Transparent rate
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'sleep_audit' && (
              <motion.div
                key="sleep_audit"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="space-y-3 p-4 rounded-2xl bg-[#EFF6FB] dark:bg-[#111e33] border border-[rgba(11,37,89,0.08)] dark:border-[#233550]"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[#0A6FA8] dark:text-[#3E9AD1]">
                      graphic_eq
                    </span>
                    <span className="text-xs font-bold text-[#0B2559] dark:text-white">
                      Physical Acoustic &amp; Light Inspection Telemetry
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={handleSimulateSoundAudit}
                    disabled={isAuditingSound}
                    className="px-3 py-1 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-semibold transition-colors cursor-pointer disabled:opacity-50"
                  >
                    {isAuditingSound ? 'Sampling room...' : 'Test live sound probe'}
                  </button>
                </div>

                {/* Acoustic Visualizer Wave */}
                <div className="h-12 w-full rounded-xl bg-white dark:bg-[#0B1626] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex items-center justify-center px-4 gap-1.5 overflow-hidden">
                  {[18, 22, 28, 20, 24, 19, 21, 25, 23, 19, 22, 26, 20, 24, 21, 19, 23, 27, 22, 20].map(
                    (val, idx) => (
                      <motion.div
                        key={idx}
                        animate={
                          isAuditingSound
                            ? { height: [val * 0.7, val * 1.5, val * 0.7] }
                            : { height: val }
                        }
                        transition={{
                          duration: 0.3,
                          repeat: isAuditingSound ? Infinity : 0,
                          delay: idx * 0.03,
                        }}
                        className={`w-1.5 rounded-full ${
                          val > 25 ? 'bg-amber-400' : 'bg-[#0A6FA8] dark:bg-[#3E9AD1]'
                        }`}
                      />
                    )
                  )}
                </div>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="flex items-center gap-2 text-[#0B2559] dark:text-[#E6ECF7]">
                    <span className="material-symbols-outlined text-[16px] text-[#2F6E5E]">check_circle</span>
                    <span>Dohm white noise machine verified</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#0B2559] dark:text-[#E6ECF7]">
                    <span className="material-symbols-outlined text-[16px] text-[#2F6E5E]">check_circle</span>
                    <span>Floor dampeners on scrub washer</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#0B2559] dark:text-[#E6ECF7]">
                    <span className="material-symbols-outlined text-[16px] text-[#2F6E5E]">check_circle</span>
                    <span>Magnetic edge seal on velvet drapes</span>
                  </div>
                  <div className="flex items-center gap-2 text-[#0B2559] dark:text-[#E6ECF7]">
                    <span className="material-symbols-outlined text-[16px] text-[#2F6E5E]">check_circle</span>
                    <span>Smart lock quiet keypad chime</span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'pricing' && (
              <motion.div
                key="pricing"
                initial={shouldReduceMotion ? false : { opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={shouldReduceMotion ? undefined : { opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
                className="p-4 rounded-2xl bg-[#EFF6FB] dark:bg-[#111e33] border border-[rgba(11,37,89,0.08)] dark:border-[#233550] space-y-2 text-xs"
              >
                <div className="flex items-center justify-between pb-2 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
                  <span className="font-bold text-[#0B2559] dark:text-white">
                    Transparent Itemized Lease Breakdown
                  </span>
                  <span className="px-2 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] font-bold text-[10px]">
                    Contract-Ready
                  </span>
                </div>

                <div className="space-y-1.5 pt-1 tabular-nums">
                  <div className="flex justify-between text-[#0B2559]/80 dark:text-[#E6ECF7]/80">
                    <span>Monthly Furnished Rent</span>
                    <span className="font-semibold text-[#0B2559] dark:text-white">
                      ${listing.monthlyRate.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#0B2559]/80 dark:text-[#E6ECF7]/80">
                    <span>Clinical Scrub Cleaning Fee (one-time)</span>
                    <span className="font-semibold text-[#0B2559] dark:text-white">
                      $120
                    </span>
                  </div>
                  <div className="flex justify-between text-[#0B2559]/80 dark:text-[#E6ECF7]/80">
                    <span>Security Deposit Hold (refundable)</span>
                    <span className="font-semibold text-[#0B2559] dark:text-white">
                      ${listing.securityDeposit ?? 500}
                    </span>
                  </div>
                  <div className="flex justify-between text-[#2F6E5E] font-bold">
                    <span>Traveler Platform Booking Fee</span>
                    <span>$0.00 (Guaranteed)</span>
                  </div>
                  <div className="pt-2 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex justify-between text-sm font-black text-[#0B2559] dark:text-white">
                    <span>Move-in Total</span>
                    <span>
                      ${(listing.monthlyRate + 120 + (listing.securityDeposit ?? 500)).toLocaleString()}
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Interactive CTAs */}
          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onSelectListing(listing)}
              className="px-5 py-2.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs sm:text-sm font-bold shadow-sm transition-colors cursor-pointer flex items-center gap-1.5"
            >
              <span>Explore full sanctuary profile</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>

            {onRequestToBook && (
              <button
                type="button"
                onClick={() => onRequestToBook(listing)}
                className="px-5 py-2.5 rounded-full bg-[#0B2559] hover:bg-[#162e62] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <span>Request to book</span>
              </button>
            )}

            <div className="ml-auto flex items-center gap-2">
              <PillowSaveButton
                isSaved={isSaved}
                onToggle={onToggleSave}
                className="w-9 h-9 rounded-full bg-[#EFF6FB] dark:bg-[#111e33] shadow-xs"
                size={18}
              />
            </div>
          </div>
        </div>

        {/* Right Side: High-Fidelity UI Prototype Preview (Listing Card In-Situ) */}
        <div className="lg:col-span-5 relative">
          <div
            onClick={() => onSelectListing(listing)}
            className="w-full rounded-2xl bg-white dark:bg-[#0B1626] border border-[rgba(11,37,89,0.1)] dark:border-[#233550] overflow-hidden shadow-sm hover:shadow-md transition-all cursor-pointer group"
          >
            {/* Real photo with shift-aware ambient lighting overlay */}
            <div className="relative h-44 sm:h-48 w-full overflow-hidden bg-gray-100">
              <img
                src={listing.images[0]}
                alt={listing.title}
                loading="eager"
                decoding="async"
                referrerPolicy="no-referrer"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />

              {/* Day / Night Shift Ambient Lighting Simulation */}
              <div
                className={`absolute inset-0 transition-colors duration-500 pointer-events-none ${
                  shiftType === 'night'
                    ? 'bg-gradient-to-t from-[#0B2559]/90 via-[#0B2559]/30 to-black/30'
                    : 'bg-gradient-to-t from-black/60 via-transparent to-transparent'
                }`}
              />

              {/* Status Tags */}
              <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-black/70 backdrop-blur-xs text-white text-[11px] font-semibold">
                <span className="material-symbols-outlined text-[13px] text-amber-300">
                  {shiftType === 'night' ? 'bedtime' : 'wb_sunny'}
                </span>
                <span>{shiftType === 'night' ? 'Day-Sleep Certified' : 'Daylight Retreat'}</span>
              </div>

              <div className="absolute top-3 right-3 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#2F6E5E] text-white text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                <span>&lt;28 dB</span>
              </div>

              <div className="absolute bottom-3 left-3 right-3 text-white">
                <div className="text-[11px] text-[#F1CF78] font-semibold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[13px]">near_me</span>
                  <span>{commuteDistance} mi to Duke · {driveMinutes} min commute</span>
                </div>
                <h5 className="text-sm font-bold text-white line-clamp-1 group-hover:text-[#93ccff] transition-colors">
                  {listing.title}
                </h5>
              </div>
            </div>

            {/* In-Situ Card Details */}
            <div className="p-4 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-bold text-[#0B2559] dark:text-white uppercase tracking-wider text-[11px]">
                  {listing.propertyType || 'Entire Sanctuary'}
                </span>
                <div className="flex items-center gap-1 text-amber-500 font-bold">
                  <span className="material-symbols-outlined text-[14px]">star</span>
                  <span className="text-[#0B2559] dark:text-white">{listing.nurseRating}</span>
                  <span className="text-[#0B2559]/50 dark:text-[#E6ECF7]/50 font-normal">
                    ({listing.reviewsCount})
                  </span>
                </div>
              </div>

              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-xl font-black text-[#0B2559] dark:text-white tabular-nums">
                    ${listing.monthlyRate.toLocaleString()}
                  </span>
                  <span className="text-xs text-[#0B2559]/70 dark:text-[#E6ECF7]/70 font-medium">
                    {' '}/ month
                  </span>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] text-[11px] font-bold">
                  $0 Traveler Fee
                </span>
              </div>

              {/* Clinical Badges */}
              <div className="flex flex-wrap gap-1">
                {(listing.highlightBadges?.slice(0, 3) || [
                  'Blackout Curtains',
                  '≤35dB Quiet Daytime',
                  'In-unit Laundry',
                ]).map((badge, idx) => (
                  <span
                    key={idx}
                    className="px-2 py-0.5 rounded-md text-[10px] font-medium bg-[#EFF6FB] dark:bg-[#111e33] text-[#0A6FA8] dark:text-[#3E9AD1]"
                  >
                    {badge}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
