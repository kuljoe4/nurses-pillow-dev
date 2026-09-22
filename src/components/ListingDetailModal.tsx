import React, { useState, useEffect } from 'react';
import { HousingListing } from '../types';

interface ListingDetailModalProps {
  listing: HousingListing | null;
  onClose: () => void;
  isNightShiftMode: boolean;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  isVerified: boolean;
  onGoToVerification: () => void;
  onRequestToBook?: (listing: HousingListing) => void;
}

export const ListingDetailModal: React.FC<ListingDetailModalProps> = ({
  listing,
  onClose,
  isNightShiftMode,
  isSaved,
  onToggleSave,
  isVerified,
  onGoToVerification,
  onRequestToBook,
}) => {
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  if (!listing) return null;

  // Sample photo mosaic collection if listing only has 1 or 2
  const galleryPhotos = [
    listing.images[0] || 'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80',
    listing.images[1] || 'https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&w=600&q=80',
    listing.images[2] || 'https://images.unsplash.com/photo-1518455027359-f3f8164ba6bd?auto=format&fit=crop&w=600&q=80',
    listing.images[3] || 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?auto=format&fit=crop&w=600&q=80',
    'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80',
  ];

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto custom-scrollbar overscroll-contain p-4 sm:p-6 bg-black/70 backdrop-blur-xs flex justify-center items-start"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-5xl my-auto rounded-3xl p-6 sm:p-8 shadow-lg transition-all duration-200 ease-in-out relative border ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
            : 'bg-white border-[rgba(11,37,89,0.1)] text-[#001848]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-5 right-5 z-20 w-9 h-9 rounded-full bg-white/90 dark:bg-[#15233a] shadow-md flex items-center justify-center text-[#001848] dark:text-white hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#1f3454] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1f3454] cursor-pointer"
          aria-label="Close details modal"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Top Header & Badges */}
        <div className="mb-4 pr-10">
          <div className="flex flex-wrap items-center gap-2 mb-2">
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db] text-xs font-bold">
              <span className="material-symbols-outlined text-[14px]">verified</span>
              <span>Nurses Pillow Verified</span>
            </span>
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-[#ffdc84] text-[#795f12] text-xs font-bold">
              <span className="material-symbols-outlined text-[14px]">nightlight</span>
              <span>Shift-Ready Certified</span>
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#f2f3ff] dark:bg-[#182840] text-xs font-semibold">
              <span className="material-symbols-outlined text-[14px] text-[#745b0d] dark:text-[#ffdf91]">star</span>
              <span>{listing.nurseRating || 4.98} ({listing.reviewsCount || 19} traveling clinician reviews)</span>
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1">
            {listing.title}
          </h1>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-[#404850] dark:text-[#c0c7d1]">
            <span className="text-[#005684] dark:text-[#93ccff] font-semibold flex items-center gap-1">
              <span className="material-symbols-outlined text-[16px]">near_me</span>
              <span>{listing.proximityToHospital}</span>
            </span>
            <span>•</span>
            <span>{listing.neighborhood}, {listing.city}, {listing.state}</span>
          </div>
        </div>

        {/* 5-Photo Mosaic Grid Layout */}
        <div className="relative mb-6 rounded-2xl overflow-hidden shadow-sm bg-gray-100 dark:bg-gray-800">
          <div className="grid grid-cols-1 md:grid-cols-4 grid-rows-2 gap-2 h-72 sm:h-96">
            <div className="md:col-span-2 md:row-span-2 relative overflow-hidden group">
              <img
                src={galleryPhotos[0]}
                alt="Primary view"
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                onClick={() => setSelectedImageIndex(0)}
              />
              <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-white/90 dark:bg-black/80 text-xs font-semibold backdrop-blur-xs flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-[#005684]">nights_stay</span>
                <span>Daytime Sleep Sanctuary Guarantee</span>
              </div>
            </div>
            {galleryPhotos.slice(1, 5).map((photo, idx) => (
              <div key={idx} className="relative overflow-hidden group hidden md:block">
                <img
                  src={photo}
                  alt={`Gallery ${idx + 1}`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                  onClick={() => setSelectedImageIndex(idx + 1)}
                />
              </div>
            ))}
          </div>
          <button
            type="button"
            className="absolute bottom-3 right-3 px-3.5 py-1.5 rounded-full bg-white/90 dark:bg-black/80 text-xs font-bold backdrop-blur-xs shadow-md flex items-center gap-1.5 cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">grid_view</span>
            <span>View all 24 photos</span>
          </button>
        </div>

        {/* Two Column Layout: Content (Left) & Sticky Booking Widget (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Main Details (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Host Mini-Profile Banner */}
            <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="relative shrink-0">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                    alt="Host Sarah M."
                    className="w-13 h-13 rounded-full object-cover shadow-xs"
                  />
                  <span className="absolute -bottom-1 -right-1 p-0.5 bg-[#195b4c] text-white rounded-full flex items-center justify-center">
                    <span className="material-symbols-outlined text-[12px]">medical_services</span>
                  </span>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-bold">Hosted by Sarah M.</h3>
                    <span className="px-2 py-0.2 rounded-full bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db] text-[10px] font-bold">
                      RN Host
                    </span>
                  </div>
                  <p className="text-xs text-gray-500">Superhost • Former UCSF Neuro ICU RN</p>
                  <div className="text-[11px] text-[#005684] dark:text-[#93ccff] font-semibold mt-0.5">
                    Response time &lt; 2 hrs • 100% acceptance for verified RNs
                  </div>
                </div>
              </div>
              <button
                type="button"
                onClick={() => alert('Opening in-app chat thread with Host Sarah M.')}
                className="px-4 py-2 rounded-full bg-white dark:bg-[#111e33] text-xs font-bold text-[#005684] dark:text-[#93ccff] shadow-xs hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-50 cursor-pointer shrink-0"
              >
                Contact Sarah
              </button>
            </div>

            {/* Unit Overview Stats Pills */}
            <div className="flex flex-wrap gap-2 text-xs">
              <span className="px-3 py-1.5 rounded-full bg-[#eaedff] dark:bg-[#15233a] font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#005684]">home</span>
                <span>Entire Garden Suite</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[#eaedff] dark:bg-[#15233a] font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#005684]">king_bed</span>
                <span>1 King Plush Bed</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[#eaedff] dark:bg-[#15233a] font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#005684]">bathtub</span>
                <span>1 Ensuite Bath</span>
              </span>
              <span className="px-3 py-1.5 rounded-full bg-[#eaedff] dark:bg-[#15233a] font-medium flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] text-[#005684]">key</span>
                <span>Keyless Digital PIN</span>
              </span>
            </div>

            {/* Clinical Sanctuary Highlight Bento (3-Card Stack) */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] space-y-1">
                <span className="material-symbols-outlined text-[#005684] text-[22px]">volume_off</span>
                <h4 className="font-bold text-xs">Tested Sound Sanctuary</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Certified &lt; 35dB daytime ambient noise. Acoustic double-pane glass &amp; LectroFan included.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] space-y-1">
                <span className="material-symbols-outlined text-[#745b0d] text-[22px]">event_repeat</span>
                <h4 className="font-bold text-xs">Shift-Flex Protection</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Full refund if hospital cancels travel contract prior to arrival. Contract extension priority.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] space-y-1">
                <span className="material-symbols-outlined text-[#195b4c] text-[22px]">payments</span>
                <h4 className="font-bold text-xs">Stipend Matched Rate</h4>
                <p className="text-[11px] text-gray-500 leading-relaxed">
                  Zero hidden booking fees. Monthly pricing calibrated to standard San Francisco GSA lodging per diem.
                </p>
              </div>
            </div>

            {/* Healthcare Amenities Matrix */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold uppercase tracking-wider">
                  Healthcare Amenities Matrix
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-[#cde5ff] text-[#001d32] text-[11px] font-bold">
                  12 Nurse Standards Met
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 text-xs">
                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="material-symbols-outlined text-[#005684] text-[20px]">curtains_closed</span>
                  <div>
                    <div className="font-bold">100% Blackout Drapes</div>
                    <div className="text-[10px] text-gray-500">Zero-bleed perimeter tracks</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="material-symbols-outlined text-[#005684] text-[20px]">do_not_disturb_on</span>
                  <div>
                    <div className="font-bold">Daytime Quiet Hours</div>
                    <div className="text-[10px] text-gray-500">Enforced 8 AM – 5 PM</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="material-symbols-outlined text-[#005684] text-[20px]">local_laundry_service</span>
                  <div>
                    <div className="font-bold">In-Unit Washer &amp; Dryer</div>
                    <div className="text-[10px] text-gray-500">High heat scrub sanitization</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="material-symbols-outlined text-[#005684] text-[20px]">wifi</span>
                  <div>
                    <div className="font-bold">500 Mbps Fiber Wi-Fi</div>
                    <div className="text-[10px] text-gray-500">Low latency for Epic EHR</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="material-symbols-outlined text-[#005684] text-[20px]">desk</span>
                  <div>
                    <div className="font-bold">Ergonomic Workstation</div>
                    <div className="text-[10px] text-gray-500">Herman Miller mesh chair</div>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 p-2.5 rounded-xl bg-gray-50 dark:bg-white/5">
                  <span className="material-symbols-outlined text-[#005684] text-[20px]">directions_car</span>
                  <div>
                    <div className="font-bold">Dedicated Off-Street Spot</div>
                    <div className="text-[10px] text-gray-500">Assigned private driveway</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Cancellation Policy Tier Card */}
            <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-[10px] font-bold text-[#005684] uppercase tracking-wider">Policy Protection</span>
                  <h4 className="text-sm font-bold">Shift-Flexible Tier (Healthcare Special)</h4>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db] text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">verified_user</span>
                  <span>Hospital Cancel Guard</span>
                </span>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 text-xs">
                <div className="p-3 rounded-xl bg-white dark:bg-[#111e33]">
                  <div className="font-bold text-[#195b4c] dark:text-[#aff0db]">Up to 14 Days Prior</div>
                  <div className="font-semibold text-xs">100% Full Refund</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#111e33]">
                  <div className="font-bold text-[#745b0d] dark:text-[#ffdf91]">Hospital Cancellation</div>
                  <div className="font-semibold text-xs">100% Protected</div>
                </div>
                <div className="p-3 rounded-xl bg-white dark:bg-[#111e33]">
                  <div className="font-bold text-[#005684] dark:text-[#93ccff]">Contract Extension</div>
                  <div className="font-semibold text-xs">First Priority Lock</div>
                </div>
              </div>
            </div>

            {/* Clinician Reviews */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">4.98 ★</span>
                  <span className="text-xs text-gray-500">(19 verified reviews)</span>
                </div>
                <span className="px-2.5 py-0.5 rounded-full bg-[#195b4c]/15 text-[#195b4c] text-xs font-bold">
                  100% Nurse Recommended
                </span>
              </div>

              <div className="p-3.5 rounded-xl bg-gray-50 dark:bg-white/5 text-xs space-y-1">
                <div className="flex justify-between font-bold">
                  <span>Marcus T., Travel ICU RN (UCSF Parnassus)</span>
                  <span className="text-[#745b0d]">5.0 ★</span>
                </div>
                <p className="text-gray-600 dark:text-gray-300 italic">
                  “Absolute game-changer for night shifts. Blackout curtains seal around the trim with zero light bleed at midday. Slept uninterrupted through garbage trucks without hearing a peep.”
                </p>
              </div>
            </div>
          </div>

          {/* Sticky Booking Widget (Right 4 cols) */}
          <div className="lg:col-span-4 sticky top-6">
            <div className="rounded-3xl p-5 sm:p-6 bg-white dark:bg-[#0B1626] shadow-md border border-[rgba(11,37,89,0.1)] dark:border-[#233550] space-y-4">
              <div className="flex items-baseline justify-between border-b border-gray-100 dark:border-gray-800 pb-3">
                <div>
                  <span className="text-2xl font-black">${(listing.monthlyRate || 1950).toLocaleString()}</span>
                  <span className="text-xs text-gray-500"> / month</span>
                  <div className="text-[11px] text-[#195b4c] font-semibold flex items-center gap-1 mt-0.5">
                    <span className="material-symbols-outlined text-[13px]">check_circle</span>
                    <span>Matches GSA rate ($65/night)</span>
                  </div>
                </div>
                <span className="px-2.5 py-1 rounded-full bg-[#195b4c]/10 text-[#195b4c] text-[11px] font-bold">
                  Direct RN Rate
                </span>
              </div>

              {/* Assignment Window */}
              <div className="p-3 rounded-xl bg-[#f2f3ff] dark:bg-[#182840] text-xs">
                <div className="text-[10px] text-gray-400 font-bold uppercase mb-0.5">Assignment Window</div>
                <div className="font-bold">Oct 1, 2024 – Dec 31, 2024</div>
                <div className="text-[11px] text-gray-500">13 Weeks • Standard Travel Contract</div>
              </div>

              {/* Fee Breakdown */}
              <div className="space-y-1.5 text-xs text-[#404850] dark:text-[#c0c7d1]">
                <div className="flex justify-between">
                  <span>Monthly Lodging Rate</span>
                  <span className="font-bold text-[#001848] dark:text-white">${(listing.monthlyRate || 1950).toLocaleString()}.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Clinical Sanitization</span>
                  <span className="font-bold text-[#001848] dark:text-white">$150.00</span>
                </div>
                <div className="flex justify-between">
                  <span>Refundable Security Hold</span>
                  <span className="font-bold text-[#001848] dark:text-white">$250.00</span>
                </div>
                <div className="flex justify-between text-[#195b4c] font-semibold">
                  <span>Traveler Service Fee</span>
                  <span className="font-bold">Free ($0.00)</span>
                </div>
                <div className="pt-2 border-t border-gray-100 dark:border-gray-800 flex justify-between font-bold text-sm text-[#001848] dark:text-white">
                  <span>Initial Due at Hold</span>
                  <span className="text-[#005684] dark:text-[#93ccff] font-black">${((listing.monthlyRate || 1950) + 400).toLocaleString()}.00</span>
                </div>
              </div>

              {/* CTAs */}
              <div className="space-y-2 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    if (onRequestToBook) {
                      onRequestToBook(listing);
                    }
                  }}
                  className="w-full py-3.5 rounded-full bg-[#001848] hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] text-white font-bold text-xs shadow-md transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px]">shield</span>
                  <span>Request to Book (Shift-Protected)</span>
                </button>

                <button
                  type="button"
                  onClick={() => onToggleSave(listing.id)}
                  className={`w-full py-2.5 rounded-full border text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors cursor-pointer ${
                    isSaved
                      ? 'bg-[#eaedff] text-[#005684] border-[#005684]'
                      : 'border-gray-300 dark:border-gray-700 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-50'
                  }`}
                >
                  <span className="material-symbols-outlined text-[16px]">
                    {isSaved ? 'bookmark_added' : 'bookmark_border'}
                  </span>
                  <span>{isSaved ? 'Saved to Pillows' : 'Save to Pillows'}</span>
                </button>
              </div>

              <div className="text-center text-[11px] text-gray-400">
                Stripe Identity &amp; RN Verified guests get 24-hr priority approval
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
