import React, { useState, useEffect } from 'react';
import { HousingListing, BookingRequest } from '../types';
import { TrustBreakdownCard } from './TrustBreakdownCard';
import { NurseDashboardSkeleton } from './skeletons/NurseDashboardSkeleton';
import { Milestone2ScopeGate } from './Milestone2ScopeGate';

interface NurseDashboardViewProps {
  isNightShiftMode: boolean;
  savedListingIds: string[];
  allListings?: HousingListing[];
  onToggleSave: (id: string) => void;
  onSelectListing?: (listing: HousingListing) => void;
  onGoToHousing: () => void;
  activeBookings?: BookingRequest[];
  isVerified?: boolean;
  onGoToVerification?: () => void;
  onOpenSupport?: () => void;
  isLoading?: boolean;
  m2BypassMode?: boolean;
  onToggleM2Bypass?: () => void;
  isDeveloper?: boolean;
}

export const NurseDashboardView: React.FC<NurseDashboardViewProps> = ({
  isNightShiftMode,
  savedListingIds,
  allListings = [],
  onToggleSave,
  onSelectListing,
  onGoToHousing,
  activeBookings = [],
  isVerified = true,
  onGoToVerification,
  onOpenSupport,
  isLoading,
  m2BypassMode = false,
  onToggleM2Bypass,
  isDeveloper = false,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'profile' | 'saved' | 'verification' | 'messages' | 'receipts'>('current');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [extendedNotice, setExtendedNotice] = useState(false);
  const [internalLoading, setInternalLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

  // Keyless Smartlock & Active Door Token Scope Gating (Milestone 2 Deliverables NB-07 & ND-01)
  const [smartlockUnlockedLocally, setSmartlockUnlockedLocally] = useState(false);
  const isSmartlockGated = !(m2BypassMode || smartlockUnlockedLocally);

  // Initial simulated load for realistic clinical registry and booking fetch
  useEffect(() => {
    const timer = setTimeout(() => {
      setInternalLoading(false);
    }, 550);
    return () => clearTimeout(timer);
  }, []);

  const isDataLoading = isLoading !== undefined ? isLoading : internalLoading;

  const handleTabChange = (tab: 'current' | 'profile' | 'saved' | 'verification' | 'messages' | 'receipts') => {
    if (tab === activeTab) return;
    setActiveTab(tab);
    setTabLoading(true);
    setTimeout(() => {
      setTabLoading(false);
    }, 350);
  };

  const handleSyncRecords = () => {
    setInternalLoading(true);
    setTimeout(() => {
      setInternalLoading(false);
    }, 600);
  };

  // Chat state
  const [messages, setMessages] = useState([
    { sender: 'Sarah M. (Host)', time: 'Yesterday 14:20', text: 'Hi Sarah! The unit has been thoroughly cleaned and sanitized. Keypad code is set to •••• 4821. Fresh organic coffee beans are on the counter!' },
    { sender: 'You', time: 'Yesterday 18:45', text: 'Thank you Sarah! Landed at SFO and heading to the suite now. Blackout drapes are going to be a lifesaver for tomorrow morning.' },
    { sender: 'Sarah M. (Host)', time: 'Yesterday 19:10', text: 'Have a wonderful sleep! Let me know if you need fresh scrub towels anytime.' },
  ]);
  const [newMessage, setNewMessage] = useState('');

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    setMessages((prev) => [
      ...prev,
      { sender: 'You', time: 'Just now', text: newMessage },
    ]);
    setNewMessage('');
  };

  const savedListings = allListings.filter((l) => savedListingIds.includes(l.id));

  if (isDataLoading) {
    return (
      <div className={`w-full py-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto transition-colors ${
        isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
      }`}>
        <NurseDashboardSkeleton activeTab={activeTab} isNightShiftMode={isNightShiftMode} />
      </div>
    );
  }

  return (
    <div className={`w-full py-8 px-4 sm:px-6 lg:px-12 max-w-7xl mx-auto transition-colors ${
      isNightShiftMode ? 'text-[#E6ECF7]' : 'text-[#001848]'
    }`}>
      {/* Clinician Identity Banner */}
      <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] mb-8 relative overflow-hidden">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
          <div className="flex items-start gap-4 sm:gap-5">
            <div className="relative shrink-0">
              <img
                src="https://lh3.googleusercontent.com/aida-public/AB6AXuDq4qMRmWv2abJRAge1U60MiJz3ulOwOef26b8BlXofCKd0UYHmuYFFweYJOfwOhJ_ggE5Ojndfvp_UgeBPscmhcUpTEyosqeYWT0XOxXEVi_tIhHf24J1MSAxhpaGZomPPjhhjxPvZm1hpBWgQ5TLIwGKQPTELer9K4P2fAWRC9iyShXy8d0AFBKFqZndhLwcltJG7FThPWTne1t5lePzE47OauuD_JvjBvlr9Q8OblPNkVH952ytP"
                alt="Nurse Sarah Jenkins"
                className="w-16 h-16 rounded-2xl object-cover shadow-sm ring-2 ring-[#005684]"
              />
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="absolute inline-flex h-full w-full rounded-full bg-[#195b4c] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#195b4c]"></span>
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">Sarah Jenkins, BSN, RN</h1>
                <span
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight shadow-2xs"
                  style={{ backgroundColor: '#E1EFE9', color: '#2F6E5E' }}
                >
                  <span className="material-symbols-outlined text-[15px]">verified_user</span>
                  <span>Nurses Pillow Verified</span>
                </span>
                <button
                  type="button"
                  onClick={() => handleTabChange('profile')}
                  className="text-xs font-semibold text-[#0a6fa8] dark:text-[#93ccff] flex items-center gap-0.5 cursor-pointer ml-1 group"
                >
                  <span className="group-hover:underline">Profile &amp; Trust Credentials</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
              <p className="text-xs sm:text-sm text-[#404850] dark:text-[#c0c7d1]">
                Active Contract: <strong>PICU at UCSF Mission Bay</strong> (Week 4 of 13) • 07:00 – 19:30 Shift Rotation
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSyncRecords}
              disabled={isDataLoading}
              title="Sync clinician credentials, calendar and active bookings"
              className="px-3.5 py-2.5 rounded-full border border-[rgba(11,37,89,0.12)] dark:border-[#233550] bg-white dark:bg-[#111e33] text-[#001848] dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-[#182840] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <span className={`material-symbols-outlined text-[16px] text-[#005684] dark:text-[#93ccff] ${isDataLoading ? 'animate-spin' : ''}`}>
                sync
              </span>
              <span>{isDataLoading ? 'Syncing...' : 'Sync Records'}</span>
            </button>
            <button
              type="button"
              onClick={onGoToHousing}
              className="px-4 py-2.5 rounded-full bg-[#eaedff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff] hover:bg-[#dae2ff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#dae2ff] font-semibold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">search</span>
              <span>Find New Sanctuary</span>
            </button>
            <div className="px-4 py-2.5 rounded-full bg-[#195b4c]/10 text-[#195b4c] dark:text-[#aff0db] font-semibold text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">bedtime</span>
              <span>Sleep Protocol Active</span>
            </div>
          </div>
        </div>

        {/* Quick Metric Ribbon */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-5 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] text-xs">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#14233a]">
            <span className="material-symbols-outlined text-[#005684] dark:text-[#93ccff] text-[22px]">apartment</span>
            <div>
              <div className="font-bold text-sm">1 Active Stay</div>
              <div className="text-[11px] text-gray-500">Sunset District Suite</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#14233a]">
            <span className="material-symbols-outlined text-[#745b0d] dark:text-[#ffdf91] text-[22px]">bookmark</span>
            <div>
              <div className="font-bold text-sm">{savedListingIds.length} Saved Pillows</div>
              <div className="text-[11px] text-gray-500">Bay Area &amp; NC</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#14233a]">
            <span className="material-symbols-outlined text-[#195b4c] dark:text-[#aff0db] text-[22px]">verified_user</span>
            <div>
              <div className="font-bold text-sm">100% Verified</div>
              <div className="text-[11px] text-gray-500">ID, Phone, RN License</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#14233a]">
            <span className="material-symbols-outlined text-[#005684] dark:text-[#93ccff] text-[22px]">savings</span>
            <div>
              <div className="font-bold text-sm">$1,248 Saved</div>
              <div className="text-[11px] text-gray-500">$0 Traveler Platform Fees</div>
            </div>
          </div>
        </div>
      </div>

      {/* 6-Tab Console Switcher */}
      <div className="bg-white dark:bg-[#0B1626] rounded-2xl p-1.5 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] mb-8 flex flex-wrap gap-1">
        <button
          type="button"
          onClick={() => handleTabChange('current')}
          className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'current'
              ? 'bg-[#001848] dark:bg-[#005684] text-white shadow-sm'
              : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">hotel</span>
          <span>Current &amp; Upcoming Stays</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('profile')}
          className={`flex-1 min-w-[170px] py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#001848] dark:bg-[#005684] text-white shadow-sm'
              : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">account_circle</span>
          <span>Clinician Profile</span>
          <span
            className="px-2 py-0.5 rounded-full text-[10px] font-bold"
            style={{ backgroundColor: '#E1EFE9', color: '#2F6E5E' }}
          >
            Verified
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('saved')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'saved'
              ? 'bg-[#001848] dark:bg-[#005684] text-white shadow-sm'
              : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">favorite</span>
          <span>My Saved Pillows</span>
          <span className="px-2 py-0.5 rounded-full bg-[#ffdc84] text-[#795f12] text-[10px] font-bold">
            {savedListingIds.length}
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('verification')}
          className={`flex-1 min-w-[150px] py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'verification'
              ? 'bg-[#001848] dark:bg-[#005684] text-white shadow-sm'
              : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">verified_user</span>
          <span>Verification Center</span>
          <span className="material-symbols-outlined text-[#195b4c] dark:text-[#aff0db] text-[16px]">check_circle</span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('messages')}
          className={`flex-1 min-w-[130px] py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'messages'
              ? 'bg-[#001848] dark:bg-[#005684] text-white shadow-sm'
              : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">chat_bubble</span>
          <span>Messages</span>
          <span className="px-1.5 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-bold">
            1
          </span>
        </button>

        <button
          type="button"
          onClick={() => handleTabChange('receipts')}
          className={`flex-1 min-w-[160px] py-3 px-4 rounded-xl text-xs font-bold transition-all duration-200 ease-in-out flex items-center justify-center gap-2 cursor-pointer ${
            activeTab === 'receipts'
              ? 'bg-[#001848] dark:bg-[#005684] text-white shadow-sm'
              : 'text-[#404850] dark:text-[#c0c7d1] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">receipt_long</span>
          <span>Receipts &amp; History</span>
        </button>
      </div>

      {tabLoading ? (
        <NurseDashboardSkeleton activeTab={activeTab} isNightShiftMode={isNightShiftMode} onlyContent />
      ) : (
        <>

      {/* TAB 1: Current & Upcoming Stays */}
      {activeTab === 'current' && (
        <div className="space-y-8">
          {/* Active Stay Hero Card */}
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 mb-6 border-b border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
              <div className="flex items-center gap-3">
                <span className="relative flex h-3 w-3">
                  <span className="absolute inline-flex h-full w-full rounded-full bg-[#195b4c] opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-3 w-3 bg-[#195b4c]"></span>
                </span>
                <span className="text-sm font-bold">Currently Checked In</span>
                <span className="px-3 py-1 rounded-full bg-[#eaedff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff] text-xs font-semibold">
                  Day 28 of 91 (Week 4)
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#cde5ff] text-[#001d32] text-xs font-bold">
                <span className="material-symbols-outlined text-[16px]">commute</span>
                <span>1.2 mi • 8 min transit to UCSF</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Photo & Badge */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md group">
                <img
                  src="https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
                  alt="Sunset Sanctuary bedroom"
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#ffdf91]">stars</span>
                  <span>Soundproof Certified 52dB</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white bg-gradient-to-t from-black/80 to-transparent p-3 rounded-xl">
                  <div className="text-sm font-bold">Sunset District Sanctuary</div>
                  <div className="text-xs opacity-90">King bed • Zero-bleed drapes • LectroFan</div>
                </div>
              </div>

              {/* Info & Host */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full gap-4">
                <div>
                  <span className="text-xs font-bold text-[#005684] dark:text-[#93ccff] uppercase tracking-wider block mb-1">
                    UCSF Medical Center - Mission Bay (PICU Unit)
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                    Serene Sunset District Suite w/ Soundproofing &amp; Workdesk
                  </h2>
                  <p className="text-xs text-[#404850] dark:text-[#c0c7d1] flex items-center gap-1.5 mb-4">
                    <span className="material-symbols-outlined text-[16px] text-[#005684]">calendar_month</span>
                    <span>Oct 1, 2024 – Dec 31, 2024 (13-Week Contract)</span>
                  </p>

                  {/* Host Quick Strip */}
                  <div className="p-3.5 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <img
                        src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                        alt="Host Sarah M."
                        className="w-11 h-11 rounded-full object-cover shadow-xs"
                      />
                      <div>
                        <div className="text-xs font-bold">Hosted by Sarah M.</div>
                        <div className="text-[11px] text-gray-500">Superhost • 48 Hosted Clinicians</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('messages')}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111e33] text-xs font-bold text-[#005684] dark:text-[#93ccff] shadow-xs hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-50 cursor-pointer"
                    >
                      Message Sarah
                    </button>
                  </div>
                </div>

                {/* Keyless Credentials Vault: Milestone 2 Scope Gating (Deliverables NB-07 & ND-01) */}
                {isSmartlockGated ? (
                  <div className="p-4 sm:p-5 rounded-2xl bg-amber-500/5 dark:bg-[#1c1912] border border-amber-500/30 dark:border-amber-400/25 space-y-3.5 transition-all">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-xl bg-amber-500/15 text-amber-700 dark:text-amber-300 flex items-center justify-center shrink-0">
                          <span className="material-symbols-outlined text-[19px]">lock_clock</span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#001848] dark:text-white flex items-center gap-2 flex-wrap">
                            <span>Keyless Smartlock &amp; Wi-Fi Credentials</span>
                            <span className="font-mono text-[10px] text-amber-800 dark:text-amber-300 bg-amber-500/15 px-2 py-0.5 rounded-full font-bold">
                              [NB-07 • Milestone 2]
                            </span>
                          </div>
                          <div className="text-[11px] text-gray-500 dark:text-gray-400">
                            Active IoT Door Code Token &amp; Sanctuary Wi-Fi Vault
                          </div>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/15 px-2.5 py-1 rounded-full shrink-0 self-start sm:self-auto">
                        <span className="material-symbols-outlined text-[13px]">lock</span>
                        <span>Milestone 2 Scope Gated</span>
                      </div>
                    </div>

                    {/* Confirmation explanation box */}
                    <div className="p-3.5 rounded-xl bg-white dark:bg-[#0E1A2E] border border-amber-500/20 dark:border-amber-500/20 text-xs space-y-2">
                      <div className="flex items-start gap-2.5 text-[#001848] dark:text-[#E6ECF7]">
                        <span className="material-symbols-outlined text-amber-600 dark:text-amber-400 text-[18px] shrink-0 mt-0.5">
                          verified
                        </span>
                        <div className="space-y-1">
                          <div className="font-bold text-xs text-[#001848] dark:text-white">
                            Contract Scope Confirmation: Active Door Lock Token is Milestone 2 (NB-07) — Not Phase 1 / Milestone 1
                          </div>
                          <p className="text-[11px] leading-relaxed text-gray-600 dark:text-gray-300">
                            Per the project roadmap, the <strong className="text-[#001848] dark:text-white">Active Door Lock Token, IoT Keyless Smartlock &amp; Wi-Fi Credentials Vault</strong> are scheduled for <strong className="text-amber-700 dark:text-amber-300 font-semibold">Milestone 2 (Deliverables NB-07 &amp; ND-01)</strong>. 
                            <strong className="text-emerald-700 dark:text-emerald-400 font-semibold"> Phase 1 / Milestone 1</strong> provides confirmed reservation acceptance, shift dates, arrival countdown instructions, and daytime quiet environment guarantees (<strong className="text-emerald-700 dark:text-emerald-400 font-semibold">NB-06</strong>).
                          </p>
                        </div>
                      </div>

                      {/* Comparison tags */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 border-t border-gray-100 dark:border-gray-800 text-[11px]">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                          <span className="material-symbols-outlined text-[14px]">check_circle</span>
                          <span className="font-semibold">Phase 1 / M1 Scope:</span>
                          <span className="text-gray-600 dark:text-gray-300">Confirmed Stay &amp; Quiet Guarantee (Active)</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-amber-700 dark:text-amber-300">
                          <span className="material-symbols-outlined text-[14px]">lock</span>
                          <span className="font-semibold">Milestone 2 Scope:</span>
                          <span className="text-gray-600 dark:text-gray-300">IoT Keyless Door Lock Token &amp; Wi-Fi Vault (Gated)</span>
                        </div>
                      </div>
                    </div>

                    {/* Inspection action */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-0.5">
                      <span className="text-[11px] text-gray-500 dark:text-gray-400 italic">
                        Door lock token securely withheld until Milestone 2 in-flight activation.
                      </span>
                      <button
                        type="button"
                        onClick={() => setSmartlockUnlockedLocally(true)}
                        className="px-3 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-800 dark:text-amber-300 font-bold text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer self-start sm:self-auto"
                        title="Preview Milestone 2 smartlock credentials vault scaffold"
                      >
                        <span className="material-symbols-outlined text-[15px]">visibility</span>
                        <span>Preview M2 Door Code Vault</span>
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 rounded-2xl bg-[#eaedff]/60 dark:bg-[#15233a] border border-[#005684]/20 space-y-3 transition-all animate-fadeIn">
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                      <div className="flex items-center gap-1.5 text-[#001848] dark:text-white">
                        <span className="material-symbols-outlined text-[18px] text-[#005684]">key</span>
                        <span>Keyless Smartlock &amp; Wi-Fi Credentials</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono">
                          [M2 Preview Active]
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[11px] text-[#195b4c] dark:text-[#aff0db] font-semibold bg-[#195b4c]/10 px-2 py-0.5 rounded-full">
                          Active Door Lock Token
                        </span>
                        <button
                          type="button"
                          onClick={() => setSmartlockUnlockedLocally(false)}
                          className="text-[11px] text-gray-500 hover:text-amber-700 dark:text-gray-400 dark:hover:text-amber-300 font-semibold underline cursor-pointer"
                          title="Re-lock to Milestone 1 scope boundary"
                        >
                          Re-gate to M1 Scope
                        </button>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 rounded-xl bg-white dark:bg-[#111e33] flex items-center justify-between shadow-xs">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase">Front Gate &amp; Suite Door PIN</div>
                          <div className="font-mono text-base font-bold tracking-wider">•••• 4821</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('4821', 'pin')}
                          className="p-1.5 rounded-lg hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/10 text-gray-600 dark:text-gray-300 cursor-pointer"
                          title="Copy PIN"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {copiedKey === 'pin' ? 'check' : 'content_copy'}
                          </span>
                        </button>
                      </div>

                      <div className="p-3 rounded-xl bg-white dark:bg-[#111e33] flex items-center justify-between shadow-xs">
                        <div>
                          <div className="text-[10px] text-gray-500 uppercase">High-Speed Wi-Fi (500 Mbps)</div>
                          <div className="font-bold text-sm truncate">SunsetSanctuary-5G</div>
                        </div>
                        <button
                          type="button"
                          onClick={() => handleCopy('RestWellHealBetter2024!', 'wifi')}
                          className="p-1.5 rounded-lg hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/10 text-gray-600 dark:text-gray-300 cursor-pointer"
                          title="Copy Wi-Fi Password"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {copiedKey === 'wifi' ? 'check' : 'wifi_password'}
                          </span>
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Primary Actions */}
                <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                  <div className="flex items-center gap-2.5">
                    <button
                      type="button"
                      onClick={() => setExtendedNotice(true)}
                      className="px-5 py-2.5 rounded-full bg-[#001848] text-white text-xs font-bold hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] shadow-sm flex items-center gap-1.5 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[18px]">add_circle</span>
                      <span>Extend My Stay</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/20">14-Day Lock</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setActiveTab('messages')}
                      className="px-4 py-2.5 rounded-full bg-[#f2f3ff] dark:bg-[#182840] text-xs font-bold hover:bg-[#dae2ff] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#dae2ff] cursor-pointer"
                    >
                      Host Chat
                    </button>
                  </div>

                  <a
                    href="#receipts"
                    onClick={(e) => {
                      e.preventDefault();
                      setActiveTab('receipts');
                    }}
                    className="hidden"
                    aria-hidden="true"
                    tabIndex={-1}
                    title="GSA Per Diem & Tax Home Ledger (Phase 2 Gated Scope)"
                  >
                    <span className="material-symbols-outlined text-[15px]">lock_clock</span>
                    <span className="underline">GSA Stipend Receipt</span>
                    <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-900 dark:text-amber-200 font-mono font-bold">M2</span>
                  </a>
                </div>

                {extendedNotice && (
                  <div className="p-3 rounded-xl bg-[#aff0db]/30 text-[#195b4c] dark:text-[#aff0db] text-xs font-semibold flex items-center justify-between animate-fadeIn">
                    <span>Host Sarah notified of 4-week contract extension request!</span>
                    <button
                      type="button"
                      onClick={() => setExtendedNotice(false)}
                      className="underline text-[11px] cursor-pointer"
                    >
                      Dismiss
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Upcoming Reservations Card */}
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex items-center justify-between mb-5">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#745b0d] dark:text-[#ffdf91]">flight_takeoff</span>
                <h3 className="text-lg font-bold">Upcoming Contract Stays</h3>
              </div>
              <span className="text-xs text-gray-500">Winter 2025 Assignment</span>
            </div>

            <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <img
                  src="https://images.unsplash.com/photo-1540518614846-7ede433c4ef0?auto=format&fit=crop&w=300&q=80"
                  alt="Mayo Clinic casita"
                  className="w-20 h-20 rounded-xl object-cover shrink-0"
                />
                <div>
                  <span className="px-2.5 py-0.5 rounded-full bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db] text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                    Host Approved / Pre-Authorized
                  </span>
                  <h4 className="text-sm font-bold">Mayo Clinic Phoenix Campus - Scottsdale Casita</h4>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Jan 15, 2025 – Apr 15, 2025 (16 wks) • $2,150 / mo (All Utilities Inc.)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => alert('Viewing reservation contract #AZ-992')}
                  className="px-4 py-2 rounded-full bg-[#001848] text-white text-xs font-bold cursor-pointer"
                >
                  Review Details
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB: Nurse Profile & Account Settings */}
      {activeTab === 'profile' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
              <div>
                <span className="text-xs font-bold text-[#005684] dark:text-[#93ccff] uppercase tracking-wider">
                  Clinician Profile &amp; Account Settings
                </span>
                <h2 className="text-2xl font-bold text-[#001848] dark:text-white">
                  Clinician Profile &amp; Trust Credentials
                </h2>
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight shadow-2xs"
                style={{ backgroundColor: '#E1EFE9', color: '#2F6E5E' }}
              >
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                <span>Nurses Pillow Verified</span>
              </span>
            </div>

            {/* Expanded Trust Breakdown Card (Rule Compliant) */}
            <TrustBreakdownCard
              isNightShiftMode={isNightShiftMode}
              clinicianName="Sarah Jenkins, BSN, RN"
              clinicianTitle="Pediatric Intensive Care Unit (PICU)"
              verificationTimestamp="September 2026"
              stateBoard="State Board of Nursing"
              titleBadge="Credential Audit"
            />

            {/* Profile Field Sections (ND-04 Specification) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Clinical Specialty & Shift Preference */}
              <div className="p-5 rounded-2xl bg-[#f2f3ff] dark:bg-[#14233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#001848] dark:text-white">
                  <span className="material-symbols-outlined text-[#005684] dark:text-[#93ccff]">medical_services</span>
                  <span>Specialty &amp; Shift Preference</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">Clinical Specialty</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      Pediatric Intensive Care Unit (PICU) / Pediatric Trauma
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Shift Preference (Housing Matching)</label>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#195b4c]/10 text-[#195b4c] dark:text-[#aff0db] font-bold">
                      <span className="material-symbols-outlined text-[15px]">bedtime</span>
                      <span>19:00 – 07:30 Night Shift (Day Sleeper Protocol)</span>
                    </div>
                    <p className="text-[11px] text-gray-500 mt-1">
                      Enforces blackout curtains, acoustic white noise buffer, and zero-daytime lawnmower/maintenance guarantees.
                    </p>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Total Acute Care Experience</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      6+ Years Level 1 Pediatric Trauma Center
                    </div>
                  </div>
                </div>
              </div>

              {/* Agency & Hospital Assignment */}
              <div className="p-5 rounded-2xl bg-[#f2f3ff] dark:bg-[#14233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#001848] dark:text-white">
                  <span className="material-symbols-outlined text-[#005684] dark:text-[#93ccff]">domain</span>
                  <span>Travel Agency &amp; Hospital Assignment</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">Staffing Agency Partner</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      Aya Healthcare (Travel Nurse Division)
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Current Healthcare System Assignment</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      UCSF Medical Center - Mission Bay (San Francisco, CA)
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Active Contract Rotation</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      13-Week Contract (Week 4 in progress)
                    </div>
                  </div>
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="p-5 rounded-2xl bg-[#f2f3ff] dark:bg-[#14233a] border border-[rgba(11,37,89,0.06)] dark:border-[#233550] space-y-4">
                <div className="flex items-center gap-2 text-sm font-bold text-[#001848] dark:text-white">
                  <span className="material-symbols-outlined text-[#005684] dark:text-[#93ccff]">contact_phone</span>
                  <span>Emergency &amp; Shift Supervisor Contacts</span>
                </div>
                <div className="space-y-3 text-xs">
                  <div>
                    <label className="text-gray-400 block mb-1">Primary Emergency Contact</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      David Jenkins (Spouse) •+1 (919) 555-0144
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Unit Clinical Supervisor</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      PICU Nursing Operations Admin • Ext. 4920
                    </div>
                  </div>
                </div>
              </div>

              {/* Privacy Protocol Guarantee */}
              <div className="p-5 rounded-2xl bg-[#E1EFE9]/40 dark:bg-[#142823] border border-[#2F6E5E]/20 space-y-3">
                <div className="flex items-center gap-2 text-sm font-bold text-[#2F6E5E] dark:text-[#aff0db]">
                  <span className="material-symbols-outlined">shield</span>
                  <span>Zero Raw License Exposure Policy</span>
                </div>
                <p className="text-xs text-[#2F6E5E] dark:text-[#aff0db] leading-relaxed">
                  In compliance with Nurses Pillow privacy standards, raw state license numbers and government identity documents are never displayed to hosts or third parties. All credentials are verified via primary source registries and permanently purged post-validation.
                </p>
                <div className="text-[11px] font-bold text-[#2F6E5E] dark:text-[#aff0db] flex items-center gap-1">
                  <span className="material-symbols-outlined text-[15px]">lock</span>
                  <span>Identity documents and license numbers permanently purged post-verification.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: My Saved Pillows */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">My Saved Housing Sanctuaries</h2>
              <p className="text-xs text-gray-500">Saved favorites for upcoming travel contract rotations</p>
            </div>
            <button
              type="button"
              onClick={onGoToHousing}
              className="px-4 py-2 rounded-full bg-[#001848] text-white text-xs font-bold cursor-pointer"
            >
              Search More
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {savedListings.map((listing) => (
              <div
                key={listing.id}
                className="bg-white dark:bg-[#0B1626] rounded-3xl p-5 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col justify-between"
              >
                <div>
                  <div className="relative rounded-2xl overflow-hidden aspect-video mb-3">
                    <img
                      src={listing.images[0]}
                      alt={listing.title}
                      className="w-full h-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => onToggleSave(listing.id)}
                      className="absolute top-2.5 right-2.5 w-8 h-8 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center text-rose-500 cursor-pointer shadow-sm"
                    >
                      <span className="material-symbols-outlined text-sm">favorite</span>
                    </button>
                    <div className="absolute bottom-2 left-2 px-2 py-0.5 rounded-md bg-black/60 text-white text-[10px] font-bold">
                      {listing.distanceBadge || listing.proximityToHospital}
                    </div>
                  </div>
                  <h3 className="font-bold text-sm leading-snug mb-1 line-clamp-2">{listing.title}</h3>
                  <div className="text-xs text-gray-500 mb-3">{listing.neighborhood}, {listing.city}</div>
                </div>

                <div className="pt-3 border-t border-[rgba(11,37,89,0.06)] dark:border-[#233550] flex items-center justify-between">
                  <div>
                    <span className="text-lg font-black">${listing.monthlyRate.toLocaleString()}</span>
                    <span className="text-xs text-gray-500"> / mo</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      if (onSelectListing) {
                        onSelectListing(listing);
                      } else {
                        onGoToHousing();
                      }
                    }}
                    className="px-3.5 py-1.5 rounded-full bg-[#001848] text-white text-xs font-bold cursor-pointer hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62]"
                  >
                    Check Space
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: Verification Center */}
      {activeTab === 'verification' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4 pb-4 border-b border-[rgba(11,37,89,0.06)] dark:border-[#233550]">
              <div>
                <span className="text-xs font-bold text-[#195b4c] dark:text-[#aff0db] uppercase tracking-wider">
                  Clinical Security Center
                </span>
                <h2 className="text-2xl font-bold">Verification &amp; Credentialing Audit</h2>
              </div>
              <span
                className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight shadow-2xs"
                style={{ backgroundColor: '#E1EFE9', color: '#2F6E5E' }}
              >
                <span className="material-symbols-outlined text-[15px]">verified_user</span>
                <span>Nurses Pillow Verified</span>
              </span>
            </div>

            {/* Expanded Trust Breakdown Card */}
            <TrustBreakdownCard
              isNightShiftMode={isNightShiftMode}
              clinicianName="Sarah Jenkins, BSN, RN"
              clinicianTitle="Registered Nurse • PICU Specialty"
              verificationTimestamp="September 2026"
              stateBoard="California &amp; North Carolina State Boards"
              titleBadge="Primary Source Registry Verified"
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#005684]/10 dark:bg-[#005684]/20 flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs">Stripe Identity (ID &amp; Bio Selfie)</div>
                    <div className="text-[11px] text-gray-500">Government RealID Verified</div>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: '#E1EFE9', color: '#2F6E5E' }}
                >
                  Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#005684]/10 dark:bg-[#005684]/20 flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                    <span className="material-symbols-outlined text-[20px]">phonelink_ring</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs">Twilio Shift Carrier Token</div>
                    <div className="text-[11px] text-gray-500">+1 (919) 555-0198 Verified</div>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: '#E1EFE9', color: '#2F6E5E' }}
                >
                  Verified
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2F6E5E]/15 dark:bg-[#2F6E5E]/25 flex items-center justify-center text-[#2F6E5E] dark:text-[#aff0db]">
                    <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs">Official Primary Source Registry &amp; State</div>
                    <div className="text-[11px] text-gray-500">Active, Clear &amp; Unencumbered Standing</div>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={{ backgroundColor: '#E1EFE9', color: '#2F6E5E' }}
                >
                  Active
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#005684]/10 dark:bg-[#005684]/20 flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                    <span className="material-symbols-outlined text-[20px]">public</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs">eNLC Compact Endorsement</div>
                    <div className="text-[11px] text-gray-500">Multi-state Travel Ready (41 states)</div>
                  </div>
                </div>
                <span className="text-xs font-bold text-[#005684] dark:text-[#93ccff]">Eligible</span>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#aff0db]/25 border border-[#aff0db]/60 text-xs text-[#195b4c] dark:text-[#aff0db] leading-relaxed flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] shrink-0 mt-0.5">lock</span>
              <span>
                <strong>Data Privacy Safeguard:</strong> Identity documents and license numbers permanently purged post-verification. Only the cryptographically signed <em>Nurses Pillow Verified</em> token is retained.
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: Messages */}
      {activeTab === 'messages' && (
        <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col h-[560px]">
          <div className="flex items-center justify-between pb-4 border-b border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex items-center gap-3">
              <img
                src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=300&q=80"
                alt="Sarah M."
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <div className="text-sm font-bold">Sarah M. (Verified Host)</div>
                <div className="text-[11px] text-gray-500">Sunset District Sanctuary • Fast Responder</div>
              </div>
            </div>
            <span className="text-xs text-[#195b4c] font-semibold flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#195b4c]"></span>
              <span>Online</span>
            </span>
          </div>

          {/* Thread messages */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.map((m, idx) => (
              <div
                key={idx}
                className={`flex flex-col max-w-md ${m.sender === 'You' ? 'ml-auto items-end' : 'mr-auto items-start'}`}
              >
                <div className="text-[10px] text-gray-400 mb-0.5">{m.sender} • {m.time}</div>
                <div
                  className={`p-3 rounded-2xl text-xs leading-relaxed ${
                    m.sender === 'You'
                      ? 'bg-[#001848] text-white rounded-br-none'
                      : 'bg-[#eaedff] dark:bg-[#182840] text-[#001848] dark:text-white rounded-bl-none'
                  }`}
                >
                  {m.text}
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type message to Host Sarah..."
              className="flex-1 px-4 py-2.5 rounded-full bg-[#f2f3ff] dark:bg-[#182840] text-xs focus:outline-none focus:ring-1 focus:ring-[#005684]"
            />
            <button
              type="submit"
              className="px-5 py-2.5 rounded-full bg-[#001848] text-white text-xs font-bold hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Receipts & History (Gated Phase 2 / Milestone 2 Deliverable) */}
      {activeTab === 'receipts' && (
        !m2BypassMode ? (
          <Milestone2ScopeGate
            isNightShiftMode={isNightShiftMode}
            featureTitle="GSA Per Diem & Tax Home Ledger (Phase 2)"
            featureDescription="In accordance with Lawrence Roberts' confirmed Phase 1 core marketplace scope, federal GSA lodging per diem audit ledgers, IRS travel tax packets, and duplicate living expense receipts are scheduled for Milestone 2 deliverables. This ledger is strictly gated during Milestone 1 core acceptance."
            onReturnToMarketplace={() => setActiveTab('current')}
            onBypassGate={onToggleM2Bypass}
          />
        ) : (
          <div className="space-y-6">
            <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-500/10 text-purple-700 dark:text-purple-300 text-[10px] font-mono font-bold mb-1">
                    <span>M2 SCOPE UNLOCKED</span>
                  </div>
                  <h2 className="text-xl font-bold">GSA Per Diem &amp; Tax Home Ledger</h2>
                  <p className="text-xs text-gray-500">IRS-compliant duplicate lodging expense records</p>
                </div>
                <button
                  type="button"
                  onClick={() => alert('Exporting full IRS travel tax packet (PDF)...')}
                  className="px-4 py-2 rounded-full bg-[#001848] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Export Tax Packet</span>
                </button>
              </div>

              <div className="p-4 rounded-2xl bg-[#eaedff]/60 dark:bg-[#15233a] border border-[#005684]/20 space-y-2 text-xs mb-6">
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>UCSF Contract Lodging Per Diem Cap:</span>
                  <span className="font-bold text-black dark:text-white">$2,850.00 / mo</span>
                </div>
                <div className="flex justify-between text-gray-600 dark:text-gray-300">
                  <span>Sunset Suite Actual Contract Rate:</span>
                  <span className="font-bold text-[#195b4c] dark:text-[#aff0db]">$2,100.00 / mo</span>
                </div>
                <div className="flex justify-between pt-2 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] font-bold text-sm text-[#005684] dark:text-[#93ccff]">
                  <span>Untaxed Surplus Retained:</span>
                  <span>+$750.00 / mo in Pocket</span>
                </div>
              </div>

              <div className="space-y-3">
                <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold">UCSF Mission Bay PICU (Current)</div>
                    <div className="text-gray-500">Oct 1 – Dec 31, 2024 • Invoice #NP-SF-9042</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">$1,950.00 / mo</div>
                    <span className="text-[11px] text-[#195b4c] font-semibold">Paid via Stripe Escrow</span>
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between text-xs">
                  <div>
                    <div className="font-bold">Duke University Hospital (Completed)</div>
                    <div className="text-gray-500">Jun 1 – Aug 31, 2024 • Invoice #NP-NC-4819</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold">$1,850.00 / mo</div>
                    <span className="text-[11px] text-[#195b4c] font-semibold">Completed &amp; Discharged</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
        </>
      )}
    </div>
  );
};
