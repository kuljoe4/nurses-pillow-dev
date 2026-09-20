import React, { useState, useMemo } from 'react';
import { HousingListing } from '../types';
import { MOCK_LISTINGS, MOCK_HOSPITALS } from '../data/mockData';
import { ListingDetailModal } from './ListingDetailModal';

interface FindHousingViewProps {
  isNightShiftMode: boolean;
  savedListingIds: string[];
  onToggleSave: (id: string) => void;
  isVerified: boolean;
  onGoToVerification: () => void;
}

export const FindHousingView: React.FC<FindHousingViewProps> = ({
  isNightShiftMode,
  savedListingIds,
  onToggleSave,
  isVerified,
  onGoToVerification,
}) => {
  const [searchQuery, setSearchQuery] = useState('Stanford Health Care');
  const [selectedDurationWeeks, setSelectedDurationWeeks] = useState(13);
  const [commuteMinutes, setCommuteMinutes] = useState(10);
  const [filterBlackout, setFilterBlackout] = useState(false);
  const [filterQuietHours, setFilterQuietHours] = useState(false);
  const [filterWasherDryer, setFilterWasherDryer] = useState(false);
  const [filterPets, setFilterPets] = useState(false);

  const [activeDetailListing, setActiveDetailListing] = useState<HousingListing | null>(null);

  const durationOptions = [
    { label: '4 wks', value: 4 },
    { label: '8 wks', value: 8 },
    { label: '13 wks standard', value: 13 },
    { label: '26 wks extended', value: 26 },
  ];

  const filteredListings = useMemo(() => {
    return MOCK_LISTINGS.filter((listing) => {
      if (
        searchQuery &&
        !listing.nearestHospital.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !listing.city.toLowerCase().includes(searchQuery.toLowerCase()) &&
        !listing.title.toLowerCase().includes(searchQuery.toLowerCase())
      ) {
        // Soft match, allow all if search query is broad
      }
      if (filterBlackout && !listing.amenities.blackoutCurtains) return false;
      if (filterQuietHours && !listing.amenities.daySleeperQuietHours) return false;
      if (filterWasherDryer && !listing.amenities.washerDryerInUnit) return false;
      if (filterPets && !listing.amenities.petFriendly) return false;
      if (listing.driveTimeMinutes > commuteMinutes + 5) return false;
      return true;
    });
  }, [searchQuery, filterBlackout, filterQuietHours, filterWasherDryer, filterPets, commuteMinutes]);

  return (
    <div
      className={`w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-12 transition-colors ${
        isNightShiftMode ? 'bg-[#08101C]' : 'bg-[#f2f3ff]'
      }`}
    >
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Verification Alert Banner if not verified */}
        {!isVerified && (
          <div
            onClick={onGoToVerification}
            className={`p-4 rounded-2xl flex items-center justify-between gap-4 cursor-pointer transition-all border shadow-xs hover:scale-[1.005] ${
              isNightShiftMode
                ? 'bg-[#15233a] border-[#3E9AD1]/40 text-[#E6ECF7]'
                : 'bg-white border-[#0a6fa8]/30 text-[#001848]'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#aff0db]/30 text-[#195b4c] flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined">verified_user</span>
              </div>
              <div>
                <p className="text-sm font-bold">
                  Step 3 Pending: Complete Your Nursing License Verification
                </p>
                <p className="text-xs opacity-80">
                  Verify your active credentials to unlock nurse-only discounted rates ($600+/mo savings) &amp; Contract Flex Protection.
                </p>
              </div>
            </div>
            <button
              type="button"
              className="shrink-0 px-4 py-2 rounded-full bg-[#0a6fa8] text-white text-xs font-semibold flex items-center gap-1 shadow-xs"
            >
              <span>Verify License</span>
              <span className="material-symbols-outlined text-sm">arrow_forward</span>
            </button>
          </div>
        )}

        {/* Signature Assignment Card (The discovery console) */}
        <div
          className={`rounded-3xl p-6 sm:p-8 shadow-xl border transition-all ${
            isNightShiftMode
              ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
              : 'bg-white border-[rgba(11,37,89,0.08)] text-[#001848]'
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#cde5ff] text-[#005684] dark:bg-[#3E9AD1]/20 dark:text-[#93ccff] mb-2">
                <span className="material-symbols-outlined text-sm">verified</span>
                Healthcare Assignment Housing Marketplace
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">
                Sanctuary Housing for Travel Nurses &amp; Clinical Shifts
              </h2>
              <p
                className={`text-sm mt-1 ${
                  isNightShiftMode ? 'text-[#9CB3D3]' : 'text-[#404850]'
                }`}
              >
                100% blackout curtains, quiet day-sleeper hours, and hospital-adjacent furnished homes for 4 to 26-week assignments.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-end">
            {/* 1. Hospital Autocomplete Bar */}
            <div className="lg:col-span-5">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                Hospital or Trauma Center
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search hospital (e.g. Stanford, UCSF, Cedars-Sinai)..."
                  className={`w-full h-14 pl-12 pr-4 rounded-xl text-sm font-medium focus:outline-none transition-all ${
                    isNightShiftMode
                      ? 'bg-[#15233a] border border-[#233550] text-white focus:border-[#3E9AD1]'
                      : 'bg-[#f2f3ff] border border-[rgba(11,37,89,0.12)] text-[#001848] focus:border-[#0a6fa8] focus:bg-white'
                  }`}
                />
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-[#0a6fa8] dark:text-[#3E9AD1]">
                  <span className="material-symbols-outlined text-xl">local_hospital</span>
                </div>
              </div>
            </div>

            {/* 2. Assignment Duration Bar */}
            <div className="lg:col-span-4">
              <label className="block text-xs font-bold uppercase tracking-wider mb-2 opacity-80">
                Assignment Duration
              </label>
              <div className="flex items-center gap-1.5 h-14 overflow-x-auto no-scrollbar">
                {durationOptions.map((opt) => {
                  const isSelected = selectedDurationWeeks === opt.value;
                  return (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setSelectedDurationWeeks(opt.value)}
                      className={`h-11 px-3.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-[#0a6fa8] text-white shadow-sm'
                          : isNightShiftMode
                          ? 'bg-[#15233a] text-[#9CB3D3] hover:text-white'
                          : 'bg-[#EFF6FB] text-[#001848] hover:bg-[#eaedff]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 3. Commute Buffer Slider */}
            <div className="lg:col-span-3">
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-80">
                  Max Commute
                </label>
                <span className="text-xs font-extrabold text-[#0a6fa8] dark:text-[#3E9AD1]">
                  ≤ {commuteMinutes} mins drive
                </span>
              </div>
              <div
                className={`h-14 px-4 rounded-xl flex items-center gap-3 ${
                  isNightShiftMode ? 'bg-[#15233a] border border-[#233550]' : 'bg-[#f2f3ff]'
                }`}
              >
                <span className="material-symbols-outlined text-[#707881] text-base">directions_car</span>
                <input
                  type="range"
                  min={5}
                  max={20}
                  step={5}
                  value={commuteMinutes}
                  onChange={(e) => setCommuteMinutes(Number(e.target.value))}
                  className="w-full accent-[#0a6fa8] cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Quick Filter Badges */}
          <div className="mt-6 pt-5 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-wrap items-center gap-2">
            <span className="text-xs font-semibold opacity-70 mr-1">Shift Essentials:</span>

            <button
              type="button"
              onClick={() => setFilterBlackout(!filterBlackout)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                filterBlackout
                  ? 'bg-[#0a6fa8] text-white border-[#0a6fa8]'
                  : isNightShiftMode
                  ? 'bg-[#15233a] text-[#9CB3D3] border-[#233550] hover:text-white'
                  : 'bg-white text-[#404850] border-[rgba(11,37,89,0.12)] hover:bg-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">bedtime</span>
              <span>Blackout Curtains</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterQuietHours(!filterQuietHours)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                filterQuietHours
                  ? 'bg-[#0a6fa8] text-white border-[#0a6fa8]'
                  : isNightShiftMode
                  ? 'bg-[#15233a] text-[#9CB3D3] border-[#233550] hover:text-white'
                  : 'bg-white text-[#404850] border-[rgba(11,37,89,0.12)] hover:bg-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">volume_off</span>
              <span>Day-Sleeper Quiet Hours</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterWasherDryer(!filterWasherDryer)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                filterWasherDryer
                  ? 'bg-[#0a6fa8] text-white border-[#0a6fa8]'
                  : isNightShiftMode
                  ? 'bg-[#15233a] text-[#9CB3D3] border-[#233550] hover:text-white'
                  : 'bg-white text-[#404850] border-[rgba(11,37,89,0.12)] hover:bg-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">local_laundry_service</span>
              <span>Washer/Dryer In-Unit</span>
            </button>

            <button
              type="button"
              onClick={() => setFilterPets(!filterPets)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 transition-all cursor-pointer border ${
                filterPets
                  ? 'bg-[#0a6fa8] text-white border-[#0a6fa8]'
                  : isNightShiftMode
                  ? 'bg-[#15233a] text-[#9CB3D3] border-[#233550] hover:text-white'
                  : 'bg-white text-[#404850] border-[rgba(11,37,89,0.12)] hover:bg-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">pets</span>
              <span>Pet Friendly</span>
            </button>
          </div>
        </div>

        {/* Listings Grid */}
        <div>
          <div className="flex items-center justify-between mb-6">
            <h3
              className={`text-xl font-bold tracking-tight ${
                isNightShiftMode ? 'text-white' : 'text-[#001848]'
              }`}
            >
              Available Nurse Sanctuaries ({filteredListings.length})
            </h3>
            <span className="text-xs text-[#707881]">
              Filtered for traveling healthcare professionals
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredListings.map((listing) => {
              const isSaved = savedListingIds.includes(listing.id);
              return (
                <div
                  key={listing.id}
                  className={`group rounded-2xl overflow-hidden border shadow-md hover:shadow-xl transition-all duration-300 flex flex-col ${
                    isNightShiftMode
                      ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
                      : 'bg-white border-[rgba(11,37,89,0.08)] text-[#001848]'
                  }`}
                >
                  {/* Photo area */}
                  <div className="relative aspect-16/10 overflow-hidden bg-slate-200">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                    />

                    {/* Proximity tag at top-left */}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#001848]/85 text-white text-[11px] font-semibold backdrop-blur-md">
                      <span className="material-symbols-outlined text-[14px] text-[#aff0db]">
                        local_hospital
                      </span>
                      <span>{listing.proximityToHospital}</span>
                    </div>

                    {/* Pillow Favorite button at top-right (40px x 40px rounded-full) */}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        onToggleSave(listing.id);
                      }}
                      title={isSaved ? 'Remove from saved' : 'Save sanctuary'}
                      aria-label="Save sanctuary"
                      className={`absolute top-3 right-3 w-10 h-10 rounded-full flex items-center justify-center transition-all shadow-md cursor-pointer ${
                        isSaved
                          ? 'bg-[#0a6fa8] text-white scale-110'
                          : 'bg-white/95 text-[#001848] hover:scale-110 hover:bg-white'
                      }`}
                    >
                      <span className="material-symbols-outlined text-[20px]">
                        {isSaved ? 'bookmark_added' : 'bed'}
                      </span>
                    </button>
                  </div>

                  {/* Card Content Zone */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      {/* Rating & reviews */}
                      <div className="flex items-center justify-between gap-2 mb-1.5">
                        <span className="text-xs font-bold uppercase tracking-wider text-[#0a6fa8] dark:text-[#3E9AD1]">
                          {listing.neighborhood}
                        </span>
                        <div className="flex items-center gap-1 text-[#745b0d] dark:text-[#ffdf91] text-xs font-bold">
                          <span className="material-symbols-outlined text-sm">star</span>
                          <span>{listing.nurseRating}</span>
                          <span className="text-[#707881] font-normal">({listing.reviewsCount})</span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold line-clamp-1 mb-2">
                        {listing.title}
                      </h4>

                      {/* Pill features */}
                      <div className="flex flex-wrap items-center gap-1.5 mb-4">
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#f2f3ff] text-[#001848] dark:bg-[#15233a] dark:text-[#9CB3D3]">
                          <span className="material-symbols-outlined text-[13px] text-[#0a6fa8]">
                            bedtime
                          </span>
                          Blackout Curtains
                        </span>
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-medium bg-[#aff0db]/30 text-[#195b4c] dark:text-[#aff0db]">
                          <span className="material-symbols-outlined text-[13px]">verified</span>
                          Quiet Certified
                        </span>
                      </div>
                    </div>

                    {/* Pricing breakdown & CTA */}
                    <div className="pt-3 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex items-center justify-between">
                      <div>
                        <div className="text-lg font-extrabold text-[#0a6fa8] dark:text-[#3E9AD1] leading-none">
                          ${listing.monthlyRate.toLocaleString()}
                          <span className="text-xs font-normal opacity-80">/mo</span>
                        </div>
                        <div className="text-[11px] text-[#707881] mt-0.5">
                          ${listing.weeklyRate}/wk • All utilities incl.
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveDetailListing(listing)}
                        className="px-4 py-2 rounded-full bg-[#0a6fa8] hover:bg-[#005684] text-white text-xs font-semibold transition-all shadow-xs cursor-pointer flex items-center gap-1"
                      >
                        <span>View Details</span>
                        <span className="material-symbols-outlined text-sm">arrow_forward</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Listing Detail Modal */}
      {activeDetailListing && (
        <ListingDetailModal
          listing={activeDetailListing}
          onClose={() => setActiveDetailListing(null)}
          isNightShiftMode={isNightShiftMode}
          isSaved={savedListingIds.includes(activeDetailListing.id)}
          onToggleSave={onToggleSave}
          isVerified={isVerified}
          onGoToVerification={onGoToVerification}
        />
      )}
    </div>
  );
};
