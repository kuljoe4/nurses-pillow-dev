import React, { useState } from 'react';
import { HousingListing, BookingRequest } from '../types';
import { TrustBreakdownCard } from './TrustBreakdownCard';
import { PillowSaveButton } from './PillowSaveButton';


// ⚡ Bolt Performance Optimization: Extracted wrapper to prevent inline arrow functions
// from breaking PillowSaveButton's memoization in lists.
const PillowSaveButtonWrapper = React.memo(({ listingId, isSaved, onToggleSave, size, className }: { listingId: string, isSaved: boolean, onToggleSave: (id: string) => void, size?: number, className?: string }) => {
  const handleToggle = React.useCallback(() => {
    onToggleSave(listingId);
  }, [onToggleSave, listingId]);

  return (
    <PillowSaveButton
      isSaved={isSaved}
      onToggle={handleToggle}
      size={size}
      className={className}
    />
  );
});


interface NurseDashboardViewProps {
  isNightShiftMode: boolean;
  savedListingIds: string[];
  allListings?: HousingListing[];
  onToggleSave: (id: string) => void;
  onSelectListing?: (listing: HousingListing) => void;
  onGoToHousing: () => void;
  activeBookings?: BookingRequest[];
  isVerified?: boolean;
  onGoToVerification?: () => void;
  onOpenSupport?: () => void;
  currentUser?: {
    id?: string;
    role: string;
    name: string;
    email?: string;
    isNurseVerified?: boolean;
    isHostVerified?: boolean;
    isIdVerified?: boolean;
  };
  verificationData?: any;
}

export const NurseDashboardView: React.FC<NurseDashboardViewProps> = ({
  isNightShiftMode,
  savedListingIds,
  allListings = [],
  onToggleSave,
  onSelectListing,
  onGoToHousing,
  activeBookings = [],
  isVerified,
  onGoToVerification,
  onOpenSupport,
  currentUser,
  verificationData,
}) => {
  const [activeTab, setActiveTab] = useState<'bookings' | 'saved' | 'verification'>('bookings');

  const savedListings = React.useMemo(() => {
    // Single pass using Set for O(N) lookup instead of array includes O(N * M)
    const savedIdsSet = new Set(savedListingIds);
    const result = [];
    for (let i = 0; i < allListings.length; i++) {
      if (savedIdsSet.has(allListings[i].id)) {
        result.push(allListings[i]);
      }
    }
    return result;
  }, [allListings, savedListingIds]);

  const isDemoAccount = Boolean(
    currentUser?.id?.startsWith('usr_demo') ||
    currentUser?.email === 'sarah.jenkins@ucsf.edu' ||
    currentUser?.email === 'sarah@example.com'
  );

  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || (isDemoAccount ? 'Sarah Jenkins' : 'Travel Clinician');
  const displayEmail = currentUser?.email || verificationData?.workEmail || '';

  // ⚡ Bolt Performance Optimization: Prevent multiple intermediate array allocations
  // Replaced chained .split().map().filter() with a single pass loop for initials
  let calculatedInitials = '';
  let isNewWord = true;
  for (let i = 0; i < displayName.length && calculatedInitials.length < 2; i++) {
    const char = displayName[i];
    if (char === ' ') {
      isNewWord = true;
    } else if (isNewWord) {
      calculatedInitials += char;
      isNewWord = false;
    }
  }
  const initials = calculatedInitials.toUpperCase() || 'RN';

  const userIsVerified = Boolean(
    currentUser?.isNurseVerified ||
    (isVerified !== undefined ? isVerified : false) ||
    verificationData?.licenseStatus === 'verified'
  );

  const isIdVerified = Boolean(
    (currentUser as any)?.isIdVerified ||
    verificationData?.isIdVerified
  );

  const phoneVerified = Boolean(
    verificationData?.phoneVerified
  );

  return (
    <div
      className={`w-full min-h-[80vh] py-5 sm:py-6 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto space-y-4 sm:space-y-5 transition-colors ${
        isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#0B2559]'
      }`}
    >
      {/* Clinician Overview & Key Metrics - Card-Based Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-3.5 sm:gap-4">
        {/* Clinician Identity Card */}
        <div className="lg:col-span-7 bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
          <div className="flex items-start gap-3.5 sm:gap-4">
            <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-[#0A6FA8]/10 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center font-bold text-lg shrink-0">
              {initials}
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-0.5">
                <h1 className="text-lg sm:text-xl font-bold tracking-tight text-[#0B2559] dark:text-white truncate">
                  {displayName}
                </h1>
                <span
                  className="px-2.5 py-0.5 rounded-full text-[11px] font-bold inline-flex items-center gap-1"
                  style={
                    userIsVerified
                      ? { backgroundColor: '#E1EFE9', color: '#2F6E5E' }
                      : { backgroundColor: '#FBF0D6', color: '#B9822E' }
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: userIsVerified ? '#2F6E5E' : '#B9822E' }} />
                  {userIsVerified ? 'Nurses Pillow Verified' : 'Audit In Progress'}
                </span>
              </div>
              <p className="text-xs text-[#0B2559]/70 dark:text-[#E6ECF7]/70 truncate">
                {displayEmail || 'Traveling Healthcare Professional'} • Level 1 Trauma Assignment Housing
              </p>
            </div>
          </div>

          {/* Action Row */}
          <div className="flex flex-wrap items-center gap-2 mt-4 pt-3.5 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550]">
            <button
              type="button"
              onClick={onGoToHousing}
              className="px-4 py-2 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold transition-all shadow-[0_1px_3px_rgba(10,111,168,0.25)] cursor-pointer"
            >
              Search housing
            </button>
            {!userIsVerified && onGoToVerification && (
              <button
                type="button"
                onClick={onGoToVerification}
                className="px-3.5 py-2 rounded-full border border-[#0A6FA8] text-[#0A6FA8] hover:bg-[#EFF6FB] dark:hover:bg-[#0E1A2E] text-xs font-bold transition-colors cursor-pointer"
              >
                Complete verification
              </button>
            )}
            {onOpenSupport && (
              <button
                type="button"
                onClick={onOpenSupport}
                className="px-3.5 py-2 rounded-full text-xs font-semibold text-[#0B2559]/80 dark:text-gray-300 hover:bg-[#EFF6FB] dark:hover:bg-[#182840] transition-colors cursor-pointer"
              >
                Clinician support
              </button>
            )}
          </div>
        </div>

        {/* 3 Metric Cards Grid */}
        <div className="lg:col-span-5 grid grid-cols-3 gap-2.5 sm:gap-3">
          <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-gray-500 block">Active Requests</span>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-[#0B2559] dark:text-white tabular-nums">
                {activeBookings.length}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {activeBookings.length === 1 ? 'Stay' : 'Stays'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-gray-500 block">Saved Properties</span>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-[#0B2559] dark:text-white tabular-nums">
                {savedListingIds.length}
              </span>
              <span className="text-[10px] text-gray-400 block mt-0.5">
                {savedListingIds.length === 1 ? 'Property' : 'Properties'}
              </span>
            </div>
          </div>

          <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-3.5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between">
            <span className="text-[11px] font-medium text-gray-500 block">Traveler Fee</span>
            <div>
              <span className="text-xl sm:text-2xl font-bold text-[#2F6E5E] dark:text-[#aff0db] tabular-nums">
                $0
              </span>
              <span className="text-[10px] text-[#2F6E5E] dark:text-[#aff0db] font-semibold block mt-0.5">
                Guaranteed
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Segmented Tab Navigation Capsule */}
      <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
        <div className="inline-flex p-1 rounded-full bg-[#EFF6FB] dark:bg-[#0E1A2E] border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
          <button
            type="button"
            onClick={() => setActiveTab('bookings')}
            className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'bookings'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">hotel</span>
            <span>Stays</span>
            {activeBookings.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-[#0A6FA8] text-white text-[10px] font-bold tabular-nums">
                {activeBookings.length}
              </span>
            )}
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('saved')}
            className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'saved'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">bookmark</span>
            <span>Saved Properties</span>
            <span className="px-1.5 py-0.2 rounded-full bg-[#F1CF78] text-[#745b0d] text-[10px] font-bold tabular-nums">
              {savedListingIds.length}
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('verification')}
            className={`py-1.5 px-3.5 rounded-full text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'verification'
                ? 'bg-white dark:bg-[#182840] text-[#0B2559] dark:text-white shadow-[0_1px_3px_rgba(11,37,89,0.08)]'
                : 'text-gray-600 dark:text-gray-300 hover:text-[#0B2559] dark:hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">verified_user</span>
            <span>Trust &amp; Credential Status</span>
            <span
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: userIsVerified ? '#2F6E5E' : '#B9822E' }}
            />
          </button>
        </div>
      </div>

      {/* TAB 1: Stays & Requests */}
      {activeTab === 'bookings' && (
        <div>
          {activeBookings.length === 0 ? (
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-8 sm:p-10 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col items-center justify-center text-center max-w-xl mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#EFF6FB] dark:bg-[#182840] flex items-center justify-center mb-3 text-[#0A6FA8] dark:text-[#3E9AD1]">
                <span className="material-symbols-outlined text-[24px]">hotel</span>
              </div>
              <h2 className="text-base sm:text-lg font-bold mb-1.5 text-[#0B2559] dark:text-white">
                No active property bookings
              </h2>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-5 leading-relaxed">
                When you request to book a furnished property near your hospital assignment, your reservation status, pre-authorization hold, and host response will appear here.
              </p>
              <button
                type="button"
                onClick={onGoToHousing}
                className="px-5 py-2 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Search housing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {activeBookings.map((booking) => {
                const listing = allListings.find((l) => l.id === booking.listingId);
                const isAccepted = booking.status === 'approved' || booking.status === 'active';
                const isDeclined = booking.status === 'declined';
                const isPending = !isAccepted && !isDeclined;

                return (
                  <div
                    key={booking.id}
                    className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-5 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between space-y-4"
                  >
                    {/* Booking Header Tag */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <span
                        className="px-2.5 py-1 rounded-sm text-[11px] font-bold uppercase tracking-wider"
                        style={
                          isAccepted
                            ? { backgroundColor: '#E1EFE9', color: '#2F6E5E' }
                            : isDeclined
                            ? { backgroundColor: '#F4E2DC', color: '#A8452E' }
                            : { backgroundColor: '#FBF0D6', color: '#B9822E' }
                        }
                      >
                        {isAccepted ? 'Accepted & Confirmed' : isDeclined ? 'Declined' : 'Requested — Hold Placed'}
                      </span>
                      <div className="text-xs font-semibold text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px]">local_hospital</span>
                        <span className="truncate max-w-[180px]">{booking.hospitalName || 'Placement Hospital'}</span>
                      </div>
                    </div>

                    {/* Booking Content Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-12 gap-3.5 items-start">
                      {/* Thumbnail */}
                      <div className="sm:col-span-4 relative rounded-xl overflow-hidden aspect-[4/3] bg-gray-100 dark:bg-gray-800">
                        <img
                          src={
                            listing?.images?.[0] ||
                            'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80'
                          }
                          alt={booking.listingTitle || 'Property housing'}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute bottom-1.5 left-1.5 right-1.5 text-white bg-black/70 backdrop-blur-xs p-1.5 rounded-lg text-[10px]">
                          <div className="truncate font-semibold">{booking.listingTitle}</div>
                        </div>
                      </div>

                      {/* Details & Transparent Pricing */}
                      <div className="sm:col-span-8 space-y-2.5">
                        <div>
                          <h2 className="text-base font-bold tracking-tight text-[#0B2559] dark:text-white truncate">
                            {booking.listingTitle}
                          </h2>
                          <p className="text-xs text-gray-500 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                            <span className="material-symbols-outlined text-[14px] text-[#0A6FA8]">calendar_month</span>
                            <span>
                              {booking.startDate} – {booking.endDate} ({booking.durationWeeks || 13} wks)
                            </span>
                          </p>
                        </div>

                        {/* Itemized Pricing Guarantee */}
                        <div className="p-3 rounded-xl bg-[#EFF6FB] dark:bg-[#0E1A2E] space-y-1 text-[11px]">
                          <div className="flex justify-between text-gray-600 dark:text-gray-300">
                            <span>Monthly Rent</span>
                            <span className="font-semibold tabular-nums">${booking.monthlyRent?.toLocaleString()} / mo</span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-300">
                            <span>Cleaning Fee</span>
                            <span className="font-semibold tabular-nums">${booking.cleaningFee || 150}</span>
                          </div>
                          <div className="flex justify-between text-gray-600 dark:text-gray-300">
                            <span>Traveler Fee</span>
                            <span className="font-bold text-[#2F6E5E] dark:text-[#aff0db] tabular-nums">$0.00</span>
                          </div>
                          <div className="pt-1.5 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex justify-between font-bold text-[#0B2559] dark:text-white">
                            <span>Initial Pre-Authorization</span>
                            <span className="tabular-nums text-xs text-[#0A6FA8] dark:text-[#3E9AD1]">
                              ${booking.totalInitialCharge?.toLocaleString() || (booking.monthlyRent + (booking.cleaningFee || 150)).toLocaleString()}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Status Notice Callout */}
                    <div className="p-3 rounded-xl bg-[#EFF6FB]/60 dark:bg-[#14233a] text-[11px] text-gray-600 dark:text-gray-300">
                      {isPending && (
                        <p>
                          <strong>Hold Status:</strong> Funds pre-authorized. Host has 24 hours to confirm. If declined, hold releases instantly.
                        </p>
                      )}
                      {isAccepted && (
                        <p className="text-[#2F6E5E] dark:text-[#aff0db] font-medium">
                          <strong>Confirmed:</strong> Reservation secured for hospital rotation dates.
                        </p>
                      )}
                      {isDeclined && (
                        <p className="text-[#A8452E] dark:text-red-300 font-medium">
                          <strong>Hold Released:</strong> Rotation dates unavailable; pre-authorization voided.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: My Saved Properties */}
      {activeTab === 'saved' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-[#0B2559] dark:text-white">Saved Properties</h2>
              <p className="text-xs text-gray-500">Furnished sanctuaries bookmarked for your hospital rotations</p>
            </div>
            <button
              type="button"
              onClick={onGoToHousing}
              className="px-4 py-1.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold cursor-pointer transition-colors"
            >
              Search housing
            </button>
          </div>

          {savedListings.length === 0 ? (
            <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-8 sm:p-10 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col items-center justify-center text-center max-w-sm mx-auto">
              <div className="w-12 h-12 rounded-full bg-[#EFF6FB] dark:bg-[#182840] flex items-center justify-center mb-3 text-[#0A6FA8] dark:text-[#3E9AD1]">
                <span className="material-symbols-outlined text-[24px]">bookmark</span>
              </div>
              <h3 className="text-sm font-bold text-[#0B2559] dark:text-white mb-1">
                No saved properties yet
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                Tap the pillow icon on any shift-ready property to save and compare commute times to your hospital.
              </p>
              <button
                type="button"
                onClick={onGoToHousing}
                className="px-4 py-2 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Search housing
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {savedListings.map((listing) => (
                <div
                  key={listing.id}
                  className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col justify-between"
                >
                  <div>
                    <div className="relative rounded-xl overflow-hidden aspect-video mb-2.5">
                      <img
                        src={listing.images?.[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=400&q=80'}
                        alt={listing.title}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute top-2 right-2">
                        <PillowSaveButtonWrapper
                          listingId={listing.id}
                          isSaved={true}
                          onToggleSave={onToggleSave}
                          size={15}
                          className="w-7 h-7 rounded-full bg-white/95 dark:bg-black/80 flex items-center justify-center shadow-xs cursor-pointer"
                        />
                      </div>
                      <div className="absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                        {listing.distanceBadge || listing.proximityToHospital}
                      </div>
                    </div>
                    <h3 className="font-bold text-xs leading-snug mb-0.5 line-clamp-2 text-[#0B2559] dark:text-white">
                      {listing.title}
                    </h3>
                    <div className="text-[11px] text-gray-500 mb-2.5">
                      {listing.neighborhood ? `${listing.neighborhood}, ` : ''}{listing.city}
                    </div>
                  </div>

                  <div className="pt-2.5 border-t border-[rgba(11,37,89,0.05)] dark:border-[#233550] flex items-center justify-between">
                    <div>
                      <span className="text-sm font-bold text-[#0B2559] dark:text-white tabular-nums">
                        ${listing.monthlyRate.toLocaleString()}
                      </span>
                      <span className="text-[10px] text-gray-500"> / mo</span>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (onSelectListing) {
                          onSelectListing(listing);
                        } else {
                          onGoToHousing();
                        }
                      }}
                      className="px-3 py-1.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold cursor-pointer transition-colors"
                    >
                      View property
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: Trust & Credential Status */}
      {activeTab === 'verification' && (
        <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-4 sm:p-6 shadow-[0_2px_12px_rgba(11,37,89,0.06)] dark:shadow-[0_2px_12px_rgba(0,0,0,0.3)] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-[rgba(11,37,89,0.05)] dark:border-[#233550]">
            <div>
              <span className="text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db] uppercase tracking-wider">
                Verification Status
              </span>
              <h2 className="text-lg sm:text-xl font-bold text-[#0B2559] dark:text-white">
                Verification &amp; Credential Status
              </h2>
            </div>
            <span
              className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold"
              style={
                userIsVerified
                  ? { backgroundColor: '#E1EFE9', color: '#2F6E5E' }
                  : { backgroundColor: '#FBF0D6', color: '#B9822E' }
              }
            >
              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: userIsVerified ? '#2F6E5E' : '#B9822E' }} />
              <span>{userIsVerified ? 'Nurses Pillow Verified' : 'Audit In Progress'}</span>
            </span>
          </div>

          <div className="text-xs text-gray-500">
            Primary Clinician Credential Audit:{' '}
            <strong className="text-[#0B2559] dark:text-white font-bold">{displayName}</strong>
            {' • '}{verificationData?.professionSpecialty || 'Registered Nurse'}
          </div>

          {/* Streamlined Verification Sources (Single Grid, Zero Redundancy) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl bg-[#EFF6FB] dark:bg-[#0E1A2E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0A6FA8]/15 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">badge</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-[#0B2559] dark:text-white">Government Photo ID &amp; Biometrics</div>
                  <div className="text-[10px] text-gray-500">RealID and live facial match verified</div>
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={isIdVerified ? { backgroundColor: '#E1EFE9', color: '#2F6E5E' } : { backgroundColor: '#FBF0D6', color: '#B9822E' }}
              >
                {isIdVerified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EFF6FB] dark:bg-[#0E1A2E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0A6FA8]/15 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">phonelink_ring</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-[#0B2559] dark:text-white">Mobile Carrier Phone Check</div>
                  <div className="text-[10px] text-gray-500">
                    {verificationData?.mobilePhone || 'Secure mobile line for shift alerts'}
                  </div>
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={phoneVerified ? { backgroundColor: '#E1EFE9', color: '#2F6E5E' } : { backgroundColor: '#FBF0D6', color: '#B9822E' }}
              >
                {phoneVerified ? 'Verified' : 'Pending'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EFF6FB] dark:bg-[#0E1A2E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#2F6E5E]/15 text-[#2F6E5E] dark:text-[#aff0db] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">health_and_safety</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-[#0B2559] dark:text-white">State Board Nursing License</div>
                  <div className="text-[10px] text-gray-500">Nursys primary source registry active</div>
                </div>
              </div>
              <span
                className="px-2 py-0.5 rounded-full text-[10px] font-bold"
                style={userIsVerified ? { backgroundColor: '#E1EFE9', color: '#2F6E5E' } : { backgroundColor: '#FBF0D6', color: '#B9822E' }}
              >
                {userIsVerified ? 'Active' : 'Pending'}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-[#EFF6FB] dark:bg-[#0E1A2E] flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#0A6FA8]/15 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[18px]">public</span>
                </div>
                <div>
                  <div className="font-bold text-xs text-[#0B2559] dark:text-white">eNLC Compact Endorsement</div>
                  <div className="text-[10px] text-gray-500">Multi-state rotation authorization</div>
                </div>
              </div>
              <span className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1]">
                {userIsVerified ? 'Eligible' : 'Pending'}
              </span>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-[#E1EFE9] dark:bg-[#142823] text-xs text-[#2F6E5E] dark:text-[#aff0db] leading-relaxed flex items-start gap-2.5">
            <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">lock</span>
            <div>
              <strong>Zero Raw License Exposure Safeguard:</strong> In compliance with Nurses Pillow privacy standards, raw state license numbers and uploaded identity documents are permanently purged from server storage post-verification. Hosts only receive verified trust audit badges.
            </div>
          </div>

          {!userIsVerified && onGoToVerification && (
            <div className="pt-1 flex justify-end">
              <button
                type="button"
                onClick={onGoToVerification}
                className="px-5 py-2 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Continue credential verification
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
