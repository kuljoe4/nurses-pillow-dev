import React, { useState } from 'react';
import { HousingListing } from '../types';

interface ListingDetailModalProps {
  listing: HousingListing | null;
  onClose: () => void;
  isNightShiftMode: boolean;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  isVerified: boolean;
  onGoToVerification: () => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  isNightShiftMode,
  isSaved,
  onToggleSave,
  isVerified,
  onGoToVerification,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [isBooked, setIsBooked] = useState(false);

  if (!listing) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <div
        className={`w-full max-w-3xl my-8 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all relative ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border border-[#233550] text-[#E6ECF7]'
            : 'bg-white text-[#001848]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className={`absolute top-5 right-5 z-10 w-9 h-9 rounded-full flex items-center justify-center transition-colors ${
            isNightShiftMode
              ? 'bg-[#15233a] text-white hover:bg-[#1f3454]'
              : 'bg-white/90 shadow-md text-[#001848] hover:bg-[#eaedff]'
          }`}
          aria-label="Close details modal"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Image Gallery */}
        <div className="relative mb-6 rounded-2xl overflow-hidden aspect-video shadow-md">
          <img
            src={listing.images[selectedImageIndex] || listing.images[0]}
            alt={listing.title}
            className="w-full h-full object-cover"
          />

          {/* Proximity badge overlay */}
          <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-[#001848]/85 text-white text-xs font-semibold backdrop-blur-md">
            <span className="material-symbols-outlined text-sm text-[#aff0db]">local_hospital</span>
            <span>{listing.proximityToHospital}</span>
          </div>

          {/* Thumbnail dots */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-black/40 px-3 py-1.5 rounded-full backdrop-blur-sm">
            {listing.images.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setSelectedImageIndex(idx)}
                className={`w-2.5 h-2.5 rounded-full transition-all ${
                  selectedImageIndex === idx ? 'bg-white w-6' : 'bg-white/50 hover:bg-white/80'
                }`}
                aria-label={`Show image ${idx + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Listing Title & Metadata */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-bold uppercase tracking-wider text-[#0a6fa8] dark:text-[#3E9AD1]">
                {listing.neighborhood}, {listing.city}
              </span>
              <span className="text-xs text-[#707881]">•</span>
              <div className="flex items-center gap-1 text-[#745b0d] dark:text-[#ffdf91] text-xs font-bold">
                <span className="material-symbols-outlined text-sm">star</span>
                <span>{listing.nurseRating}</span>
                <span className="text-[#707881] font-normal">({listing.reviewsCount} nurse reviews)</span>
              </div>
            </div>
            <h2 className="text-2xl font-bold tracking-tight">{listing.title}</h2>
          </div>

          <div className="text-right shrink-0">
            <div className="text-2xl font-extrabold text-[#0a6fa8] dark:text-[#3E9AD1]">
              ${listing.monthlyRate.toLocaleString()}
              <span className="text-xs font-normal opacity-80"> / month</span>
            </div>
            <div className="text-xs opacity-75">
              ${listing.weeklyRate} / week • All utilities included
            </div>
          </div>
        </div>

        {/* Clinical Amenities Grid */}
        <div className="mb-6">
          <h3 className="text-xs font-bold uppercase tracking-wider mb-3 opacity-80">
            Sanctuary &amp; Day-Sleeper Amenities
          </h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            <div
              className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[#0a6fa8] dark:text-[#3E9AD1] text-lg">
                bedtime
              </span>
              <span>100% Blackout Curtains</span>
            </div>

            <div
              className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[#0a6fa8] dark:text-[#3E9AD1] text-lg">
                volume_off
              </span>
              <span>Quiet Hours Enforced</span>
            </div>

            <div
              className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[#0a6fa8] dark:text-[#3E9AD1] text-lg">
                local_laundry_service
              </span>
              <span>Washer/Dryer In-Unit</span>
            </div>

            <div
              className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[#0a6fa8] dark:text-[#3E9AD1] text-lg">
                directions_car
              </span>
              <span>Dedicated Parking Space</span>
            </div>

            <div
              className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[#0a6fa8] dark:text-[#3E9AD1] text-lg">
                wifi
              </span>
              <span>Gigabit Fast Wi-Fi</span>
            </div>

            <div
              className={`p-2.5 rounded-xl flex items-center gap-2 text-xs font-semibold ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-[#0a6fa8] dark:text-[#3E9AD1] text-lg">
                verified_user
              </span>
              <span>Contract Flex Guarantee</span>
            </div>
          </div>
        </div>

        {/* Contract Flex Notice */}
        <div
          className={`p-4 rounded-2xl mb-6 flex items-start gap-3 border ${
            isNightShiftMode
              ? 'bg-[#195b4c]/20 border-[#195b4c]/40 text-[#aff0db]'
              : 'bg-[#aff0db]/30 border-[#aff0db]/60 text-[#195b4c]'
          }`}
        >
          <span className="material-symbols-outlined text-xl mt-0.5">health_and_safety</span>
          <div className="text-xs leading-relaxed">
            <strong className="block font-bold mb-0.5">Contract Flex Guarantee Included:</strong>
            If your hospital assignment is shortened, floating units are cancelled, or your contract is called off, you can cancel this lease penalty-free with 14-day notice.
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2">
          <button
            type="button"
            onClick={() => onToggleSave(listing.id)}
            className={`w-full sm:w-auto px-5 py-3 rounded-full flex items-center justify-center gap-2 text-sm font-semibold border transition-all cursor-pointer ${
              isSaved
                ? 'bg-[#0a6fa8] text-white border-[#0a6fa8]'
                : isNightShiftMode
                ? 'bg-[#15233a] border-[#233550] hover:bg-[#1f3454]'
                : 'bg-white border-[rgba(11,37,89,0.16)] hover:bg-[#f2f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-base">
              {isSaved ? 'bookmark_added' : 'bookmark_border'}
            </span>
            <span>{isSaved ? 'Saved to Sanctuaries' : 'Save Listing'}</span>
          </button>

          {isBooked ? (
            <div className="px-6 py-3 rounded-full bg-[#195b4c] text-white text-sm font-bold flex items-center gap-2">
              <span className="material-symbols-outlined text-lg">check_circle</span>
              <span>Sanctuary Reserved for Assignment!</span>
            </div>
          ) : isVerified ? (
            <button
              type="button"
              onClick={() => setIsBooked(true)}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0a6fa8] hover:bg-[#005684] text-white text-sm font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Reserve with RN Verified Rate</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                onClose();
                onGoToVerification();
              }}
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0a6fa8] hover:bg-[#005684] text-white text-sm font-semibold shadow-md flex items-center justify-center gap-2 cursor-pointer"
            >
              <span>Verify Credentials to Unlock Rate</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
