import React from 'react';
import { HousingListing } from '../types';
import { MOCK_LISTINGS } from '../data/mockData';

interface SavedListingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  savedListingIds: string[];
  onToggleSave: (id: string) => void;
  onSelectListing: (listing: HousingListing) => void;
  isNightShiftMode: boolean;
  onGoToHousing: () => void;
}

export const SavedListingsModal: React.FC<SavedListingsModalProps> = ({
  isOpen,
  onClose,
  savedListingIds,
  onToggleSave,
  onSelectListing,
  isNightShiftMode,
  onGoToHousing,
}) => {
  if (!isOpen) return null;

  const savedListings = MOCK_LISTINGS.filter((item) =>
    savedListingIds.includes(item.id)
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-end bg-black/50 backdrop-blur-xs">
      <div
        className={`w-full max-w-md h-full shadow-2xl p-6 flex flex-col justify-between overflow-y-auto transition-colors ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border-l border-[#233550] text-[#E6ECF7]'
            : 'bg-white text-[#001848]'
        }`}
      >
        <div>
          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550] mb-5">
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[#0a6fa8] dark:text-[#3E9AD1]">
                bed
              </span>
              <h3 className="text-lg font-bold">Saved Sanctuaries</h3>
              <span className="text-xs px-2 py-0.5 rounded-full bg-[#0a6fa8]/15 text-[#0a6fa8] dark:text-[#3E9AD1] font-bold">
                {savedListings.length}
              </span>
            </div>
            <button
              onClick={onClose}
              type="button"
              className="w-8 h-8 rounded-full flex items-center justify-center hover:bg-black/5 dark:hover:bg-white/5 transition-colors"
            >
              <span className="material-symbols-outlined text-lg">close</span>
            </button>
          </div>

          {/* List of saved items */}
          {savedListings.length === 0 ? (
            <div className="py-16 text-center">
              <div className="w-14 h-14 rounded-full bg-[#f2f3ff] dark:bg-[#15233a] flex items-center justify-center mx-auto mb-3 text-[#707881]">
                <span className="material-symbols-outlined text-2xl">bed</span>
              </div>
              <p className="text-sm font-semibold mb-1">No saved housing yet</p>
              <p className="text-xs opacity-70 max-w-xs mx-auto mb-5">
                Click the bed icon on any sanctuary card to bookmark properties for your next clinical assignment.
              </p>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onGoToHousing();
                }}
                className="px-5 py-2.5 rounded-full bg-[#0a6fa8] text-white text-xs font-semibold shadow-xs"
              >
                Browse Housing
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              {savedListings.map((listing) => (
                <div
                  key={listing.id}
                  className={`p-3.5 rounded-2xl border flex gap-3 cursor-pointer transition-all hover:scale-[1.01] ${
                    isNightShiftMode
                      ? 'bg-[#15233a] border-[#233550]'
                      : 'bg-[#f2f3ff] border-[#eaedff]'
                  }`}
                  onClick={() => {
                    onClose();
                    onSelectListing(listing);
                  }}
                >
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 min-w-0 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-[11px] font-bold text-[#0a6fa8] dark:text-[#3E9AD1] truncate">
                          {listing.city}, {listing.state}
                        </span>
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            onToggleSave(listing.id);
                          }}
                          className="text-[#ba1a1a] hover:opacity-80 p-0.5"
                          title="Remove bookmark"
                        >
                          <span className="material-symbols-outlined text-base">delete</span>
                        </button>
                      </div>
                      <h4 className="text-xs font-bold truncate leading-snug">{listing.title}</h4>
                      <p className="text-[10px] opacity-75 truncate">{listing.proximityToHospital}</p>
                    </div>

                    <div className="text-xs font-extrabold text-[#0a6fa8] dark:text-[#3E9AD1]">
                      ${listing.monthlyRate.toLocaleString()}/mo
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="pt-4 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 rounded-full border border-current text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors text-center"
          >
            Close Panel
          </button>
        </div>
      </div>
    </div>
  );
};
