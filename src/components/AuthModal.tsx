import React, { useState, useEffect } from 'react';
import { UserRole } from '../types';

interface AuthModalProps {
  isOpen: boolean;
  initialMode?: 'signin' | 'signup';
  onClose: () => void;
  isNightShiftMode: boolean;
  onAuthenticated: (role: UserRole, name: string) => void;
  onOpenEmailVerification?: () => void;
  showScreenCodes?: boolean;
  onToggleScreenCodes?: () => void;
  isDeveloper?: boolean;
  onDeveloperSignIn?: () => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  initialMode = 'signup',
  onClose,
  isNightShiftMode,
  onAuthenticated,
  onOpenEmailVerification,
  showScreenCodes = false,
  onToggleScreenCodes,
  isDeveloper = false,
  onDeveloperSignIn,
}) => {
  const [mode, setMode] = useState<'signin' | 'signup'>(initialMode);
  const [role, setRole] = useState<UserRole>('nurse');

  // Handle Escape key to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Form states
  const [fullName, setFullName] = useState('Sarah Jenkins');
  const [specialty, setSpecialty] = useState('rn');
  const [propertyType, setPropertyType] = useState('entire');
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
    <div
      className="fixed inset-0 z-50 overflow-y-auto p-4 sm:p-6 bg-black/65 backdrop-blur-xs flex justify-center items-start"
      onClick={(e) => {
        if (e.target === e.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className={`w-full max-w-2xl my-auto rounded-3xl p-6 sm:p-8 shadow-2xl relative border transition-all ${
          isNightShiftMode
            ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
            : 'bg-white border-[rgba(11,37,89,0.1)] text-[#001848]'
        }`}
        onClick={(e) => e.stopPropagation()}
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

        {/* Developer Screen Code Badge (Visible when showScreenCodes is enabled) */}
        {showScreenCodes && (
          <div className="mb-4 p-2.5 rounded-xl bg-purple-500/10 border border-purple-500/25 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded font-mono font-bold bg-purple-600 text-white text-[11px]">
                {mode === 'signup' ? 'SCREEN [AU-01]' : 'SCREEN [AU-03]'}
              </span>
              <span className="font-semibold text-purple-900 dark:text-purple-200">
                {mode === 'signup' ? 'Registration & Role Selection' : 'Clinician & Host Sign-In'}
              </span>
            </div>
            <span className="text-[10px] uppercase tracking-wider font-mono text-purple-700 dark:text-purple-300 font-bold">
              Dev Mode
            </span>
          </div>
        )}

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
              Create Sanctuary Account
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
              Sign In
            </button>
          </div>
        </div>

        {/* Role Selection & Safe Clinical Sign-Up */}
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

            {/* Role Selection Buttons (Fixed min-height to eliminate CLS) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-5">
              <button
                type="button"
                onClick={() => setRole('nurse')}
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all min-h-[76px] flex flex-col justify-center ${
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
                className={`p-3.5 rounded-2xl border text-left cursor-pointer transition-all min-h-[76px] flex flex-col justify-center ${
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

            {/* Role Context Pill Banner (Fixed min-height prevents layout shift) */}
            <div className="p-3.5 rounded-2xl bg-[#aff0db]/25 border border-[#aff0db]/60 text-xs text-[#195b4c] dark:text-[#aff0db] mb-5 flex items-start gap-2.5 min-h-[76px]">
              <span className="material-symbols-outlined text-[18px] shrink-0 mt-0.5">verified</span>
              <div className="flex-1">
                <div className="font-bold leading-tight">
                  {role === 'nurse' ? 'Healthcare Professional Privileges' : 'Verified Property Host Privileges'}
                </div>
                <p className="mt-1 text-[11px] leading-relaxed">
                  {role === 'nurse'
                    ? 'Exclusive access to day-sleeper sanctuaries with zero-penalty contract cancellation safeguards.'
                    : 'List entire properties or private furnished rooms with 100% booking autonomy and ~95% Net Payout.'}
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

              {/* Matched slot for both roles eliminates vertical jump (CLS) */}
              {role === 'nurse' ? (
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
              ) : (
                <div>
                  <label className="block font-bold mb-1">Property Type / Housing Portfolio</label>
                  <select
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-300 dark:border-gray-700 bg-white dark:bg-[#111e33] focus:outline-none"
                  >
                    <option value="entire">Entire Residential Home (Condo, Townhouse, Single-Family)</option>
                    <option value="private_suite">Private Bedroom Suite with Dedicated En-Suite Bathroom</option>
                    <option value="guest_house">In-Law Suite / Dedicated Accessory Dwelling Unit (ADU)</option>
                    <option value="compound">Multi-Room Mid-Term Assignment Compound</option>
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

        {/* Quick Demo & Perspective Authentication Section */}
        <div className="mt-6 pt-5 border-t border-gray-200 dark:border-[#233550] text-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-3">
            <span className="font-bold text-[11px] uppercase tracking-wider text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[15px]">key</span>
              <span>1-Click Perspective Sign-In (Client vs Developer)</span>
            </span>
            {onToggleScreenCodes && (
              <button
                type="button"
                onClick={onToggleScreenCodes}
                className={`px-2.5 py-1 rounded-full font-mono text-[10px] font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                  showScreenCodes
                    ? 'bg-purple-600 text-white shadow-xs'
                    : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-700'
                }`}
                title="Toggle screen code tags like [AU-01], [HL-01], [A-01]"
              >
                <span className="material-symbols-outlined text-[13px]">
                  {showScreenCodes ? 'visibility' : 'visibility_off'}
                </span>
                <span>Screen Codes [{showScreenCodes ? 'SHOWING' : 'HIDDEN'}]</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* Clinician (Client) */}
            <button
              type="button"
              onClick={() => {
                onAuthenticated('nurse', 'Sarah Jenkins, RN');
                onClose();
              }}
              className="p-2.5 rounded-xl border border-[#195b4c]/30 hover:border-[#195b4c] bg-[#195b4c]/5 hover:bg-[#195b4c]/10 text-left transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-[#195b4c] dark:text-[#aff0db] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">stethoscope</span>
                  <span>Clinician</span>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5 truncate">Sarah Jenkins, RN</div>
              </div>
              <div className="text-[9px] mt-1 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">verified</span>
                Verified
              </div>
            </button>

            {/* Host (Client) */}
            <button
              type="button"
              onClick={() => {
                onAuthenticated('host', 'Michael Vance (Host)');
                onClose();
              }}
              className="p-2.5 rounded-xl border border-[#005684]/30 hover:border-[#005684] bg-[#005684]/5 hover:bg-[#005684]/10 text-left transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-[#005684] dark:text-[#93ccff] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">home</span>
                  <span>Host</span>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5 truncate">Michael Vance</div>
              </div>
              <div className="text-[9px] mt-1 text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-0.5">
                <span className="material-symbols-outlined text-[11px]">verified</span>
                Verified
              </div>
            </button>

            {/* Super Admin */}
            <button
              type="button"
              onClick={() => {
                onAuthenticated('super_admin', 'Operations Admin');
                onClose();
              }}
              className="p-2.5 rounded-xl border border-amber-500/30 hover:border-amber-500 bg-amber-500/5 hover:bg-amber-500/10 text-left transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-amber-700 dark:text-amber-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">admin_panel_settings</span>
                  <span>Admin</span>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5 truncate">Ops Admin</div>
              </div>
              <div className="text-[9px] mt-1 text-amber-600 font-bold">
                Platform Ops
              </div>
            </button>

            {/* Lead Developer (Developer Auth with Screen Codes) */}
            <button
              type="button"
              onClick={() => {
                if (onDeveloperSignIn) {
                  onDeveloperSignIn();
                } else {
                  onAuthenticated('developer', 'Joshua (Lead Developer)');
                }
                onClose();
              }}
              className="p-2.5 rounded-xl border border-purple-500/40 hover:border-purple-600 bg-purple-500/10 hover:bg-purple-500/15 text-left transition-all cursor-pointer flex flex-col justify-between"
            >
              <div>
                <div className="font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">terminal</span>
                  <span>Developer</span>
                </div>
                <div className="text-[10px] opacity-75 mt-0.5 truncate">Joshua (Dev)</div>
              </div>
              <div className="text-[9px] mt-1 text-purple-600 dark:text-purple-300 font-bold">
                Screen Codes
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
