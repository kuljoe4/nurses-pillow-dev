import React, { useState, useEffect, useRef } from 'react';
import { postmarkMail } from '../services/postmarkMail';

interface PostmarkEmailVerificationViewProps {
  isNightShiftMode: boolean;
  initialEmail?: string;
  onProceedToPhoneVerification: () => void;
  onProceedToLicenseVerification: () => void;
  onBackToOverview?: () => void;
}

export const PostmarkEmailVerificationView: React.FC<PostmarkEmailVerificationViewProps> = ({
  isNightShiftMode,
  initialEmail,
  onProceedToPhoneVerification,
  onProceedToLicenseVerification,
  onBackToOverview,
}) => {
  const [email, setEmail] = useState(initialEmail || 'sarah.jenkins@alumni.duke.edu');
  const [pin, setPin] = useState(['9', '3', '8', '4', '1', '2']);
  const [countdown, setCountdown] = useState(48);
  const [canResend, setCanResend] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const [resendNotification, setResendNotification] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const pinInputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Send transactional email on mount
  useEffect(() => {
    // In a real flow, OTP generation happens on backend. For dev mode, this mock triggers the email.
    postmarkMail.sendVerificationEmail(email, 'User', '938412');
  }, [email]);

  // Countdown timer for resend
  useEffect(() => {
    if (countdown > 0) {
      const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(timer);
    } else {
      setCanResend(true);
    }
  }, [countdown]);

  const handlePinChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const newPin = [...pin];
    newPin[index] = cleanVal ? cleanVal[cleanVal.length - 1] : '';
    setPin(newPin);

    // Auto-advance
    if (cleanVal && index < 5) {
      pinInputRefs.current[index + 1]?.focus();
      pinInputRefs.current[index + 1]?.select();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !pin[index] && index > 0) {
      pinInputRefs.current[index - 1]?.focus();
    }
  };

  const handleEditEmail = () => {
    const newEmail = prompt('Enter your updated medical or institutional email address:', email);
    if (newEmail && newEmail.includes('@')) {
      setEmail(newEmail.trim());
      void postmarkMail.sendVerificationEmail(newEmail.trim(), 'Sarah E. Jenkins', '938412');
    }
  };

  const handleResend = async () => {
    if (!canResend) return;
    const res = await postmarkMail.sendVerificationEmail(email, 'Sarah E. Jenkins', '938412');
    setCountdown(60);
    setCanResend(false);
    setResendNotification(`Postmark email dispatched to ${email} (MessageID: ${res.messageId.slice(0, 12)}...)`);
    setTimeout(() => setResendNotification(null), 5000);
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    setError(null);

    try {
      const pinCode = pin.join('');
      if (pinCode.length !== 6) throw new Error('Please enter a 6-digit PIN');

      const res = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, pin: pinCode })
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Verification failed');
      }

      setIsVerified(true);
      setTimeout(() => {
        onProceedToPhoneVerification();
      }, 1000);
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setIsVerifying(false);
    }
  };

  const formattedCountdown = `00:${countdown < 10 ? `0${countdown}` : countdown}`;

  return (
    <div
      className={`w-full min-h-screen transition-colors ${
        isNightShiftMode ? 'bg-[#08101C] text-[#E6ECF7]' : 'bg-[#faf8ff] text-[#001848]'
      }`}
    >
      {/* Top Onboarding Stepper Bar */}
      <section
        className={`w-full py-6 border-b transition-colors ${
          isNightShiftMode
            ? 'bg-[#0B1626] border-[#233550] shadow-md'
            : 'bg-white border-[#eaedff] shadow-xs'
        }`}
      >
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <div>
              <span className="text-xs uppercase tracking-wider text-[#005684] dark:text-[#93ccff] font-bold">
                Onboarding Pipeline
              </span>
              <p className="text-xs sm:text-sm text-[#404850] dark:text-[#c0c7d1]">
                Complete clinical credentialing to unlock verified night-shift sanctuaries.
              </p>
            </div>
            {error && (
              <div role="alert" className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold flex items-center gap-2">
                <span className="material-symbols-outlined text-[16px]">error</span>
                {error}
              </div>
            )}
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#367464]/15 text-[#195b4c] dark:bg-[#aff0db]/20 dark:text-[#aff0db]">
              <span className="material-symbols-outlined text-[18px]">verified_user</span>
              <span className="text-xs font-semibold">Postmark Secure Gateway Active</span>
            </div>
          </div>

          {/* Stepper Nodes */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
            {/* Step 1: Completed */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#195b4c] text-white flex items-center justify-center shrink-0 shadow-xs">
                <span className="material-symbols-outlined text-[18px]">check</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">1. Account Created</div>
                <div className="text-[11px] text-[#195b4c] dark:text-[#aff0db] font-semibold truncate">
                  Completed
                </div>
              </div>
            </div>

            {/* Step 2: Active */}
            <div className="flex items-center gap-3 p-3 rounded-xl bg-[#0a6fa8] text-white shadow-md ring-2 ring-[#0a6fa8]/20">
              <div className="w-8 h-8 rounded-full bg-white text-[#005684] font-bold flex items-center justify-center shrink-0">
                <span className="text-xs">2</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-bold truncate">Email Verification</div>
                <div className="text-[11px] text-[#dcecff] truncate">Active • Postmark Delivery</div>
              </div>
            </div>

            {/* Step 3 */}
            <div
              onClick={onProceedToPhoneVerification}
              className={`flex items-center gap-3 p-3 rounded-xl opacity-75 cursor-pointer hover:opacity-100 transition-opacity ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#dae2ff] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] font-bold flex items-center justify-center shrink-0">
                <span className="text-xs">3</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">Mobile Verification</div>
                <div className="text-[11px] text-[#404850] dark:text-[#c0c7d1] truncate">Up next</div>
              </div>
            </div>

            {/* Step 4 */}
            <div
              onClick={onProceedToLicenseVerification}
              className={`flex items-center gap-3 p-3 rounded-xl opacity-75 cursor-pointer hover:opacity-100 transition-opacity ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#dae2ff] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] font-bold flex items-center justify-center shrink-0">
                <span className="text-xs">4</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">RN Credentialing</div>
                <div className="text-[11px] text-[#404850] dark:text-[#c0c7d1] truncate">License lookup</div>
              </div>
            </div>

            {/* Step 5 */}
            <div
              className={`flex items-center gap-3 p-3 rounded-xl opacity-75 col-span-2 sm:col-span-1 ${
                isNightShiftMode ? 'bg-[#15233a]' : 'bg-[#f2f3ff]'
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-[#dae2ff] dark:bg-[#182840] text-[#404850] dark:text-[#c0c7d1] font-bold flex items-center justify-center shrink-0">
                <span className="text-xs">5</span>
              </div>
              <div className="min-w-0">
                <div className="text-xs font-semibold truncate">Sanctuary Match</div>
                <div className="text-[11px] text-[#404850] dark:text-[#c0c7d1] truncate">Hospital proximity</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Two Column Main Body */}
      <section className="w-full py-12 lg:py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-start">
            {/* LEFT COLUMN: Clinical Trust & Security Insights */}
            <div className="lg:col-span-5 flex flex-col space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#cde5ff] text-[#001d32] dark:bg-[#005684]/40 dark:text-[#93ccff] w-fit">
                <span className="material-symbols-outlined text-[16px]">verified</span>
                <span className="text-xs font-bold uppercase tracking-wider">Safe Clinical Onboarding</span>
              </div>

              <div className="space-y-2">
                <span
                  className="text-[#745b0d] dark:text-[#E4C36D] text-[28px] block"
                  style={{ fontFamily:"'Kaushan Script', cursive" }}
                >
                  Rest Well. Heal Better.
                </span>
                <h1 className="text-2xl sm:text-3xl lg:text-[32px] font-bold tracking-tight leading-tight">
                  Confirm your hospital or personal email to activate your account.
                </h1>
                <p className="text-sm sm:text-base text-[#404850] dark:text-[#c0c7d1] leading-relaxed">
                  Instant verification ensures protected access to hospital-proximity suites, digital lock arrivals, and HIPAA-compliant contract guarantees.
                </p>
              </div>

              {/* Feature Cards */}
              <div className="space-y-3.5 pt-2">
                <div
                  className={`p-4 rounded-2xl shadow-xs flex items-start gap-4 transition-all duration-200 ease-in-out hover:translate-y-[-2px] border ${
                    isNightShiftMode
                      ? 'bg-[#111e33] border-[#233550]'
                      : 'bg-white border-[rgba(11,37,89,0.06)]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eaedff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">domain_verification</span>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-[#001848] dark:text-white">
                      Institutional Domain Matching
                    </h2>
                    <p className="text-xs text-[#404850] dark:text-[#c0c7d1] leading-normal">
                      Auto-detects health system affiliations (Duke Health, UNC Health, Atrium, Kaiser) to expedite license clearance.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl shadow-xs flex items-start gap-4 transition-all duration-200 ease-in-out hover:translate-y-[-2px] border ${
                    isNightShiftMode
                      ? 'bg-[#111e33] border-[#233550]'
                      : 'bg-white border-[rgba(11,37,89,0.06)]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eaedff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">alarm_on</span>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-[#001848] dark:text-white">
                      Fast-Track Reservation Holds
                    </h2>
                    <p className="text-xs text-[#404850] dark:text-[#c0c7d1] leading-normal">
                      Your housing request holds remain active for 24 hours once your inbox verification is confirmed.
                    </p>
                  </div>
                </div>

                <div
                  className={`p-4 rounded-2xl shadow-xs flex items-start gap-4 transition-all duration-200 ease-in-out hover:translate-y-[-2px] border ${
                    isNightShiftMode
                      ? 'bg-[#111e33] border-[#233550]'
                      : 'bg-white border-[rgba(11,37,89,0.06)]'
                  }`}
                >
                  <div className="w-10 h-10 rounded-xl bg-[#eaedff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff] flex items-center justify-center shrink-0">
                    <span className="material-symbols-outlined text-[22px]">mark_email_read</span>
                  </div>
                  <div className="space-y-1">
                    <h2 className="text-sm font-bold text-[#001848] dark:text-white">
                      Postmark High-Deliverability
                    </h2>
                    <p className="text-xs text-[#404850] dark:text-[#c0c7d1] leading-normal">
                      Routed via Postmark transactional infrastructure ensuring no missed shift alerts or arrival gate codes.
                    </p>
                  </div>
                </div>
              </div>

              {/* Nurse Testimonial Card */}
              <div
                className={`p-5 rounded-2xl relative overflow-hidden shadow-xs border ${
                  isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#e2e7ff]/40 border-[rgba(11,37,89,0.06)]'
                }`}
              >
                <div className="flex items-center gap-3 mb-3">
                  <div className="w-11 h-11 rounded-full bg-[#0a6fa8] text-white flex items-center justify-center font-bold text-sm shrink-0">
                    ER
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-[#001848] dark:text-white leading-snug">
                      Elena Rostova, MSN, CRNA
                    </h3>
                    <p className="text-[12px] text-[#005684] dark:text-[#93ccff] font-medium leading-tight">
                      UNC Hospitals Chapel Hill • 13-Wk Assignment
                    </p>
                  </div>
                </div>
                <p className="text-xs sm:text-sm text-[#404850] dark:text-[#c0c7d1] italic leading-relaxed">
                  “I verified my email right after signing my contract and had my hospital proximity search unlocked within sixty seconds.”
                </p>
              </div>

              {/* Bottom Trust Badges */}
              <div className="pt-2 flex flex-wrap items-center gap-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111e33] text-[#404850] dark:text-[#c0c7d1] text-xs font-medium shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <span className="material-symbols-outlined text-[#195b4c] dark:text-[#aff0db] text-[18px]">verified</span>
                  <span>Postmark Transactional Verified</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111e33] text-[#404850] dark:text-[#c0c7d1] text-xs font-medium shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <span className="material-symbols-outlined text-[#005684] dark:text-[#93ccff] text-[18px]">lock</span>
                  <span>256-Bit TLS 1.3</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111e33] text-[#404850] dark:text-[#c0c7d1] text-xs font-medium shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <span className="material-symbols-outlined text-[#195b4c] dark:text-[#aff0db] text-[18px]">health_and_safety</span>
                  <span>HIPAA Data Safe</span>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white dark:bg-[#111e33] text-[#404850] dark:text-[#c0c7d1] text-xs font-medium shadow-xs border border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
                  <span className="material-symbols-outlined text-[#005684] dark:text-[#93ccff] text-[18px]">shield</span>
                  <span>DMARC / SPF Secured</span>
                </div>
              </div>
            </div>

            {/* RIGHT COLUMN: Verification Interactive Console */}
            <div className="lg:col-span-7">
              <div
                className={`rounded-3xl p-8 sm:p-10 shadow-md space-y-8 border ${
                  isNightShiftMode
                    ? 'bg-[#111e33] border-[#233550]'
                    : 'bg-white border-[rgba(11,37,89,0.08)]'
                }`}
              >
                {/* Top Card Header Meta */}
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <span className="px-3 py-1 rounded-full bg-[#eaedff] dark:bg-[#182840] text-[#001848] dark:text-white text-xs font-semibold">
                    Step 1 of 4 • Email Delivery via Postmark
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdc84]/30 text-[#745b0d] dark:text-[#ffdc84] text-xs font-bold">
                    <span className="material-symbols-outlined text-[16px]">bolt</span>
                    <span>Fast Delivery Guarantee</span>
                  </span>
                </div>

                {/* Envelope Dynamic Graphic */}
                <div className="flex flex-col items-center justify-center py-2 text-center">
                  <div className="relative flex items-center justify-center mb-4">
                    {/* Glowing ambient pulse ring */}
                    <div className="absolute w-28 h-28 rounded-full bg-[#cde5ff] dark:bg-[#005684]/30 opacity-50" />
                    <div className="relative w-20 h-20 rounded-2xl bg-[#0a6fa8] text-white flex items-center justify-center shadow-lg">
                      <span className="material-symbols-outlined text-[40px]">mail</span>
                      <div className="absolute -top-1.5 -right-1.5 w-7 h-7 rounded-full bg-[#195b4c] text-white flex items-center justify-center shadow-md">
                        <span className="material-symbols-outlined text-[16px] font-bold">check</span>
                      </div>
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold text-[#001848] dark:text-white">
                    Check your inbox
                  </h2>
                  <p className="text-sm text-[#404850] dark:text-[#c0c7d1] max-w-md mt-1">
                    We sent a 1-click magic activation link and a 6-digit confirmation PIN to your address.
                  </p>
                </div>

                {/* Target Recipient Pill Card */}
                <div
                  className={`p-4 rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs border ${
                    isNightShiftMode ? 'bg-[#182840] border-[#233550]' : 'bg-[#f2f3ff] border-[rgba(11,37,89,0.06)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-white dark:bg-[#111e33] text-[#005684] dark:text-[#93ccff] flex items-center justify-center shadow-xs shrink-0">
                      <span className="material-symbols-outlined text-[20px]">alternate_email</span>
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-sm sm:text-base font-bold text-[#001848] dark:text-white truncate">
                          {email}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-[#367464]/15 text-[#195b4c] dark:text-[#aff0db] text-[11px] font-bold">
                          <span className="material-symbols-outlined text-[13px]">check_circle</span>
                          <span>Verified Health System Match</span>
                        </span>
                      </div>
                      <span className="text-xs text-[#404850] dark:text-[#c0c7d1]">
                        Duke University Health System Clinician
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={handleEditEmail}
                    className="inline-flex items-center gap-1.5 text-[#005684] dark:text-[#93ccff] text-xs font-bold shrink-0 self-start sm:self-center transition-colors cursor-pointer group"
                  >
                    <span className="material-symbols-outlined text-[16px]">edit</span>
                    <span className="group-hover:underline">Edit email</span>
                  </button>
                </div>

                {/* 6-Digit PIN Activation Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-bold text-[#001848] dark:text-white">
                      Or enter 6-digit activation code
                    </label>
                    <span className="text-xs text-[#404850] dark:text-[#c0c7d1]">Expires in 15:00</span>
                  </div>

                  {resendNotification && (
                    <div className="p-2.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-800 dark:text-emerald-300 flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      <span>{resendNotification}</span>
                    </div>
                  )}

                  {/* 6 PIN inputs */}
                  <div className="grid grid-cols-6 gap-2 sm:gap-3.5" id="pin-container">
                    {pin.map((digit, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { pinInputRefs.current[idx] = el; }}
                        aria-label={`Digit ${idx+ 1}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handlePinChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`h-14 sm:h-16 text-center text-2xl font-bold rounded-xl focus:outline-none transition-all duration-200 ease-in-out shadow-xs ${
                          isNightShiftMode
                            ? 'bg-[#182840] text-white focus:bg-[#1f3350] focus:ring-2 focus:ring-[#3E9AD1]'
                            : 'bg-[#f2f3ff] text-[#001848] focus:bg-white focus:ring-2 focus:ring-[#005684]'
                        }`}
                      />
                    ))}
                  </div>

                  {/* Verification Confirmation Button */}
                  <button
                    type="button"
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className={`w-full py-4 px-8 rounded-full text-base font-bold flex items-center justify-center gap-2 shadow-lg transition-all duration-200 ease-in-out duration-200 cursor-pointer ${
                      isVerified
                        ? 'bg-[#195b4c] text-white'
                        : 'bg-[#0a6fa8] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white active:scale-[0.99]'
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <span className="material-symbols-outlined text-[20px] animate-spin">sync</span>
                        <span>Verifying Email...</span>
                      </>
                    ) : isVerified ? (
                      <>
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        <span>Verified! Routing to Mobile Verification...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify Email &amp; Continue</span>
                        <span className="material-symbols-outlined text-[20px]">arrow_forward</span>
                      </>
                    )}
                  </button>
                </div>

                {/* Resend & Webmail Shortcuts */}
                <div
                  className={`p-5 rounded-2xl space-y-4 border ${
                    isNightShiftMode ? 'bg-[#182840] border-[#233550]' : 'bg-[#f2f3ff] border-[rgba(11,37,89,0.06)]'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <span className="material-symbols-outlined text-[#005684] dark:text-[#93ccff] text-[20px]">
                        schedule
                      </span>
                      <div>
                        <div className="text-xs font-bold text-[#001848] dark:text-white">
                          Didn't receive the email?
                        </div>
                        <div className="text-xs text-[#404850] dark:text-[#c0c7d1]">
                          Resend available in{' '}
                          <span className="font-bold text-[#005684] dark:text-[#93ccff]">
                            {formattedCountdown}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={!canResend}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-colors cursor-pointer ${
                        canResend
                          ? 'bg-[#0a6fa8] text-white hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684]'
                          : 'bg-[#dae2ff] dark:bg-[#152438] text-[#404850] dark:text-[#c0c7d1] opacity-60 cursor-not-allowed'
                      }`}
                    >
                      Resend Email
                    </button>
                  </div>

                  {/* Fast Webmail Provider Launchers */}
                  <div className="pt-3 flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#404850] dark:text-[#c0c7d1]">Quick jump:</span>
                    <a
                      href="https://mail.google.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#111e33] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff] text-[#001848] dark:text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px] text-red-500">mail</span>
                      <span>Open Gmail</span>
                    </a>
                    <a
                      href="https://outlook.office.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#111e33] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff] text-[#001848] dark:text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#005684]">markunread</span>
                      <span>Open Outlook</span>
                    </a>
                    <a
                      href="https://mail.yahoo.com"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white dark:bg-[#111e33] hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff] text-[#001848] dark:text-white text-xs font-semibold transition-colors shadow-xs"
                    >
                      <span className="material-symbols-outlined text-[16px] text-[#745b0d]">mail_outline</span>
                      <span>Open Yahoo</span>
                    </a>
                  </div>
                </div>

                {/* Institutional Quarantine / Spam Hint */}
                <div className="p-4 rounded-2xl bg-[#ffdc84]/20 border border-[#ffdc84]/40 flex items-start gap-3 text-[#795f12] dark:text-[#ffdc84]">
                  <span className="material-symbols-outlined text-[22px] shrink-0 mt-0.5">info</span>
                  <div className="space-y-0.5">
                    <div className="text-xs font-bold">
                      Using a hospital network email (@duke.edu, @unchealth.org)?
                    </div>
                    <p className="text-xs leading-relaxed opacity-90">
                      Institutional firewall filters can occasionally stage transactional security tokens in the “Other” tab or institutional quarantine review.
                    </p>
                  </div>
                </div>

                {/* Help / Switch to SMS Option */}
                <div className="text-center pt-2">
                  <p className="text-xs text-[#404850] dark:text-[#c0c7d1]">
                    Having trouble? Contact{' '}
                    <span className="font-bold text-[#005684] dark:text-[#93ccff] hover:underline cursor-pointer">
                      Clinician Support Team (1-800-RN-PILLOW)
                    </span>{' '}
                    or{' '}
                    <button
                      type="button"
                      onClick={onProceedToPhoneVerification}
                      className="font-bold text-[#005684] dark:text-[#93ccff] hover:underline cursor-pointer"
                    >
                      switch to SMS verification
                    </button>
                    .
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Guarantee Banner */}
      <section className="w-full bg-[#ffdc84]/30 dark:bg-[#745b0d]/20 py-8 my-8 shadow-xs border-y border-[#ffdc84]/40">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-full bg-white dark:bg-[#111e33] text-[#745b0d] dark:text-[#ffdc84] flex items-center justify-center shadow-md shrink-0">
              <span className="material-symbols-outlined text-[28px]">bedtime</span>
            </div>
            <div className="space-y-0.5">
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-[#001848] dark:text-white">
                  Night Shift Sleep Sanctuary Guarantee
                </h2>
                <span className="material-symbols-outlined text-[#745b0d] dark:text-[#ffdc84] text-[18px]">
                  verified
                </span>
              </div>
              <p className="text-xs sm:text-sm text-[#404850] dark:text-[#c0c7d1] max-w-2xl">
                Our properties enforce verified daytime quiet hours (08:00 – 17:00) with 100% blackout curtains standard in every clinical suite.
              </p>
            </div>
          </div>
          <div className="shrink-0">
            <span
              className="text-[#745b0d] dark:text-[#ffdc84] text-[26px]"
              style={{ fontFamily:"'Kaushan Script', cursive" }}
            >
              Rest Well. Heal Better.
            </span>
          </div>
        </div>
      </section>
    </div>
  );
};
