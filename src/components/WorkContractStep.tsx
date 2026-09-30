import React, { useState } from 'react';
import { VerificationFormData, VerificationStepId } from '../types';
import { VerificationStepperNav } from './VerificationStepperNav';

interface WorkContractStepProps {
  data: VerificationFormData;
  onChange: (updates: Partial<VerificationFormData>) => void;
  onSelectStep: (step: VerificationStepId) => void;
  onOpenSuccessModal: () => void;
  isNightShiftMode: boolean;
}

export const WorkContractStep: React.FC<WorkContractStepProps> = ({
  data,
  onChange,
  onSelectStep,
  onOpenSuccessModal,
  isNightShiftMode,
}) => {
  const [contractFile, setContractFile] = useState(
    data.contractDocumentName || 'Aya_TravelNurse_Assignment_Contract_Stanford.pdf'
  );
  const [isFinishing, setIsFinishing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsFinishing(true);
    setTimeout(() => {
      setIsFinishing(false);
      onChange({ isContractVerified: true, contractDocumentName: contractFile });
      onOpenSuccessModal();
    }, 800);
  };

  return (
    <div
      className={`w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
        isNightShiftMode ? 'bg-[#08101C]' : 'bg-[#EFF6FB]'
      }`}
    >
      {/* Stepper Navigation Bar */}
      <VerificationStepperNav
        currentStep={4}
        data={data}
        onSelectStep={onSelectStep}
        isNightShiftMode={isNightShiftMode}
      />

      {/* Main Card */}
      <div
        className={`max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 shadow-sm transition-all ${
          isNightShiftMode ? 'bg-[#0B1626] border border-[#233550] text-[#E6ECF7]' : 'bg-white border border-[rgba(11,37,89,0.06)] text-[#0B2559]'
        }`}
      >
        <div className="mb-5">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FB] dark:bg-[#15233a] text-[#0A6FA8] dark:text-[#3E9AD1]">
              <span className="material-symbols-outlined text-[15px]">assignment_turned_in</span>
              Step 4 of 4 • Assignment Contract
            </span>
            <span className="text-xs font-medium text-gray-500">
              ~1 min
            </span>
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-[#0B2559] dark:text-white">
            Hospital assignment contract
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Attaches <strong>Contract Flex Protection</strong>: if your facility shift gets cancelled or rescheduled, your booking cancels penalty-free.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Staffing Agency / Recruiter</label>
              <input
                type="text"
                value={data.travelAgency}
                onChange={(e) => onChange({ travelAgency: e.target.value })}
                className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550]'
                    : 'bg-[#f2f3ff] text-[#001848]'
                }`}
              />
            </div>

            <div>
              <label className="block text-sm font-semibold mb-1.5">Contract Duration (Weeks)</label>
              <input
                type="number"
                min="1"
                step="1"
                value={data.contractDurationWeeks}
                onChange={(e) => onChange({ contractDurationWeeks: Number(e.target.value) })}
                className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550]'
                    : 'bg-[#f2f3ff] text-[#001848]'
                }`}
                placeholder="e.g., 13"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1.5">Assigned Hospital Facility</label>
            <input
              type="text"
              value={data.contractHospital}
              onChange={(e) => onChange({ contractHospital: e.target.value })}
              className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none ${
                isNightShiftMode
                  ? 'bg-[#15233a] text-white border border-[#233550]'
                  : 'bg-[#f2f3ff] text-[#001848]'
              }`}
            />
          </div>

          {/* Uploaded Contract Document */}
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 border ${
              isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#eaedff] border-[#dae2ff]'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-[#aff0db] text-[#195b4c] flex items-center justify-center shrink-0 font-bold">
                <span className="material-symbols-outlined">description</span>
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-sm font-bold truncate">{contractFile}</span>
                  <span className="material-symbols-outlined text-[#195b4c] text-base">check_circle</span>
                </div>
                <span className="text-xs text-[#404850] dark:text-[#8ea5c8]">
                  2.1 MB • Shift Confirmation Verified
                </span>
              </div>
            </div>
            <button
              type="button"
              onClick={() => setContractFile('Contract_Reuploaded.pdf')}
              className="text-xs text-[#0a6fa8] dark:text-[#3E9AD1] font-semibold hover:underline"
            >
              Replace
            </button>
          </div>

          {/* Contract Flex badge */}
          <div
            className={`p-4 rounded-2xl flex items-center gap-3 ${
              isNightShiftMode ? 'bg-[#195b4c]/20 text-[#aff0db]' : 'bg-[#aff0db]/30 text-[#195b4c]'
            }`}
          >
            <span className="material-symbols-outlined text-2xl">verified_user</span>
            <p className="text-xs leading-relaxed font-medium">
              Contract Flex Protection Active: You are protected against assignment cancellations, unit closures, or call-offs with 100% deposit returns.
            </p>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isFinishing}
              className="px-6 py-2.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] active:bg-[#095C8C] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <span>{isFinishing ? 'Saving credentials...' : 'Complete verification'}</span>
              <span className="material-symbols-outlined text-[16px]">check</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectStep(3)}
              className="px-3 py-1.5 text-xs text-[#0A6FA8] dark:text-[#3E9AD1] font-semibold hover:underline cursor-pointer"
            >
              Back to Clinical License
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
