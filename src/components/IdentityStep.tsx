import React, { useState, useRef } from 'react';
import { VerificationFormData, VerificationStepId } from '../types';
import { ClinicalDatePicker } from './ClinicalDatePicker';

interface IdentityStepProps {
  data: VerificationFormData;
  onChange: (updates: Partial<VerificationFormData>) => void;
  onNextStep: () => void;
  onSelectStep: (step: VerificationStepId) => void;
  isNightShiftMode: boolean;
}

const formatDateFriendly = (dateStr: string) => {
  if (!dateStr) return '';
  try {
    const [year, month, day] = dateStr.split('-');
    const d = new Date(parseInt(year), parseInt(month) - 1, parseInt(day), 12);
    return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(d);
  } catch {
    return dateStr;
  }
};

export const IdentityStep: React.FC<IdentityStepProps> = ({
  data,
  onChange,
  onNextStep,
  onSelectStep,
  isNightShiftMode,
}) => {
  const [isSaved, setIsSaved] = useState(false);
  const [showSSN, setShowSSN] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onChange({ isIdVerified: true });
    setIsSaved(true);
    setTimeout(() => {
      onSelectStep(2);
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
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full bg-[#0a6fa8] text-white shadow-sm text-left"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#005684] font-bold text-sm flex items-center justify-center shrink-0">
                1
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-bold truncate leading-tight">Step 1</p>
                <p className="text-[11px] text-[#dcecff] truncate">Identity Verified</p>
              </div>
            </button>

            <button
              onClick={() => onSelectStep(2)}
              type="button"
              className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full text-left transition-all duration-200 ease-in-out ${
                isNightShiftMode ? 'bg-[#15233a] text-[#8ea5c8]' : 'bg-[#eaedff] text-[#707881]'
              }`}
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#707881]/20 text-[#404850] dark:text-[#8ea5c8] font-medium text-sm flex items-center justify-center shrink-0">
                2
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-medium truncate leading-tight">Step 2</p>
                <p className="text-[11px] truncate opacity-85">Email &amp; Phone</p>
              </div>
            </button>

            <button
              onClick={() => onSelectStep(3)}
              type="button"
              className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full text-left transition-all duration-200 ease-in-out ${
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
              className={`flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full text-left transition-all duration-200 ease-in-out ${
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
        className={`max-w-2xl mx-auto rounded-3xl p-6 sm:p-10 shadow-md transition-all duration-200 ease-in-out ${
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
              <span className="material-symbols-outlined text-sm">badge</span>
              Step 1: Clinical Identity Check
            </span>
            <span className="text-xs font-medium text-[#195b4c] dark:text-[#aff0db] flex items-center gap-1">
              <span className="material-symbols-outlined text-sm">check_circle</span> Verified
            </span>
          </div>

          <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight mb-2 leading-tight">
            Government Identity Verification
          </h1>
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isNightShiftMode ? 'text-[#9CB3D3]' : 'text-[#404850]'
            }`}
          >
            We verify government-issued identification to protect traveling clinicians and ensure secure housing access with verified hosts.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Legal First Name</label>
              <input
                type="text"
                value={data.legalFirstName}
                onChange={(e) => onChange({ legalFirstName: e.target.value })}
                className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550]'
                    : 'bg-[#f2f3ff] text-[#001848]'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Legal Last Name</label>
              <input
                type="text"
                value={data.legalLastName}
                onChange={(e) => onChange({ legalLastName: e.target.value })}
                className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550]'
                    : 'bg-[#f2f3ff] text-[#001848]'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ClinicalDatePicker
                value={data.dob}
                onChange={(newDob) => onChange({ dob: newDob })}
                label="Date of Birth"
                maxDate={new Date().toISOString().split('T')[0]}
                showPresets={false}
                isNightShiftMode={isNightShiftMode}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">SSN (Last 4 Digits)</label>
              <div className="relative">
                <input
                  type={showSSN ? "text" : "password"}
                  maxLength={4}
                  value={data.lastFourSSN}
                  onChange={(e) => onChange({ lastFourSSN: e.target.value })}
                  className={`w-full rounded-xl pl-4 pr-10 py-3 text-sm font-medium focus:outline-none ${
                    isNightShiftMode
                      ? 'bg-[#15233a] text-white border border-[#233550]'
                      : 'bg-[#f2f3ff] text-[#001848]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSSN(!showSSN)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0a6fa8] rounded-full"
                  aria-label={showSSN ? "Hide SSN" : "Show SSN"}
                  aria-pressed={showSSN}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showSSN ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Verified ID attachment card */}
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 border ${
              isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#aff0db]/20 border-[#aff0db]/60'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#aff0db] text-[#195b4c] flex items-center justify-center">
                <span className="material-symbols-outlined">id_card</span>
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  <span>{data.idDocumentName || 'Driver_License_Sarah_Jenkins.pdf'}</span>
                  <span className="material-symbols-outlined text-[#195b4c] dark:text-[#aff0db] text-base">
                    check_circle
                  </span>
                </div>
                <div className="text-xs text-[#195b4c] dark:text-[#aff0db] font-medium">
                  RealID / State Driver's License Verified
                </div>
              </div>
            </div>
            <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#195b4c] text-white">
              Passed
            </span>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="submit"
              className="px-8 py-3.5 rounded-full bg-[#0a6fa8] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white font-semibold flex items-center gap-2"
            >
              <span>Save &amp; Continue to Contact</span>
              <span className="material-symbols-outlined text-lg">arrow_forward</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectStep(3)}
              className="px-4 py-2 text-sm text-[#005684] dark:text-[#3E9AD1] font-semibold hover:underline"
            >
              Jump to Step 3: Clinical License
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
