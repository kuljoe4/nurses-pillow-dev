import React, { useState } from 'react';
import { VerificationFormData, VerificationStepId } from '../types';

interface ContactStepProps {
  data: VerificationFormData;
  onChange: (updates: Partial<VerificationFormData>) => void;
  onNextStep: () => void;
  onSelectStep: (step: VerificationStepId) => void;
  isNightShiftMode: boolean;
}

export const ContactStep: React.FC<ContactStepProps> = ({
  data,
  onChange,
  onNextStep,
  onSelectStep,
  isNightShiftMode,
}) => {
  const [verificationCode, setVerificationCode] = useState('8492');
  const [isCodeSent, setIsCodeSent] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ isContactVerified: true, phoneVerified: true });
    setTimeout(() => {
      onSelectStep(3);
    }, 400);
  };

  return (
    <div
      className={`w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
        isNightShiftMode ? 'bg-[#08101C]' : 'bg-[#f2f3ff]'
      }`}
    >
      {/* Stepper Navigation Bar */}
      <div className="max-w-4xl mx-auto mb-8">
        <div
          className={`rounded-full p-2 sm:p-3 shadow-md transition-colors ${
            isNightShiftMode ? 'bg-[#0E1A2E] border border-[#233550]' : 'bg-white'
          }`}
        >
          <div className="grid grid-cols-4 items-center gap-2">
            <button
              onClick={() => onSelectStep(1)}
              type="button"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full bg-[#aff0db]/30 text-[#195b4c] text-left hover:bg-[#aff0db]/50 transition-all"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#195b4c] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base font-bold">check</span>
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-bold truncate leading-tight">Step 1</p>
                <p className="text-[11px] truncate opacity-85">Identity Verified</p>
              </div>
            </button>

            <button
              onClick={() => onSelectStep(2)}
              type="button"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full bg-[#0a6fa8] text-white shadow-sm text-left"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#005684] font-bold text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-bold truncate leading-tight">Step 2</p>
                <p className="text-[11px] text-[#dcecff] truncate">Email &amp; Phone</p>
              </div>
            </button>

            <button
              onClick={() => onSelectStep(3)}
              type="button"
              className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full text-left transition-all ${
                isNightShiftMode ? 'bg-[#15233a] text-[#8ea5c8]' : 'bg-[#eaedff] text-[#707881]'
              }`}
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#707881]/20 text-[#404850] dark:text-[#8ea5c8] font-medium text-sm flex items-center justify-center shrink-0">
                3
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-medium truncate leading-tight">Step 3</p>
                <p className="text-[11px] truncate opacity-85">Clinical License</p>
              </div>
            </button>

            <button
              onClick={() => onSelectStep(4)}
              type="button"
              className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full text-left transition-all ${
                isNightShiftMode ? 'bg-[#15233a] text-[#8ea5c8]' : 'bg-[#eaedff] text-[#707881]'
              }`}
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#707881]/20 text-[#404850] dark:text-[#8ea5c8] font-medium text-sm flex items-center justify-center shrink-0">
                4
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-medium truncate leading-tight">Step 4</p>
                <p className="text-[11px] truncate opacity-85">Work Contract</p>
              </div>
            </button>
          </div>
        </div>
      </div>

      {/* Main Card */}
      <div
        className={`max-w-2xl mx-auto rounded-3xl p-6 sm:p-10 shadow-xl transition-all ${
          isNightShiftMode ? 'bg-[#0E1A2E] border border-[#233550] text-[#E6ECF7]' : 'bg-white text-[#001848]'
        }`}
      >
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-2.5">
            <span
              className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${
                isNightShiftMode ? 'bg-[#3E9AD1]/20 text-[#93ccff]' : 'bg-[#cde5ff] text-[#005684]'
              }`}
            >
              <span className="material-symbols-outlined text-sm">mark_email_read</span>
              Step 2: Contact &amp; Shift Dispatch
            </span>
            <span className="text-xs font-medium text-[#195b4c] dark:text-[#aff0db] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span> Verified
            </span>
          </div>

          <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight mb-2 leading-tight">
            Email &amp; Direct Phone Line
          </h1>
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isNightShiftMode ? 'text-[#9CB3D3]' : 'text-[#404850]'
            }`}
          >
            We coordinate quiet-hours check-ins and emergency hospital shift notices directly with your confirmed contact details.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-semibold mb-1.5">
              Work / Health System Email
            </label>
            <div className="relative">
              <input
                type="email"
                value={data.workEmail}
                onChange={(e) => onChange({ workEmail: e.target.value })}
                className={`w-full rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550]'
                    : 'bg-[#f2f3ff] text-[#001848]'
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#195b4c] dark:text-[#aff0db]">
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Mobile Phone (SMS Enabled)</label>
            <div className="relative">
              <input
                type="tel"
                value={data.mobilePhone}
                onChange={(e) => onChange({ mobilePhone: e.target.value })}
                className={`w-full rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550]'
                    : 'bg-[#f2f3ff] text-[#001848]'
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3.5 text-[#195b4c] dark:text-[#aff0db]">
                <span className="material-symbols-outlined text-xl">check_circle</span>
              </div>
            </div>
          </div>

          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 border ${
              isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#aff0db]/20 border-[#aff0db]/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#aff0db] text-[#195b4c] flex items-center justify-center">
                <span className="material-symbols-outlined">lock</span>
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  Two-Factor Authentication Confirmed
                </div>
                <div className="text-xs text-[#195b4c] dark:text-[#aff0db] font-medium">
                  Verified via SMS code 8492
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#195b4c] text-white">
              Active
            </span>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-full bg-[#0a6fa8] hover:bg-[#005684] text-white font-semibold flex items-center gap-2"
            >
              <span>Continue to Step 3: Clinical License</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectStep(1)}
              className="px-4 py-2 text-sm text-[#005684] dark:text-[#3E9AD1] font-semibold hover:underline"
            >
              Back to Step 1
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
