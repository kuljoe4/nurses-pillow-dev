import React, { useState } from 'react';

interface StagingAuthGateModalProps {
  isOpen: boolean;
  onAuthenticated: (userType: 'client' | 'developer') => void;
  isNightShiftMode: boolean;
}

export const StagingAuthGateModal: React.FC<StagingAuthGateModalProps> = ({
  isOpen,
  onAuthenticated,
  isNightShiftMode,
}) => {
  const [username, setUsername] = useState('lawrence');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsSubmitting(true);

    setTimeout(() => {
      const u = username.trim().toLowerCase();
      const p = password.trim();

      if (u === 'lawrence' && p === 'np-preview-2026') {
        sessionStorage.setItem('np_staging_auth_lawrence', 'true');
        sessionStorage.setItem('np_staging_user', 'client');
        onAuthenticated('client');
      } else if (
        (u === 'developer' || u === 'joshua') &&
        (p === 'np-dev-2026' || p === 'np-preview-2026')
      ) {
        sessionStorage.setItem('np_staging_auth_lawrence', 'true');
        sessionStorage.setItem('np_staging_user', 'developer');
        onAuthenticated('developer');
      } else {
        setError('Invalid credentials. Client: "lawrence" / "np-preview-2026". Developer: "developer" / "np-dev-2026".');
      }
      setIsSubmitting(false);
    }, 300);
  };

  const handleQuickClientUnlock = () => {
    setUsername('lawrence');
    setPassword('np-preview-2026');
    sessionStorage.setItem('np_staging_auth_lawrence', 'true');
    sessionStorage.setItem('np_staging_user', 'client');
    onAuthenticated('client');
  };

  const handleQuickDeveloperUnlock = () => {
    setUsername('developer');
    setPassword('np-dev-2026');
    sessionStorage.setItem('np_staging_auth_lawrence', 'true');
    sessionStorage.setItem('np_staging_user', 'developer');
    onAuthenticated('developer');
  };

  return (
    <div className="fixed inset-0 z-[100] overflow-y-auto bg-[#001848]/85 backdrop-blur-md animate-fade-in">
      <div className="min-h-full flex flex-col items-center justify-center p-4 sm:p-6 py-8 sm:py-12">
        <div
          className={`w-full max-w-md my-auto rounded-3xl p-6 sm:p-8 shadow-2xl border transition-all duration-200 ease-in-out ${
            isNightShiftMode
              ? 'bg-[#0E1A2E] border-[#233550] text-[#E6ECF7]'
              : 'bg-white border-black/5 text-[#001848]'
          }`}
        >
        {/* Header Icon & Branding */}
        <div className="flex flex-col items-center text-center mb-6">
          <div className="w-14 h-14 rounded-2xl bg-[#0a6fa8]/10 dark:bg-[#0a6fa8]/20 flex items-center justify-center text-[#0a6fa8] mb-3">
            <span className="material-symbols-outlined text-3xl">lock</span>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-semibold bg-[#ffdc84]/40 text-[#745b0d] dark:bg-[#745b0d]/30 dark:text-[#ffdf91] mb-2">
            Staging Preview Gate • Milestone 1 Acceptance
          </span>
          <h2 className="text-xl sm:text-2xl font-bold tracking-tight">
            Nurses Pillow LLC
          </h2>
          <p className="text-xs text-[#404850] dark:text-[#8ea5c8] mt-1 max-w-xs leading-relaxed">
            Authorized client review link. Enter staging credentials to access the Milestone 1 core marketplace.
          </p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-[#ba1a1a]/10 border border-[#ba1a1a]/20 text-[#ba1a1a] text-xs font-medium flex items-center gap-2">
              <span className="material-symbols-outlined text-sm shrink-0">error</span>
              <span>{error}</span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold mb-1 text-[#001848] dark:text-[#E6ECF7]">
              Username
            </label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ease-in-out outline-none ${
                isNightShiftMode
                  ? 'bg-[#15233a] border border-[#233550] text-white focus:border-[#0a6fa8]'
                  : 'bg-[#f2f3ff] border border-transparent text-[#001848] focus:border-[#0a6fa8] focus:bg-white'
              }`}
              placeholder="lawrence"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold mb-1 text-[#001848] dark:text-[#E6ECF7]">
              Password
            </label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className={`w-full px-4 py-2.5 rounded-xl text-sm transition-all duration-200 ease-in-out outline-none ${
                isNightShiftMode
                  ? 'bg-[#15233a] border border-[#233550] text-white focus:border-[#0a6fa8]'
                  : 'bg-[#f2f3ff] border border-transparent text-[#001848] focus:border-[#0a6fa8] focus:bg-white'
              }`}
              placeholder="np-preview-2026"
            />
          </div>

          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3 rounded-full bg-[#0a6fa8] hover:bg-[#005684] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#005684] text-white text-sm font-semibold transition-all duration-200 ease-in-out shadow-md flex items-center justify-center gap-2 cursor-pointer disabled:opacity-70"
            >
              <span className="material-symbols-outlined text-base">vpn_key</span>
              <span>{isSubmitting ? 'Verifying...' : 'Unlock Preview'}</span>
            </button>

            <button
              type="button"
              onClick={handleQuickClientUnlock}
              className={`w-full py-2.5 rounded-full text-xs font-semibold border transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                isNightShiftMode
                  ? 'border-[#233550] text-[#aff0db] hover:bg-[#15233a] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#15233a]'
                  : 'border-[#dae2ff] text-[#005684] hover:bg-[#f2f3ff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#f2f3ff]'
              }`}
            >
              <span className="material-symbols-outlined text-sm text-[#10b981]">verified_user</span>
              <span>Client Review Access (Lawrence Roberts • Milestone 1)</span>
            </button>

            <button
              type="button"
              onClick={handleQuickDeveloperUnlock}
              className="w-full text-center text-[11px] text-gray-400 hover:text-purple-400 focus-visible:text-purple-400 dark:hover:text-purple-300 focus-visible:text-purple-300 transition-colors py-1 cursor-pointer font-mono"
            >
              Developer Access (Joshua • Milestone 2 Scaffold)
            </button>
          </div>
        </form>

        {/* Security & SEO Notice */}
        <div className="mt-6 pt-4 border-t border-black/5 dark:border-white/10 text-center">
          <p className="text-[11px] text-[#404850] dark:text-[#8ea5c8] leading-relaxed">
            🛡️ Unindexed staging environment (<code className="font-mono text-[10px]">noindex, nofollow</code>). NC real estate license & legal compliance pending attorney sign-off.
          </p>
        </div>
      </div>
    </div>
  </div>
  );
};
