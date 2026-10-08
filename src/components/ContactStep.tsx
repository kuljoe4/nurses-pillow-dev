import React, {   useState , useEffect , useRef } from 'react';
import { VerificationFormData, VerificationStepId } from '../types';
import { VerificationStepperNav } from './VerificationStepperNav';

interface ContactStepProps {
  data: VerificationFormData;
  onChange: (updates: Partial<VerificationFormData>) => void;
  onNextStep: () => void;
  onSelectStep: (step: VerificationStepId) => void;
  isNightShiftMode: boolean;
  onOpenPostmarkEmail?: () => void;
  onOpenTwilioOtp?: () => void;
}

export const ContactStep: React.FC<ContactStepProps> = ({
  data,
  onChange,
  onNextStep,
  onSelectStep,
  isNightShiftMode,
  onOpenPostmarkEmail,
  onOpenTwilioOtp,
}) => {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (errorMessage && errorRef.current) {
      errorRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [errorMessage]);

  const formatPhoneNumber = (value: string) => {
    const cleaned = value.replace(/[^\d+]/g, '').slice(0, 16);
    // If it's a 10 digit number without + prefix, format it nicely
    if (cleaned.length === 10 && !cleaned.startsWith('+')) {
      return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
    } else if (cleaned.length > 3 && cleaned.length < 10 && !cleaned.startsWith('+')) {
       if (cleaned.length > 6) {
           return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;
       }
       return `(${cleaned.slice(0, 3)}) ${cleaned.slice(3)}`;
    }
    return cleaned;
  };

  const validateInputs = (): string | null => {
    const email = (data.workEmail || '').trim();
    if (!email) {
      return 'Please enter your hospital or work email.';
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address (e.g. name@hospital.org).';
    }

    const rawPhone = (data.mobilePhone || '').replace(/\D/g, '');
    if (!rawPhone || rawPhone.length < 7 || rawPhone.length > 15) {
      return 'Please enter a valid mobile phone number (7 to 15 digits).';
    }

    return null;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const error = validateInputs();
    if (error) {
      setErrorMessage(error);
      return;
    }
    const isBothVerified = Boolean(data.isContactVerified && data.phoneVerified);
    const isProduction = import.meta.env.PROD;

    if (isProduction && !isBothVerified) {
      setErrorMessage("Please complete both email and phone verification before proceeding.");
      return;
    }

    setErrorMessage(null);


    // Save entered contact values without forging false verification
    onChange({
      workEmail: data.workEmail.trim(),
      mobilePhone: data.mobilePhone.trim(),
    });

    setTimeout(() => {
      onSelectStep(3);
    }, 300);
  };

  const isBothVerified = Boolean(data.isContactVerified && data.phoneVerified);
  const isPartiallyVerified = Boolean(data.isContactVerified || data.phoneVerified);

  return (
    <div
      className={`w-full py-8 sm:py-12 px-4 sm:px-6 lg:px-8 transition-colors ${
        isNightShiftMode ? 'bg-[#08101C]' : 'bg-[#EFF6FB]'
      }`}
    >
      {/* Stepper Navigation Bar */}
      <VerificationStepperNav
        currentStep={2}
        data={data}
        onSelectStep={onSelectStep}
        isNightShiftMode={isNightShiftMode}
      />

      {/* Main Card */}
      <div
        className={`max-w-2xl mx-auto rounded-3xl p-6 sm:p-8 shadow-sm transition-all ${
          isNightShiftMode
            ? 'bg-[#0B1626] border border-[#233550] text-[#E6ECF7]'
            : 'bg-white border border-[rgba(11,37,89,0.06)] text-[#0B2559]'
        }`}
      >
        <div className="mb-6">
          <div className="flex items-center justify-between gap-4 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-[#EFF6FB] dark:bg-[#15233a] text-[#0A6FA8] dark:text-[#3E9AD1]">
              <span className="material-symbols-outlined text-[15px]">mark_email_read</span>
              Step 2 of 4 • Contact Information
            </span>

            {isBothVerified ? (
              <span className="text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">check_circle</span>
                Verified
              </span>
            ) : isPartiallyVerified ? (
              <span className="text-xs font-bold text-[#B9822E] dark:text-[#F1CF78] flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">schedule</span>
                Partially Verified
              </span>
            ) : (
              <span className="text-xs font-bold text-gray-500 dark:text-gray-400 flex items-center gap-1">
                <span className="material-symbols-outlined text-[15px]">pending</span>
                Pending Verification
              </span>
            )}
          </div>

          <h1 className="text-xl sm:text-2xl font-bold tracking-tight mb-1 text-[#0B2559] dark:text-white">
            Hospital email &amp; direct mobile
          </h1>
          <p className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">
            Used strictly for check-in access, emergency shift notifications, and direct messaging with hosts.
          </p>
        </div>

        {errorMessage && (
          <div ref={errorRef} className="mb-4 p-3 rounded-xl bg-red-50 text-red-600 text-xs font-semibold flex items-center gap-2">
            <span className="material-symbols-outlined text-sm shrink-0">error</span>
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="workEmail" className="block text-sm font-semibold">
                Work / Health System Email *
              </label>
              {data.isContactVerified ? (
                <span className="text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenPostmarkEmail}
                  className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1] hover:underline cursor-pointer"
                >
                  Verify Email
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="workEmail"
                type="email"
                required
                value={data.workEmail}
                onChange={(e) => {
                  setErrorMessage(null);
                  onChange({ workEmail: e.target.value });
                }}
                placeholder="name@hospital.org"
                className={`w-full rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A6FA8] ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550]'
                    : 'bg-[#EFF6FB] text-[#0B2559]'
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
                {data.isContactVerified ? (
                  <span className="material-symbols-outlined text-xl text-[#2F6E5E] dark:text-[#aff0db]">
                    check_circle
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-xl text-gray-400">
                    mail
                  </span>
                )}
              </div>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="mobilePhone" className="block text-sm font-semibold">
                Mobile Phone (SMS Enabled) *
              </label>
              {data.phoneVerified ? (
                <span className="text-xs font-bold text-[#2F6E5E] dark:text-[#aff0db] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  Verified
                </span>
              ) : (
                <button
                  type="button"
                  onClick={onOpenTwilioOtp}
                  className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1] hover:underline cursor-pointer"
                >
                  Verify Phone
                </button>
              )}
            </div>
            <div className="relative">
              <input
                id="mobilePhone"
                type="tel"
                required
                value={data.mobilePhone}
                onChange={(e) => {
                  setErrorMessage(null);
                  onChange({ mobilePhone: formatPhoneNumber(e.target.value) });
                }}
                placeholder="+1 (555) 000-0000"
                className={`w-full rounded-xl px-4 py-3 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-[#0A6FA8] tabular-nums ${
                  isNightShiftMode
                    ? 'bg-[#15233a] text-white border border-[#233550]'
                    : 'bg-[#EFF6FB] text-[#0B2559]'
                }`}
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3.5">
                {data.phoneVerified ? (
                  <span className="material-symbols-outlined text-xl text-[#2F6E5E] dark:text-[#aff0db]">
                    check_circle
                  </span>
                ) : (
                  <span className="material-symbols-outlined text-xl text-gray-400">
                    smartphone
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Real Status Card */}
          <div
            className={`p-4 rounded-2xl flex items-center justify-between gap-3 border transition-colors ${
              data.phoneVerified
                ? isNightShiftMode
                  ? 'bg-[#15233a] border-[#233550]'
                  : 'bg-[#E1EFE9] border-[#2F6E5E]/20 text-[#0B2559]'
                : isNightShiftMode
                ? 'bg-[#15233a] border-[#3E9AD1]/30'
                : 'bg-[#EFF6FB] border-[#0A6FA8]/20'
            }`}
          >
            <div className="flex items-center gap-3">
              <div
                className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                  data.phoneVerified
                    ? 'bg-[#2F6E5E] text-white'
                    : 'bg-[#0A6FA8] text-white'
                }`}
              >
                <span className="material-symbols-outlined">
                  {data.phoneVerified ? 'verified_user' : 'sms'}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold flex items-center gap-1.5">
                  {data.phoneVerified
                    ? 'Mobile SMS Authentication Confirmed'
                    : 'Mobile SMS Verification Pending'}
                </div>
                <div className="text-xs text-gray-500 dark:text-gray-400 font-medium">
                  {data.phoneVerified
                    ? 'Your phone number is authenticated for check-in codes.'
                    : 'Verify via 6-digit SMS code to enable direct host messaging.'}
                </div>
              </div>
            </div>
            {data.phoneVerified ? (
              <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-[#2F6E5E] text-white shrink-0">
                Verified
              </span>
            ) : (
              <button
                type="button"
                onClick={onOpenTwilioOtp}
                className="text-xs font-semibold px-3 py-1.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white shrink-0 cursor-pointer"
              >
                Send Code
              </button>
            )}
          </div>

          {/* Interactive Verification Flow Launchers */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
            <button
              type="button"
              onClick={onOpenPostmarkEmail}
              className="p-3.5 rounded-xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550] hover:border-[#0A6FA8] bg-white/60 dark:bg-[#15233a] text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">mark_email_read</span>
                  Hospital Email Verification
                </span>
                <span className="material-symbols-outlined text-xs text-[#0A6FA8] dark:text-[#3E9AD1] group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {data.isContactVerified ? 'Email confirmed. Click to change.' : 'Confirm your hospital email with a 6-digit PIN.'}
              </p>
            </button>

            <button
              type="button"
              onClick={onOpenTwilioOtp}
              className="p-3.5 rounded-xl border border-[rgba(11,37,89,0.08)] dark:border-[#233550] hover:border-[#0A6FA8] bg-white/60 dark:bg-[#15233a] text-left transition-all cursor-pointer group"
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px]">sms</span>
                  Mobile Phone Verification
                </span>
                <span className="material-symbols-outlined text-xs text-[#0A6FA8] dark:text-[#3E9AD1] group-hover:translate-x-0.5 transition-transform">
                  arrow_forward
                </span>
              </div>
              <p className="text-[11px] text-gray-500 dark:text-gray-400">
                {data.phoneVerified ? 'Phone confirmed. Click to change.' : 'Verify your mobile line for check-in codes.'}
              </p>
            </button>
          </div>

          <div className="pt-4 flex items-center justify-between gap-3">
            <button
              type="submit"
              className="px-6 py-2.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] text-white text-xs font-bold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              <span>Save &amp; continue</span>
              <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
            </button>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => onSelectStep(1)}
                className="px-3 py-1.5 text-xs text-[#0A6FA8] dark:text-[#3E9AD1] font-semibold hover:underline cursor-pointer"
              >
                Back
              </button>
              {isBothVerified && (
                <button
                  type="button"
                  onClick={() => onSelectStep(3)}
                  className="px-3 py-1.5 text-xs text-[#0A6FA8] dark:text-[#3E9AD1] font-semibold hover:underline cursor-pointer"
                >
                  Continue to Step 3
                </button>
              )}
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
