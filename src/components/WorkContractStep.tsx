import React, { useState } from 'react';
import { VerificationFormData, VerificationStepId } from '../types';

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
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full bg-[#aff0db]/30 text-[#195b4c] text-left hover:bg-[#aff0db]/50 transition-all"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#195b4c] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base font-bold">check</span>
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-bold truncate leading-tight">Step 2</p>
                <p className="text-[11px] truncate opacity-85">Email &amp; Phone</p>
              </div>
            </button>

            <button
              onClick={() => onSelectStep(3)}
              type="button"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full bg-[#aff0db]/30 text-[#195b4c] text-left hover:bg-[#aff0db]/50 transition-all"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-[#195b4c] text-white flex items-center justify-center shrink-0">
                <span className="material-symbols-outlined text-base font-bold">check</span>
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-bold truncate leading-tight">Step 3</p>
                <p className="text-[11px] truncate opacity-85">Clinical License</p>
              </div>
            </button>

            <button
              onClick={() => onSelectStep(4)}
              type="button"
              className="flex items-center gap-2 sm:gap-3 px-2 sm:px-4 py-2 rounded-full bg-[#0a6fa8] text-white shadow-sm text-left"
            >
              <span className="w-7 h-7 sm:w-8 sm:h-8 rounded-full bg-white text-[#005684] font-bold text-sm flex items-center justify-center shrink-0">
                4
              </span>
              <div className="min-w-0 hidden md:block">
                <p className="text-xs font-bold truncate leading-tight">Step 4</p>
                <p className="text-[11px] text-[#dcecff] truncate">Work Contract</p>
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
              <span className="material-symbols-outlined text-sm">assignment_turned_in</span>
              Final Step: Travel Contract Matching
            </span>
            <span
              className={`text-xs font-medium ${
                isNightShiftMode ? 'text-[#8ea5c8]' : 'text-[#404850]'
              }`}
            >
              Estimated: 1 min
            </span>
          </div>

          <h1 className="text-2xl sm:text-[30px] font-bold tracking-tight mb-2 leading-tight">
            Verify your hospital assignment contract
          </h1>
          <p
            className={`text-sm sm:text-base leading-relaxed ${
              isNightShiftMode ? 'text-[#9CB3D3]' : 'text-[#404850]'
            }`}
          >
            Uploading your travel contract or hospital confirmation unlocks <strong>Contract Flex Protection</strong>—if your hospital assignment gets called off or rescheduled, your lease cancels penalty-free.
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
              className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-[#0a6fa8] hover:bg-[#005684] text-white font-semibold flex items-center justify-center gap-2 shadow-md cursor-pointer"
            >
              <span>{isFinishing ? 'Activating Credentials...' : 'Complete All Verification'}</span>
              <span className="material-symbols-outlined text-lg">check</span>
            </button>
            <button
              type="button"
              onClick={() => onSelectStep(3)}
              className="px-4 py-2 text-sm text-[#005684] dark:text-[#3E9AD1] font-semibold hover:underline"
            >
              Back to Step 3: Clinical License
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
