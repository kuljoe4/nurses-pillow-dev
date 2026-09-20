import React from 'react';
import { VerificationFormData } from '../types';

interface VerificationSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: VerificationFormData;
  onGoToHousing: () => void;
  isNightShiftMode: boolean;
}

export const VerificationSuccessModal: React.FC<VerificationSuccessModalProps> = ({
  isOpen,
  onClose,
  data,
  onGoToHousing,
  isNightShiftMode,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div
        className={`w-full max-w-lg rounded-3xl p-6 sm:p-8 shadow-2xl transition-all relative ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border border-[#233550] text-[#E6ECF7]'
            : 'bg-white text-[#001848]'
        }`}
      >
        {/* Close icon */}
        <button
          onClick={onClose}
          type="button"
          className={`absolute top-5 right-5 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
            isNightShiftMode
              ? 'text-[#8ea5c8] hover:bg-[#15233a]'
              : 'text-[#404850] hover:bg-[#eaedff]'
          }`}
          aria-label="Close modal"
        >
          <span className="material-symbols-outlined text-xl">close</span>
        </button>

        {/* Hero badge */}
        <div className="text-center mb-6">
          <div className="w-16 h-16 rounded-full bg-[#195b4c] text-[#aff0db] mx-auto flex items-center justify-center mb-4 shadow-lg ring-4 ring-[#aff0db]/40">
            <span className="material-symbols-outlined text-3xl">verified</span>
          </div>
          <span className="inline-block px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-[#aff0db]/30 text-[#195b4c] dark:text-[#aff0db] mb-2">
            RN Verified Status Activated
          </span>
          <h2 className="text-2xl font-bold tracking-tight mb-1">
            Welcome, Sarah Jenkins, RN!
          </h2>
          <p
            className={`text-sm ${
              isNightShiftMode ? 'text-[#9CB3D3]' : 'text-[#404850]'
            }`}
          >
            License <strong>{data.licenseNumber}</strong> ({data.issuingStateBoard}) is verified. You have officially unlocked Nurse Sanctuary Privileges.
          </p>
        </div>

        {/* Unlocked Benefits list */}
        <div className="space-y-3 mb-6">
          <div
            className={`p-3.5 rounded-2xl flex items-start gap-3 border ${
              isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#f2f3ff] border-[#eaedff]'
            }`}
          >
            <span className="material-symbols-outlined text-[#0a6fa8] dark:text-[#3E9AD1] text-xl mt-0.5">
              savings
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">Nurse-Only Subsidized Rates</p>
              <p className="text-xs opacity-80 mt-0.5">
                Up to 22% off standard market rent with stipend-aligned monthly billing.
              </p>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl flex items-start gap-3 border ${
              isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#f2f3ff] border-[#eaedff]'
            }`}
          >
            <span className="material-symbols-outlined text-[#195b4c] dark:text-[#aff0db] text-xl mt-0.5">
              dark_mode
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">100% Day Sleeper Guarantee</p>
              <p className="text-xs opacity-80 mt-0.5">
                Thermal blackout curtains, white noise devices, and guaranteed daytime quiet hours.
              </p>
            </div>
          </div>

          <div
            className={`p-3.5 rounded-2xl flex items-start gap-3 border ${
              isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#f2f3ff] border-[#eaedff]'
            }`}
          >
            <span className="material-symbols-outlined text-[#745b0d] dark:text-[#ffdf91] text-xl mt-0.5">
              shield_with_heart
            </span>
            <div>
              <p className="text-sm font-bold leading-tight">Hospital Contract Flex Protection</p>
              <p className="text-xs opacity-80 mt-0.5">
                If your shift or contract gets called off by the health system, cancel penalty-free.
              </p>
            </div>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToHousing();
            }}
            className="w-full sm:flex-1 px-6 py-3.5 rounded-full bg-[#0a6fa8] hover:bg-[#005684] text-white font-semibold text-sm flex items-center justify-center gap-2 shadow-md cursor-pointer"
          >
            <span>Browse Verified Sanctuaries</span>
            <span className="material-symbols-outlined text-lg">arrow_forward</span>
          </button>

          <button
            type="button"
            onClick={onClose}
            className={`w-full sm:w-auto px-5 py-3 rounded-full text-xs font-semibold hover:bg-black/5 dark:hover:bg-white/5 transition-colors cursor-pointer`}
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
