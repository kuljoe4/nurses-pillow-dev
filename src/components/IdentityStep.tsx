import React, { useState, useRef } from 'react';
import { VerificationFormData, VerificationStepId } from '../types';
import { ClinicalDatePicker } from './ClinicalDatePicker';
import { VerificationStepperNav } from './VerificationStepperNav';

interface IdentityStepProps {
  data: VerificationFormData;
  onChange: (updates: Partial<VerificationFormData>) => void;
  onNextStep: () => void;
  onSelectStep: (step: VerificationStepId) => void;
  isNightShiftMode: boolean;
}

export const IdentityStep: React.FC<IdentityStepProps> = ({
  data,
  onChange,
  onNextStep,
  onSelectStep,
  isNightShiftMode,
}) => {
  const [showSSN, setShowSSN] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationError, setVerificationError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateInputs = (): string | null => {
    const firstName = (data.legalFirstName || '').trim();
    if (!firstName || firstName.length < 2) {
      return 'Please enter your legal first name (minimum 2 characters).';
    }

    const lastName = (data.legalLastName || '').trim();
    if (!lastName || lastName.length < 2) {
      return 'Please enter your legal last name (minimum 2 characters).';
    }

    if (!data.dob) {
      return 'Please enter your date of birth.';
    }

    const dobDate = new Date(data.dob);
    if (isNaN(dobDate.getTime())) {
      return 'Please enter a valid date of birth.';
    }

    const ageDiffMs = Date.now() - dobDate.getTime();
    const ageDate = new Date(ageDiffMs);
    const age = Math.abs(ageDate.getUTCFullYear() - 1970);
    if (age < 18 || dobDate > new Date()) {
      return 'You must be at least 18 years of age to complete clinician verification.';
    }

    const ssn = (data.lastFourSSN || '').trim().replace(/\D/g, '');
    if (ssn.length !== 4) {
      return 'Please enter the exact 4 digits of your SSN.';
    }

    if (!data.idDocumentName) {
      return 'Please upload a photo or scan of your government-issued ID (Driver License or Passport).';
    }

    return null;
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) {
        setVerificationError('Document file size must be under 10MB.');
        return;
      }
      setVerificationError(null);
      onChange({ idDocumentName: file.name });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const validationMsg = validateInputs();
    if (validationMsg) {
      setVerificationError(validationMsg);
      return;
    }

    setIsVerifying(true);
    setVerificationError(null);

    try {
      const token = localStorage.getItem('np_auth_token') || sessionStorage.getItem('np_auth_token');
      const userEmail = localStorage.getItem('np_user_email') || data.workEmail;

      const res = await fetch('/api/verify/identity', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          legalFirstName: data.legalFirstName.trim(),
          legalLastName: data.legalLastName.trim(),
          dob: data.dob,
          lastFourSSN: data.lastFourSSN.trim().replace(/\D/g, ''),
          idDocumentName: data.idDocumentName,
          email: userEmail,
        }),
      });

      const result = await res.json();
      if (!res.ok) {
        throw new Error(result.error || 'Verification failed. Please check your details.');
      }

      onChange({
        isIdVerified: true,
        legalFirstName: data.legalFirstName.trim(),
        legalLastName: data.legalLastName.trim(),
        lastFourSSN: data.lastFourSSN.trim().replace(/\D/g, ''),
        dob: data.dob,
      });

      setTimeout(() => {
        onSelectStep(2);
      }, 300);
    } catch (err: any) {
      setVerificationError(err.message || 'Verification could not be completed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div
      className={`w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
        isNightShiftMode ? 'bg-[#08101C]' : 'bg-[#EFF6FB]'
      }`}
    >
      {/* Stepper Navigation Bar */}
      <VerificationStepperNav
        currentStep={1}
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
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FB] dark:bg-[#15233a] text-[#0A6FA8] dark:text-[#3E9AD1]">
              <span className="material-symbols-outlined text-[15px]">badge</span>
              Step 1 of 4 • Identity
            </span>
            {data.isIdVerified ? (
              <span className="text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                Verified
              </span>
            ) : (
              <span className="text-xs font-bold text-[#B9822E] dark:text-[#F1CF78] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">schedule</span>
                Pending Verification
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-[#0B2559] dark:text-white">
            Confirm your legal identity
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Verify your legal details to access clinician-exclusive rates and connect with host properties.
          </p>
        </div>

        {verificationError && (
          <div className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{verificationError}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold mb-1.5">Legal First Name *</label>
              <input
                type="text"
                required
                value={data.legalFirstName}
                onChange={(e) => {
                  setVerificationError(null);
                  onChange({ legalFirstName: e.target.value });
                }}
                placeholder="e.g. Sarah"
                className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A6FA8] ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550]'
                    : 'bg-[#EFF6FB] text-[#0B2559]'
                }`}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">Legal Last Name *</label>
              <input
                type="text"
                required
                value={data.legalLastName}
                onChange={(e) => {
                  setVerificationError(null);
                  onChange({ legalLastName: e.target.value });
                }}
                placeholder="e.g. Jenkins"
                className={`w-full rounded-xl px-4 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A6FA8] ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550]'
                    : 'bg-[#EFF6FB] text-[#0B2559]'
                }`}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <ClinicalDatePicker
                value={data.dob}
                onChange={(newDob) => {
                  setVerificationError(null);
                  onChange({ dob: newDob });
                }}
                maxDate={new Date().toISOString().split('T')[0]}
                showPresets={false}
                isNightShiftMode={isNightShiftMode}
              />
            </div>
            <div>
              <label className="block text-sm font-semibold mb-1.5">SSN (Last 4 Digits) *</label>
              <div className="relative">
                <input
                  type={showSSN ? "text" : "password"}
                  maxLength={4}
                  required
                  placeholder="••••"
                  value={data.lastFourSSN}
                  onChange={(e) => {
                    setVerificationError(null);
                    const val = e.target.value.replace(/\D/g, '').slice(0, 4);
                    onChange({ lastFourSSN: val });
                  }}
                  className={`w-full rounded-xl pl-4 pr-10 py-3 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A6FA8] tabular-nums ${
                    isNightShiftMode
                      ? 'bg-[#15233a] text-white border border-[#233550]'
                      : 'bg-[#EFF6FB] text-[#0B2559]'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setShowSSN(!showSSN)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 focus:outline-none rounded-full cursor-pointer"
                  aria-label={showSSN ? "Hide SSN" : "Show SSN"}
                >
                  <span className="material-symbols-outlined text-[20px]">
                    {showSSN ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
            </div>
          </div>

          {/* Government ID Document Upload */}
          <div className="pt-2">
            <label className="block text-sm font-semibold mb-1.5">Government-Issued Photo ID *</label>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".pdf,.png,.jpg,.jpeg"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className={`p-4 rounded-2xl flex items-center justify-between gap-3 border transition-colors cursor-pointer ${
                data.idDocumentName
                  ? data.isIdVerified
                    ? isNightShiftMode
                      ? 'bg-[#15233a] border-[#233550]'
                      : 'bg-[#E1EFE9] border-[#2F6E5E]/20 text-[#0B2559]'
                    : isNightShiftMode
                    ? 'bg-[#15233a] border-[#3E9AD1]/40'
                    : 'bg-[#EFF6FB] border-[#0A6FA8]/30'
                  : isNightShiftMode
                  ? 'bg-[#15233a]/60 border-dashed border-[#233550] hover:border-[#3E9AD1]'
                  : 'bg-[#EFF6FB]/60 border-dashed border-[#0A6FA8]/30 hover:border-[#0A6FA8]'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                    data.isIdVerified
                      ? 'bg-[#2F6E5E] text-white'
                      : 'bg-[#0A6FA8] text-white'
                  }`}
                >
                  <span className="material-symbols-outlined">
                    {data.isIdVerified ? 'check_circle' : 'id_card'}
                  </span>
                </div>
                <div>
                  <div className="text-sm font-bold flex items-center gap-1.5">
                    <span>{data.idDocumentName || 'Upload Driver License or Passport'}</span>
                    {data.isIdVerified && (
                      <span className="material-symbols-outlined text-[#2F6E5E] dark:text-[#aff0db] text-base">
                        check_circle
                      </span>
                    )}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                    {data.idDocumentName
                      ? data.isIdVerified
                        ? 'Government RealID Verified'
                        : 'Document attached • Ready to verify'
                      : 'Supported formats: PDF, PNG, JPG (Max 10MB)'}
                  </div>
                </div>
              </div>
              <button
                type="button"
                className={`text-xs font-semibold px-3 py-1.5 rounded-full shrink-0 transition-colors ${
                  data.isIdVerified
                    ? 'bg-[#2F6E5E] text-white'
                    : 'bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white'
                }`}
              >
                {data.isIdVerified ? 'Verified' : data.idDocumentName ? 'Change File' : 'Browse File'}
              </button>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="submit"
              disabled={isVerifying}
              className="px-6 py-2.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs disabled:opacity-50"
            >
              <span>{isVerifying ? 'Verifying legal identity...' : 'Save & continue'}</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            {data.isIdVerified && (
              <button
                type="button"
                onClick={() => onSelectStep(2)}
                className="px-3 py-1.5 text-xs text-[#0A6FA8] dark:text-[#3E9AD1] font-semibold hover:underline cursor-pointer"
              >
                Continue to Step 2
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
