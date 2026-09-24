import React, { useState, useEffect, useRef } from 'react';

interface TwilioPhoneOtpViewProps {
  isNightShiftMode: boolean;
  initialPhone?: string;
  onProceedToLicenseVerification: () => void;
  onBackToEmailVerification?: () => void;
  onBackToEmail?: () => void;
}

export const TwilioPhoneOtpView: React.FC<TwilioPhoneOtpViewProps> = ({
  isNightShiftMode,
  initialPhone,
  onProceedToLicenseVerification,
  onBackToEmailVerification,
  onBackToEmail,
}) => {
  const [phoneNumber, setPhoneNumber] = useState(initialPhone || '+1 (919) 555-0198');
  const [otp, setOtp] = useState(['8', '4', '2', '1', '', '']);
  const [timeLeft, setTimeLeft] = useState(42);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isVerified, setIsVerified] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Circular timer
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    }
  }, [timeLeft]);

  const handleOtpChange = (index: number, val: string) => {
    const cleanVal = val.replace(/[^0-9]/g, '');
    const newOtp = [...otp];
    newOtp[index] = cleanVal ? cleanVal[cleanVal.length - 1] : '';
    setOtp(newOtp);

    if (cleanVal && index < 5) {
      inputRefs.current[index+ 1]?.focus();
      inputRefs.current[index+ 1]?.select();
    }
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleEditPhone = () => {
    const newPhone = prompt('Enter your updated mobile number:', phoneNumber);
    if (newPhone && newPhone.length >= 10) {
      setPhoneNumber(newPhone.trim());
    }
  };

  const handleResend = () => {
    if (timeLeft > 0) return;
    setTimeLeft(60);
  };

  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    setIsVerifying(true);
    setTimeout(() => {
      setIsVerifying(false);
      setIsVerified(true);
      setTimeout(() => {
        onProceedToLicenseVerification();
      }, 1000);
    }, 1200);
  };

  const timerDashOffset = 100 - (timeLeft / 42) * 100;
  const formattedCountdown = `00:${timeLeft < 10 ? `0${timeLeft}` : timeLeft}`;

  return (
    <div
      className={`w-full min-h-screen transition-colors ${
        isNightShiftMode ? 'bg-[#08101C] text-[#E6ECF7]' : 'bg-[#faf8ff] text-[#001848]'
      }`}
    >
      <div className="relative w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 py-8 lg:py-14">
        {/* Subtle decorative ambient orbs */}
        <div className="absolute top-12 left-1/4 w-96 h-96 bg-[#cde5ff]/30 dark:bg-[#005684]/20 rounded-full blur-3xl pointer-events-none -z-10" />
        <div className="absolute bottom-10 right-10 w-80 h-80 bg-[#aff0db]/20 dark:bg-[#195b4c]/10 rounded-full blur-3xl pointer-events-none -z-10" />

        {/* Step Progress Ribbon */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-6">
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-[#005684] text-white font-bold text-sm shadow-xs">
              2
            </span>
            <div>
              <div className="text-xs uppercase tracking-wider text-[#404850] dark:text-[#c0c7d1]">
                Clinical Onboarding Flow
              </div>
              <div className="text-lg sm:text-xl font-bold text-[#001848] dark:text-white">
                Safe Clinical Verification
              </div>
            </div>
          </div>

          {/* Stepper Pill Track */}
          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-full shadow-xs border ${
              isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#f2f3ff] border-[rgba(11,37,89,0.06)]'
            }`}
          >
            <button
              type="button"
              onClick={onBackToEmailVerification}
              className="flex items-center gap-1.5 text-[#195b4c] dark:text-[#aff0db] cursor-pointer group"
            >
              <span className="material-symbols-outlined text-[18px]">check_circle</span>
              <span className="text-xs font-semibold group-hover:underline">Account</span>
            </button>
            <span className="w-4 h-0.5 bg-[#195b4c] dark:bg-[#aff0db]" />
            <div className="flex items-center gap-1.5 text-[#005684] dark:text-[#93ccff] font-bold">
              <span className="inline-flex w-5 h-5 rounded-full bg-[#005684] text-white items-center justify-center text-[11px] font-bold">
                2
              </span>
              <span className="text-xs">Twilio Phone OTP</span>
            </div>
            <span className="w-4 h-0.5 bg-[#c0c7d1] dark:bg-[#324560]" />
            <button
              type="button"
              onClick={onProceedToLicenseVerification}
              className="flex items-center gap-1.5 opacity-60 hover:opacity-100 transition-opacity cursor-pointer"
            >
              <span className="inline-flex w-5 h-5 rounded-full bg-[#dae2ff] dark:bg-[#182840] text-[#001848] dark:text-white items-center justify-center text-[11px]">
                3
              </span>
              <span className="text-xs font-medium">RN License</span>
            </button>
            <span className="w-4 h-0.5 bg-[#c0c7d1] dark:bg-[#324560]" />
            <div className="flex items-center gap-1.5 opacity-60">
              <span className="inline-flex w-5 h-5 rounded-full bg-[#dae2ff] dark:bg-[#182840] text-[#001848] dark:text-white items-center justify-center text-[11px]">
                4
              </span>
              <span className="text-xs font-medium">Sanctuary Match</span>
            </div>
          </div>
        </div>

        {/* Main 2-Column Bento Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* LEFT COLUMN: Trust Context & Shift Critical Reasons */}
          <div className="lg:col-span-6 flex flex-col gap-6">
            {/* Sanctuary Intro Card */}
            <div
              className={`p-8 lg:p-10 rounded-3xl shadow-sm relative overflow-hidden border ${
                isNightShiftMode ? 'bg-[#111e33] border-[#233550]' : 'bg-white border-[rgba(11,37,89,0.06)]'
              }`}
            >
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-[#ffdc84]/30 text-[#745b0d] dark:text-[#ffdc84] mb-4">
                <span className="material-symbols-outlined text-[16px]">verified_user</span>
                <span className="text-xs font-semibold tracking-wide uppercase">Safe Clinical Onboarding</span>
              </div>
              <div
                className="text-[#745b0d] dark:text-[#E4C36D] text-[24px] mb-1"
                style={{ fontFamily:"'Kaushan Script', cursive" }}
              >
                Rest Well. Heal Better.
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight mb-3">
                Verify your mobile number for shift-critical alerts.
              </h1>
              <p className="text-sm text-[#404850] dark:text-[#c0c7d1] mb-8 leading-relaxed">
                Your housing check-in and emergency support tie directly to real-time hospital rotations. We authenticate your device so you never arrive at a locked sanctuary before a 12-hour shift.
              </p>

              {/* 3 Shift-Critical Pillars */}
              <div className="space-y-4">
                {/* Item 1 */}
                <div
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-colors ${
                    isNightShiftMode ? 'bg-[#182840]' : 'bg-[#f2f3ff]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#005684] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[22px]">pin</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#001848] dark:text-white">
                      Smart-Lock Digital Codes
                    </div>
                    <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-0.5 leading-snug">
                      Automatic front entrance &amp; suite PIN delivery 3 hours before 07:00 or 19:00 shift check-in times.
                    </p>
                  </div>
                </div>

                {/* Item 2 */}
                <div
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-colors ${
                    isNightShiftMode ? 'bg-[#182840]' : 'bg-[#f2f3ff]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#195b4c] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[22px]">crisis_alert</span>
                  </div>
                  <div className="flex-1">
                    <div className="text-sm font-bold text-[#001848] dark:text-white">
                      Real-Time Hospital Shift Alerts
                    </div>
                    <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-0.5 leading-snug">
                      Direct notifications if an assignment start date pivots or an urgent contract extension is authorized.
                    </p>
                  </div>
                </div>

                {/* Item 3 */}
                <div
                  className={`flex items-start gap-4 p-4 rounded-2xl transition-colors ${
                    isNightShiftMode ? 'bg-[#182840]' : 'bg-[#f2f3ff]'
                  }`}
                >
                  <div className="w-11 h-11 rounded-xl bg-[#ffdc84] text-[#745b0d] flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[22px]">headset_mic</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <div className="text-sm font-bold text-[#001848] dark:text-white">
                        24/7 Clinician Support Desk
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full bg-[#eaedff] dark:bg-[#152438] text-[#005684] dark:text-[#93ccff] font-bold">
                        1-800-RN-PILLOW
                      </span>
                    </div>
                    <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-0.5 leading-snug">
                      SMS triage with registered nurse navigators who understand unit handoffs and day-sleeper quiet hours.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Clinician Testimonial Bento */}
            <div
              className={`p-6 rounded-2xl shadow-xs flex flex-col sm:flex-row items-center gap-5 border ${
                isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#e2e7ff]/30 border-[rgba(11,37,89,0.06)]'
              }`}
            >
              <div className="relative shrink-0">
                <img
                  className="w-16 h-16 rounded-full object-cover shadow-md"
                  alt="Sarah Jenkins BSN RN"
                  referrerPolicy="no-referrer"
                  src="https://images.unsplash.com/photo-1594824813582-7d2d31215b2e?auto=format&fit=crop&w=200&q=80"
                />
                <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-[#195b4c] text-white flex items-center justify-center shadow-xs">
                  <span className="material-symbols-outlined text-[14px]">bed</span>
                </div>
              </div>
              <div className="flex-1 text-center sm:text-left">
                <p className="text-xs sm:text-sm text-[#001848] dark:text-white italic leading-snug mb-2">"Getting my keyless door code via SMS before landing in Durham for my night shift took all the anxiety away. Pure peaceful arrival."
                </p>
                <div className="flex items-center justify-center sm:justify-start gap-2">
                  <span className="text-xs font-bold text-[#001848] dark:text-white">Sarah Jenkins, BSN, RN</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-[#c0c7d1]" />
                  <span className="text-xs text-[#404850] dark:text-[#c0c7d1]">Duke University Hospital</span>
                </div>
              </div>
            </div>

            {/* Trust Credentials Strip */}
            <div className="grid grid-cols-3 gap-3">
              <div
                className={`p-3.5 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 border ${
                  isNightShiftMode ? 'bg-[#111e33] border-[#233550]' : 'bg-white border-[rgba(11,37,89,0.06)]'
                }`}
              >
                <span className="material-symbols-outlined text-[#005684] text-[22px]">verified</span>
                <span className="text-xs font-bold text-[#001848] dark:text-white leading-tight">
                  Twilio Carrier Shield
                </span>
                <span className="text-[11px] text-[#404850] dark:text-[#c0c7d1]">A2P 10DLC Route</span>
              </div>
              <div
                className={`p-3.5 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 border ${
                  isNightShiftMode ? 'bg-[#111e33] border-[#233550]' : 'bg-white border-[rgba(11,37,89,0.06)]'
                }`}
              >
                <span className="material-symbols-outlined text-[#195b4c] dark:text-[#aff0db] text-[22px]">
                  lock
                </span>
                <span className="text-xs font-bold text-[#001848] dark:text-white leading-tight">
                  256-Bit Encrypted
                </span>
                <span className="text-[11px] text-[#404850] dark:text-[#c0c7d1]">HIPAA-Compliant</span>
              </div>
              <div
                className={`p-3.5 rounded-xl text-center flex flex-col items-center justify-center gap-1.5 border ${
                  isNightShiftMode ? 'bg-[#111e33] border-[#233550]' : 'bg-white border-[rgba(11,37,89,0.06)]'
                }`}
              >
                <span className="material-symbols-outlined text-[#745b0d] dark:text-[#ffdc84] text-[22px]">
                  phonelink_ring
                </span>
                <span className="text-xs font-bold text-[#001848] dark:text-white leading-tight">
                  Robocall Protected
                </span>
                <span className="text-[11px] text-[#404850] dark:text-[#c0c7d1]">Zero Spam Delivery</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: Interactive Twilio SMS OTP Card */}
          <div className="lg:col-span-6">
            <div
              className={`p-8 lg:p-10 rounded-3xl shadow-md relative border ${
                isNightShiftMode ? 'bg-[#111e33] border-[#233550]' : 'bg-white border-[rgba(11,37,89,0.08)]'
              }`}
            >
              {/* Top Tag & Security Status */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="inline-flex items-center gap-1.5 bg-[#cde5ff] text-[#001d32] dark:bg-[#005684]/40 dark:text-[#93ccff] px-3 py-1 rounded-full">
                  <span className="w-2 h-2 rounded-full bg-[#005684]" />
                  <span className="text-xs font-bold">Step 2 of 4 • SMS Delivery</span>
                </div>
                <div className="flex items-center gap-1 text-xs text-[#404850] dark:text-[#c0c7d1]">
                  <span className="material-symbols-outlined text-[#195b4c] dark:text-[#aff0db] text-[18px]">
                    shield_person
                  </span>
                  <span>Twilio Verify API</span>
                </div>
              </div>

              {/* Main Action Heading */}
              <h2 className="text-xl sm:text-2xl font-bold text-[#001848] dark:text-white mb-2">
                Enter 6-digit verification code
              </h2>
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-[#404850] dark:text-[#c0c7d1] mb-8">
                <span>We sent a clinical verification code to</span>
                <span className="font-bold text-[#001848] dark:text-white px-2.5 py-0.5 rounded-md bg-[#f2f3ff] dark:bg-[#182840] inline-flex items-center gap-1">
                  <span className="material-symbols-outlined text-[16px] text-[#005684] dark:text-[#93ccff]">
                    smartphone
                  </span>
                  {phoneNumber}
                </span>
                <button
                  type="button"
                  onClick={handleEditPhone}
                  className="text-[#005684] dark:text-[#93ccff] hover:underline font-semibold ml-1 cursor-pointer"
                >
                  Edit number
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleVerify} className="flex flex-col gap-6">
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <label className="text-xs font-bold text-[#001848] dark:text-white uppercase tracking-wider">
                      Secure OTP Token
                    </label>
                    <span className="text-xs text-[#404850] dark:text-[#c0c7d1] flex items-center gap-1">
                      <span className="material-symbols-outlined text-[14px]">lock_clock</span>
                      <span>Expires in 10 minutes</span>
                    </span>
                  </div>

                  {/* 6 Cell Inputs */}
                  <div className="flex items-center justify-between gap-2 sm:gap-3">
                    {otp.map((val, idx) => (
                      <input
                        key={idx}
                        ref={(el) => { inputRefs.current[idx] = el; }}
                        type="text"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        maxLength={1}
                        value={val}
                        onChange={(e) => handleOtpChange(idx, e.target.value)}
                        onKeyDown={(e) => handleKeyDown(idx, e)}
                        className={`w-12 sm:w-16 h-14 sm:h-16 text-center text-2xl font-bold rounded-2xl shadow-xs focus:outline-none transition-all duration-200 ease-in-out ${
                          isNightShiftMode
                            ? 'bg-[#182840] text-white focus:bg-[#1f3350] focus:ring-2 focus:ring-[#3E9AD1]'
                            : 'bg-[#f2f3ff] text-[#001848] focus:bg-white focus:ring-2 focus:ring-[#005684]'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {/* Timer and Resend Actions */}
                <div
                  className={`flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border ${
                    isNightShiftMode ? 'bg-[#182840] border-[#233550]' : 'bg-[#f2f3ff] border-[rgba(11,37,89,0.06)]'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {/* Circular Countdown SVG */}
                    <div className="relative w-9 h-9 flex items-center justify-center shrink-0">
                      <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
                        <path
                          className="text-[#dae2ff] dark:text-[#233550]"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="3"
                        />
                        <path
                          className="text-[#005684] dark:text-[#3E9AD1]"
                          d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                          fill="none"
                          stroke="currentColor"
                          strokeDasharray="100, 100"
                          strokeDashoffset={timerDashOffset}
                          strokeLinecap="round"
                          strokeWidth="3"
                        />
                      </svg>
                      <span className="material-symbols-outlined text-[16px] text-[#005684] dark:text-[#3E9AD1] absolute">
                        timer
                      </span>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-[#001848] dark:text-white">
                        Resend available in
                      </div>
                      <div className="text-base font-bold text-[#005684] dark:text-[#93ccff] tabular-nums">
                        {timeLeft > 0 ? formattedCountdown : 'Ready'}
                      </div>
                    </div>
                  </div>

                  {/* Action Links */}
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={handleResend}
                      disabled={timeLeft > 0}
                      className={`px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200 ease-in-out cursor-pointer ${
                        timeLeft === 0
                          ? 'bg-[#005684] text-white hover:bg-[#0a6fa8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0a6fa8]'
                          : 'bg-[#dae2ff] dark:bg-[#152438] text-[#404850] dark:text-[#c0c7d1] cursor-not-allowed opacity-60'
                      }`}
                    >
                      Resend SMS
                    </button>
                    <button
                      type="button"
                      className="px-3 py-2 text-[#005684] dark:text-[#93ccff] text-xs font-semibold hover:bg-[#eaedff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#eaedff] dark:hover:bg-[#1f3350] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1f3350] rounded-full transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">call</span>
                      <span>Call me instead</span>
                    </button>
                  </div>
                </div>

                {/* Carrier Diagnostic Box */}
                <div
                  className={`p-3.5 rounded-xl flex items-start gap-3 border ${
                    isNightShiftMode ? 'bg-[#15233a] border-[#233550]' : 'bg-[#e2e7ff]/30 border-[rgba(11,37,89,0.06)]'
                  }`}
                >
                  <span className="material-symbols-outlined text-[#745b0d] dark:text-[#ffdc84] text-[20px] shrink-0 mt-0.5">
                    info
                  </span>
                  <p className="text-xs text-[#404850] dark:text-[#c0c7d1] leading-snug">
                    Didn't receive a message? Check that shortcode SMS messages are not muted by your cellular carrier or in"Do Not Disturb" focus during daytime sleep.
                  </p>
                </div>

                {/* Primary CTA Button */}
                <div className="space-y-3 pt-2">
                  <button
                    type="submit"
                    disabled={isVerifying}
                    className={`w-full py-4 px-8 rounded-full text-base font-bold shadow-lg flex items-center justify-center gap-2 group transition-all duration-200 ease-in-out cursor-pointer ${
                      isVerified
                        ? 'bg-[#195b4c] text-white'
                        : 'bg-[#005684] hover:bg-[#0a6fa8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0a6fa8] text-white'
                    }`}
                  >
                    {isVerifying ? (
                      <>
                        <span className="material-symbols-outlined animate-spin text-[20px]">sync</span>
                        <span>Authenticating Credentials...</span>
                      </>
                    ) : isVerified ? (
                      <>
                        <span className="material-symbols-outlined text-[20px]">check_circle</span>
                        <span>Number Confirmed! Redirecting to RN License...</span>
                      </>
                    ) : (
                      <>
                        <span>Verify &amp; Continue to Credentialing</span>
                        <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-[20px]">
                          arrow_forward
                        </span>
                      </>
                    )}
                  </button>

                  <div className="flex items-center justify-center gap-4 pt-1">
                    <button
                      type="button"
                      onClick={onBackToEmailVerification}
                      className="text-xs text-[#404850] dark:text-[#c0c7d1] hover:text-[#005684] focus-visible:text-[#005684] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">lock_reset</span>
                      <span>Use alternate verification method</span>
                    </button>
                    <span className="w-1 h-1 rounded-full bg-[#c0c7d1]" />
                    <button
                      type="button"
                      className="text-xs text-[#404850] dark:text-[#c0c7d1] hover:text-[#005684] focus-visible:text-[#005684] transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">help</span>
                      <span>Shift Support Desk</span>
                    </button>
                  </div>
                </div>

                {/* Security Trust Subfooter */}
                <div className="pt-6 mt-2 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                  <div className="flex items-center gap-1.5 text-xs text-[#404850] dark:text-[#c0c7d1]">
                    <span className="material-symbols-outlined text-[14px] text-[#195b4c] dark:text-[#aff0db]">
                      check_circle
                    </span>
                    <span>Twilio Verified A2P 10DLC Carrier Protocol</span>
                  </div>
                  <span className="text-xs font-mono text-[#404850] dark:text-[#c0c7d1]">
                    TLS 1.3 • Encrypted Transit
                  </span>
                </div>
              </form>
            </div>
          </div>
        </div>

        {/* Bottom Reassurance Banner: Night Shift Guarantee */}
        <div
          className={`mt-12 p-6 rounded-3xl shadow-xs flex flex-col md:flex-row items-center justify-between gap-6 border ${
            isNightShiftMode ? 'bg-[#111e33] border-[#233550]' : 'bg-white border-[rgba(11,37,89,0.06)]'
          }`}
        >
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-[#ffdc84]/40 text-[#745b0d] dark:text-[#ffdc84] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-[28px]">bedtime</span>
            </div>
            <div>
              <div className="text-base font-bold text-[#001848] dark:text-white">
                Night Shift Sleep Sanctuary Guarantee
              </div>
              <div className="text-xs sm:text-sm text-[#404850] dark:text-[#c0c7d1]">
                Our properties enforce verified daytime quiet hours (08:00 - 17:00) with 100% blackout curtains standard.
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <span
              className="text-[#745b0d] dark:text-[#E4C36D] text-[22px]"
              style={{ fontFamily:"'Kaushan Script', cursive" }}
            >
              Rest Well. Heal Better.
            </span>
            <div className="w-10 h-10 rounded-full bg-[#eaedff] dark:bg-[#182840] flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
              <span className="material-symbols-outlined text-[20px]">local_hospital</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
