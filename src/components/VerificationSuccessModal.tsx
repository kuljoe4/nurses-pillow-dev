import React, { useEffect } from 'react';
import { VerificationFormData } from '../types';
import { useBodyScrollLock } from '../hooks/useBodyScrollLock';
import { X, ShieldCheck, CheckCircle2, ArrowRight } from 'lucide-react';

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
  useBodyScrollLock(isOpen);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/60 backdrop-blur-sm flex justify-center items-start animate-fade-in"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-lg my-auto rounded-3xl p-6 sm:p-8 shadow-lg transition-all duration-200 ease-in-out relative ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border border-[#233550] text-[#E6ECF7]'
            : 'bg-white text-[#001848]'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close icon */}
        <button
          onClick={onClose}
          type="button"
          className="absolute top-4 right-4 p-1.5 rounded-full text-gray-400 hover:text-[#0B2559] dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/10 transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8]"
          aria-label="Close modal"
        >
          <X className="w-4 h-4" aria-hidden="true" />
        </button>

        {/* Minimal Hero Confirmation */}
        <div className="text-center pt-2">
          <div className="w-12 h-12 rounded-full bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#2F6E5E]/20 dark:text-[#aff0db] mx-auto flex items-center justify-center mb-3">
            <ShieldCheck className="w-6 h-6" aria-hidden="true" />
          </div>
          <h2 className="text-xl font-bold tracking-tight text-[#0B2559] dark:text-white mb-1">
            License verified
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            License {data.licenseNumber} · {data.issuingStateBoard}
          </p>
          <p className="text-xs text-gray-600 dark:text-gray-300 mt-2 max-w-sm mx-auto leading-relaxed">
            Your professional credentials are confirmed. You now have access to verified clinician privileges on Nurse&apos;s Pillow.
          </p>
        </div>

        {/* Minimal Unboxed Benefits (Zero-Pill, Zero Color Noise) */}
        <div className="my-5 py-3 border-y border-[rgba(11,37,89,0.08)] dark:border-[#233550] space-y-2.5 text-xs text-[#0B2559]/80 dark:text-[#E6ECF7]/80">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#2F6E5E] dark:text-[#aff0db] shrink-0" aria-hidden="true" />
            <span>Subsidized travel clinician rates with stipend-aligned billing</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#2F6E5E] dark:text-[#aff0db] shrink-0" aria-hidden="true" />
            <span>Guaranteed daytime quiet hours and blackout sleep sanctuary standards</span>
          </div>
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-4 h-4 text-[#2F6E5E] dark:text-[#aff0db] shrink-0" aria-hidden="true" />
            <span>Hospital contract cancellation flex protection</span>
          </div>
        </div>

        {/* CTA Actions */}
        <div className="flex items-center justify-end gap-2.5 pt-1">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2.5 rounded-full border border-gray-200 dark:border-[#233550] text-xs font-medium text-gray-700 dark:text-gray-300 hover:bg-[#EFF6FB] dark:hover:bg-[#15233a] transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8]"
          >
            Done
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onGoToHousing();
            }}
            className="px-5 py-2.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white font-semibold text-xs flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8]"
          >
            <span>Search housing</span>
            <ArrowRight className="w-4 h-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </div>
  );
};
