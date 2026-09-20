import React, { useState } from 'react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  isNightShiftMode: boolean;
  onAuthenticated: (role: UserRole, name: string) => void;
  onOpenEmailVerification?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  isNightShiftMode,
  onAuthenticated,
  onOpenEmailVerification,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>('nurse');

  // Form states
  const [fullName, setFullName] = useState('Sarah Jenkins');
  const [specialty, setSpecialty] = useState('rn');
  const [email, setEmail] = useState('sarah.jenkins@alumni.duke.edu');
  const [phone, setPhone] = useState('+1 (919) 555-0198');
  const [password, setPassword] = useState('NurseHero2024!#');
  const [showPassword, setShowPassword] = useState(false);
  const [quietHoursAgreed, setQuietHoursAgreed] = useState(true);
  const [rememberDevice, setRememberDevice] = useState(true);

  // Password strength
  const calculateStrength = (pwd: string) => {
    let score = 0;
    if (pwd.length >= 8) score++;
    if (/[A-Z]/.test(pwd)) score++;
    if (/[0-9]/.test(pwd)) score++;
    if (/[^A-Za-z0-9]/.test(pwd)) score++;
    return score;
  };

  const strengthScore = calculateStrength(password);

  if (!isOpen) return null;

  const handleSignupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!quietHoursAgreed) return;
    onAuthenticated(role, fullName || 'Sarah Jenkins');
    if (onOpenEmailVerification) {
      onOpenEmailVerification();
    }
    onClose();
  };

  const handleSigninSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAuthenticated(role, fullName || 'Sarah Jenkins');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/65 backdrop-blur-xs overflow-y-auto">
      <div
        className={`w-full max-w-2xl my-8 rounded-3xl p-6 sm:p-8 shadow-2xl relative border ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
            : 'bg-white border-[rgba(11,37,89,0.1)] text-[#001848]'
        }`}
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          type="button"
          aria-label="Close modal"
          className="absolute top-5 right-5 w-8 h-8 rounded-full bg-black/5 dark:bg-white/10 flex items-center justify-center text-gray-500 hover:bg-black/10 cursor-pointer"
        >
          <span className="material-symbols-outlined text-lg">close</span>
        </button>

        {/* Mode Switcher */}
        <div className="flex items-center justify-center gap-2 mb-6">
          <div className="p-1 rounded-full bg-[#eaedff] dark:bg-[#15233a] flex items-center">
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'signup'
                  ? 'bg-[#001848] dark:bg-[#005684] text-white shadow-xs'
                  : 'text-[#404850] dark:text-[#c0c7d1]'
              }`}
            >
              AU-01: Create Sanctuary Account
            </button>
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`px-5 py-2 rounded-full text-xs font-bold transition-all cursor-pointer ${
                mode === 'signin'
                  ? 'bg-[#001848] dark:bg-[#005684] text-white shadow-xs'
                  : 'text-[#404850] dark:text-[#c0c7d1]'
              }`}
            >
              AU-03: Sign In
            </button>
          </div>
        </div>

        {/* SCREEN AU-01: Role Selection & Safe Clinical Sign-Up */}
        {mode === 'signup' && (
          <div>
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#005684] dark:text-[#93ccff]">
                Safe Clinical Onboarding
              </span>
              <h2 className="text-2xl font-bold tracking-tight mt-1">Create your sanctuary account</h2>
              <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-1">
                Furnished housing curated for traveling healthcare professionals and verified hosts.
              </p>
            </div>

            {/* Role Selection Buttons */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setRole('nurse')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                  role === 'nurse'
                    ? 'border-[#005684] bg-[#0a6fa8] text-white shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">stethoscope</span>
                    Clinician / Medical Traveler
                  </span>
                  {role === 'nurse' && (
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  )}
                </div>
                <div className="text-[11px] opacity-90">RN, MD/DO, Allied Health • $0 Fees • 4–26 Wk Stays</div>
              </button>

              <button
                type="button"
                onClick={() => setRole('host')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all ${
                  role === 'host'
                    ? 'border-[#005684] bg-[#0a6fa8] text-white shadow-sm'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-white/5'
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[18px]">roofing</span>
                    Property Host / Owner
                  </span>
                  {role === 'host' && (
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  )}
                </div>
                <div className="text-[11px] opacity-90">Entire Home or Private Room • ~95% Net Payout</div>
              </button>
            </div>

            {/* Role Context Pill Banner */}
            <div className="p-3.5 rounded-2xl bg-[#aff0db]/25 border border-[#aff0db]/60 text-xs text-[#195b4c] dark:text-[#aff0db] mb-5 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">verified</span>
              <div>
                <strong>
                  {role === 'nurse' ? 'Healthcare Professional & Clinician Privileges' : 'Host Partner Program Privileges'}
                </strong>
                <p className="mt-0.5 text-[11px] leading-relaxed">
                  {role === 'nurse'
                    ? 'Exclusive access to day-sleeper sanctuaries calibrated for 4, 8, 13, and 26-week assignments with zero-penalty contract cancellation safeguards.'
                    : 'List entire properties or private furnished rooms with 100% booking approval autonomy and ~95% Net Payout via Stripe Connect Express.'}
                </p>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSignupSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Full Legal Name</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-[18px]">badge</span>
                  <input
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none focus:ring-1 focus:ring-[#005684]"
                    placeholder="Sarah Jenkins"
                    required
                  />
                </div>
              </div>

              {role === 'nurse' && (
                <div>
                  <label className="block font-bold mb-1">Specialty / Clinical Discipline</label>
                  <select
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111e33] focus:outline-none"
                  >
                    <option value="rn">Registered Nurse (RN / BSN / MSN — ICU, ER, OR, MedSurg, Telemetry)</option>
                    <option value="physician">Physician (MD / DO — Travel Hospitalist, Intensivist, Fellow)</option>
                    <option value="pa_np">Physician Assistant (PA) / Nurse Practitioner (NP / APRN)</option>
                    <option value="therapy">Therapist (Physical PT / Occupational OT / Speech SLP)</option>
                    <option value="allied">Allied Health / Respiratory Therapist (CRT, RRT) / Pharmacist</option>
                  </select>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold mb-1">Professional Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none"
                    placeholder="sarah.jenkins@alumni.duke.edu"
                    required
                  />
                </div>

                <div>
                  <label className="block font-bold mb-1">Mobile Phone Number (Twilio OTP)</label>
                  <input
                    type="tel"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none"
                    placeholder="+1 (919) 555-0198"
                    required
                  />
                </div>
              </div>

              {/* Password with 4-Bar Visual Strength Meter */}
              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold">Create Secure Password</label>
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="text-[11px] text-[#005684] dark:text-[#93ccff] font-semibold cursor-pointer"
                  >
                    {showPassword ? 'Hide' : 'Show'}
                  </button>
                </div>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none"
                  required
                />

                {/* 4-Bar Visual Strength Meter */}
                <div className="mt-2 space-y-1.5">
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="text-gray-400">Password Strength:</span>
                    <span className={`font-bold ${
                      strengthScore >= 3 ? 'text-[#195b4c]' : strengthScore === 2 ? 'text-amber-500' : 'text-rose-500'
                    }`}>
                      {strengthScore >= 3 ? 'Strong' : strengthScore === 2 ? 'Moderate' : 'Weak'}
                    </span>
                  </div>
                  <div className="grid grid-cols-4 gap-1.5 h-1.5">
                    {[1, 2, 3, 4].map((bar) => (
                      <div
                        key={bar}
                        className={`h-full rounded-full transition-all duration-300 ${
                          strengthScore >= bar
                            ? strengthScore >= 3
                              ? 'bg-[#195b4c]'
                              : strengthScore === 2
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                            : 'bg-gray-200 dark:bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                </div>
              </div>

              {/* Day-Sleeper Protocol Agreement */}
              <label className="flex items-start gap-2 text-xs text-[#404850] dark:text-[#c0c7d1] cursor-pointer pt-1">
                <input
                  type="checkbox"
                  checked={quietHoursAgreed}
                  onChange={(e) => setQuietHoursAgreed(e.target.checked)}
                  className="mt-0.5 rounded accent-[#005684]"
                  required
                />
                <span>
                  I agree to the Terms of Service, <strong>Day-Sleeper Quiet Hours Protocol (8:00 AM – 5:00 PM)</strong>, and Privacy Policy.
                </span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#001848] hover:bg-[#162e62] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                {role === 'nurse' ? 'Create Clinician Account' : 'Create Property Host Account'}
              </button>
            </form>
          </div>
        )}

        {/* SCREEN AU-03: Clinician & Host Sign-In */}
        {mode === 'signin' && (
          <div>
            <div className="text-center mb-6">
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#005684] dark:text-[#93ccff]">
                Secure Sanctuary Access
              </span>
              <h2 className="text-2xl font-bold tracking-tight mt-1">Sign in to Nurses Pillow</h2>
              <p className="text-xs text-[#404850] dark:text-[#c0c7d1] mt-1">
                Access your clinical assignment housing or verified host dashboard.
              </p>
            </div>

            {/* Institutional SSO */}
            <div className="space-y-2.5 mb-5">
              <button
                type="button"
                onClick={() => {
                  onAuthenticated('nurse', 'Sarah Jenkins');
                  onClose();
                }}
                className="w-full py-3 px-4 rounded-2xl bg-[#eaedff] dark:bg-[#15233a] hover:bg-[#dae2ff] text-[#001848] dark:text-white flex items-center justify-between text-xs font-bold transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#005684] text-white flex items-center justify-center">
                    <span className="material-symbols-outlined text-[18px]">local_hospital</span>
                  </div>
                  <div className="text-left">
                    <div>Institutional Hospital SSO</div>
                    <div className="text-[10px] text-gray-500 font-normal">Duke Health, UNC, Atrium, Tenet, Kaiser</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </button>

              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => {
                    onAuthenticated('nurse', 'Sarah Jenkins');
                    onClose();
                  }}
                  className="py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                >
                  <span className="font-bold text-[#4285F4]">G</span>
                  <span>Google Workspace</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    onAuthenticated('nurse', 'Sarah Jenkins');
                    onClose();
                  }}
                  className="py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 text-xs font-semibold flex items-center justify-center gap-2 hover:bg-gray-50 dark:hover:bg-white/5 cursor-pointer"
                >
                  <span> Apple ID</span>
                </button>
              </div>
            </div>

            {/* Divider */}
            <div className="relative flex items-center justify-center my-4">
              <div className="w-full border-t border-gray-200 dark:border-gray-700"></div>
              <span className="absolute bg-white dark:bg-[#0E1A2E] px-3 text-[11px] text-gray-400">
                or sign in with password
              </span>
            </div>

            {/* Form */}
            <form onSubmit={handleSigninSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-bold mb-1">Work or Personal Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none"
                  placeholder="sarah.jenkins@alumni.duke.edu"
                  required
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="font-bold">Password</label>
                  <button type="button" className="text-[11px] text-[#005684] hover:underline cursor-pointer">
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full p-2.5 pr-9 rounded-xl border border-gray-300 dark:border-gray-700 bg-transparent focus:outline-none"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[16px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>

              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberDevice}
                  onChange={(e) => setRememberDevice(e.target.checked)}
                  className="rounded accent-[#005684]"
                />
                <span>Remember this device for 30 days (hospital devices only)</span>
              </label>

              <button
                type="submit"
                className="w-full py-3.5 rounded-full bg-[#001848] hover:bg-[#162e62] text-white font-bold text-xs shadow-md transition-all cursor-pointer"
              >
                Sign In to Sanctuary Hub
              </button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};
