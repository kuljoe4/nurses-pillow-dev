import React, { useState, useEffect } from 'react';
import { HousingListing, BookingRequest } from '../types';
import { TrustBreakdownCard } from './TrustBreakdownCard';
import { NurseDashboardSkeleton } from './skeletons/NurseDashboardSkeleton';
import { PillowSaveButton } from './PillowSaveButton';

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
  currentUser?: {
    id?: string;
    role: string;
    name: string;
    email?: string;
    isNurseVerified?: boolean;
    isHostVerified?: boolean;
  };
  verificationData?: any;
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
  currentUser,
  verificationData,
}) => {
  const [activeTab, setActiveTab] = useState<'current' | 'profile' | 'saved' | 'verification' | 'messages' | 'receipts'>('current');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [extendedNotice, setExtendedNotice] = useState(false);
  const [internalLoading, setInternalLoading] = useState(true);
  const [tabLoading, setTabLoading] = useState(false);

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

  // User-scoped chat state (prevents leaking stale/mock messages across profiles)
  const messagesStorageKey = currentUser?.email || currentUser?.id
    ? `np_messages_${currentUser.email || currentUser.id}`
    : 'np_messages_guest';

  const [messages, setMessages] = useState<Array<{ sender: string; time: string; text: string }>>(() => {
    try {
      const saved = localStorage.getItem(messagesStorageKey);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch {
      // ignore
    }
    return [];
  });
  const [newMessage, setNewMessage] = useState('');

  // Re-synchronize messages whenever the active profile changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(messagesStorageKey);
      if (saved) {
        setMessages(JSON.parse(saved));
      } else {
        setMessages([]);
      }
    } catch {
      setMessages([]);
    }
  }, [messagesStorageKey]);

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;
    const userMsg = {
      sender: 'You',
      time: 'Just now',
      text: newMessage.trim(),
    };
    const updated = [...messages, userMsg];
    setMessages(updated);
    try {
      localStorage.setItem(messagesStorageKey, JSON.stringify(updated));
    } catch {}
    setNewMessage('');
  };

  const savedListings = allListings.filter((l) => savedListingIds.includes(l.id));

  const isDemoAccount = Boolean(
    currentUser?.id?.startsWith('usr_demo') ||
    currentUser?.email === 'sarah.jenkins@ucsf.edu' ||
    currentUser?.email === 'sarah@example.com'
  );

  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || (isDemoAccount ? 'Sarah Jenkins' : 'Travel Clinician');
  const displayEmail = currentUser?.email || verificationData?.workEmail || '';
  const initials = displayName
    .split(' ')
    .map((w: string) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase() || 'RN';

  const userIsVerified = isVerified || currentUser?.isNurseVerified || verificationData?.licenseStatus === 'verified' || false;

  const activeContractTitle = activeBookings.length > 0
    ? `Active Assignment: ${activeBookings[0].hospitalName || 'Clinical Rotation'} (${activeBookings[0].durationWeeks || 13} Weeks) • Shift Rotation`
    : 'No active clinical stays booked yet · Browse shift-ready housing near your hospital';

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
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#0B2559] to-[#0A6FA8] text-white flex items-center justify-center font-bold text-xl shadow-sm ring-2 ring-[#005684]">
                {initials}
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className={`absolute inline-flex h-full w-full rounded-full ${userIsVerified ? 'bg-[#195b4c]' : 'bg-[#B9822E]'} opacity-75`}></span>
                <span className={`relative inline-flex rounded-full h-4 w-4 ${userIsVerified ? 'bg-[#195b4c]' : 'bg-[#B9822E]'}`}></span>
              </span>
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-1">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  {displayName}{currentUser?.role === 'nurse' ? ', RN' : ''}
                </h1>
                {userIsVerified ? (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight shadow-2xs"
                    style={{ backgroundColor: '#E1EFE9', color: '#2F6E5E' }}
                  >
                    <span className="material-symbols-outlined text-[15px]">verified_user</span>
                    <span>Nurses Pillow Verified</span>
                  </span>
                ) : (
                  <span
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold tracking-tight shadow-2xs cursor-pointer"
                    style={{ backgroundColor: '#FBF0D6', color: '#B9822E' }}
                    onClick={onGoToVerification}
                    title="Click to complete verification"
                  >
                    <span className="material-symbols-outlined text-[15px]">pending</span>
                    <span>Verification Pending</span>
                  </span>
                )}
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
                {activeContractTitle}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={handleSyncRecords}
              disabled={isDataLoading}
              title="Sync clinician credentials, calendar and active bookings"
              className="px-3.5 py-2.5 rounded-full border border-[rgba(11,37,89,0.12)] dark:border-[#233550] bg-white dark:bg-[#111e33] text-[#001848] dark:text-gray-200 hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-50 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840] font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
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
              <div className="font-bold text-sm">
                {activeBookings.length} Active {activeBookings.length === 1 ? 'Stay' : 'Stays'}
              </div>
              <div className="text-[11px] text-gray-500">
                {activeBookings.length > 0 ? (activeBookings[0].listingTitle.slice(0, 22) + '...') : 'No active stay'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#14233a]">
            <span className="material-symbols-outlined text-[#745b0d] dark:text-[#ffdf91] text-[22px]">bookmark</span>
            <div>
              <div className="font-bold text-sm">{savedListingIds.length} Saved Pillows</div>
              <div className="text-[11px] text-gray-500">
                {savedListingIds.length > 0 ? 'Favorites saved' : '0 saved'}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#14233a]">
            <span className={`material-symbols-outlined ${userIsVerified ? 'text-[#195b4c] dark:text-[#aff0db]' : 'text-[#B9822E] dark:text-[#ffdf91]'} text-[22px]`}>
              {userIsVerified ? 'verified_user' : 'pending'}
            </span>
            <div>
              <div className="font-bold text-sm">{userIsVerified ? '100% Verified' : 'Pending Verification'}</div>
              <div className="text-[11px] text-gray-500">{userIsVerified ? 'ID, Phone, RN License' : 'Action Needed'}</div>
            </div>
          </div>
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-[#f2f3ff] dark:bg-[#14233a]">
            <span className="material-symbols-outlined text-[#005684] dark:text-[#93ccff] text-[22px]">savings</span>
            <div>
              <div className="font-bold text-sm">${activeBookings.length * 280} Saved</div>
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
          {messages.length > 0 && (
            <span className="px-1.5 py-0.5 rounded-full bg-[#0A6FA8] text-white text-[10px] font-bold tabular-nums">
              {messages.length}
            </span>
          )}
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
      {activeTab === 'current' && activeBookings.length > 0 && (
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
                <span>1.2 mi • 8 min transit to {activeBookings[0].hospitalName?.split(' ')[0] || 'Hospital'}</span>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
              {/* Photo & Badge */}
              <div className="lg:col-span-5 relative rounded-2xl overflow-hidden aspect-[4/3] shadow-md group">
                <img
                  src={
                    allListings.find((l) => l.id === activeBookings[0].listingId)?.images[0] ||
                    "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&w=1200&q=80"
                  }
                  alt={activeBookings[0].listingTitle || "Sanctuary bedroom"}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-white text-xs font-bold flex items-center gap-1">
                  <span className="material-symbols-outlined text-[14px] text-[#ffdf91]">stars</span>
                  <span>Soundproof Certified 52dB</span>
                </div>
                <div className="absolute bottom-3 left-3 right-3 text-white bg-gradient-to-t from-black/80 to-transparent p-3 rounded-xl">
                  <div className="text-sm font-bold truncate">{activeBookings[0].listingTitle}</div>
                  <div className="text-xs opacity-90">Verified Sanctuary • Day Sleeper Quiet Certified</div>
                </div>
              </div>

              {/* Info & Host */}
              <div className="lg:col-span-7 flex flex-col justify-between h-full gap-4">
                <div>
                  <span className="text-xs font-bold text-[#005684] dark:text-[#93ccff] uppercase tracking-wider block mb-1">
                    {activeBookings[0].hospitalName} {activeBookings[0].unitSpecialty ? `(${activeBookings[0].unitSpecialty})` : ''}
                  </span>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight mb-2">
                    {activeBookings[0].listingTitle}
                  </h2>
                  <p className="text-xs text-[#404850] dark:text-[#c0c7d1] flex items-center gap-1.5 mb-4">
                    <span className="material-symbols-outlined text-[16px] text-[#005684]">calendar_month</span>
                    <span>
                      {activeBookings[0].startDate} – {activeBookings[0].endDate} ({activeBookings[0].durationWeeks}-Week Contract)
                    </span>
                  </p>

                  {/* Host Quick Strip */}
                  <div className="p-3.5 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-[#0A6FA8]/15 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center font-bold text-sm shrink-0">
                        <span className="material-symbols-outlined text-[22px]">real_estate_agent</span>
                      </div>
                      <div>
                        <div className="text-xs font-bold">Hosted by Verified Property Host</div>
                        <div className="text-[11px] text-gray-500">Verified Sanctuary Host • Daytime Quiet Certified</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setActiveTab('messages')}
                      className="px-3 py-1.5 rounded-lg bg-white dark:bg-[#111e33] text-xs font-bold text-[#005684] dark:text-[#93ccff] shadow-xs hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-50 cursor-pointer"
                    >
                      Message Host
                    </button>
                  </div>
                </div>

                {/* Keyless Credentials Vault */}
                <div className="p-4 rounded-2xl bg-[#eaedff]/60 dark:bg-[#15233a] border border-[#005684]/20 space-y-3 transition-all duration-200 ease-in-out animate-fadeIn">
                  <div className="flex flex-wrap items-center justify-between gap-2 text-xs font-bold">
                    <div className="flex items-center gap-1.5 text-[#001848] dark:text-white">
                      <span className="material-symbols-outlined text-[18px] text-[#005684]">key</span>
                      <span>Keyless Smartlock &amp; Wi-Fi Credentials</span>
                    </div>
                    <span className="text-[11px] text-[#195b4c] dark:text-[#aff0db] font-semibold bg-[#195b4c]/10 px-2 py-0.5 rounded-full">
                      Active Door Lock PIN
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                    <div className="p-3 rounded-xl bg-white dark:bg-[#111e33] flex items-center justify-between shadow-xs">
                      <div>
                        <div className="text-[10px] text-gray-500 uppercase">Front Gate &amp; Suite Door PIN</div>
                        <div className="font-mono text-base font-bold tracking-wider">
                          {activeBookings[0].doorCode?.replace(/[^0-9]/g, '') || '4821'}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(activeBookings[0].doorCode?.replace(/[^0-9]/g, '') || '4821', 'pin')}
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
                        <div className="font-bold text-sm truncate">
                          {activeBookings[0].wifiNetwork || 'Sanctuary-Clinician-5G'}
                        </div>
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
                    <span>Property host notified of 4-week contract extension request!</span>
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

          {/* Upcoming Reservations Card - Render only if multiple bookings exist */}
          {activeBookings.length > 1 && (
            <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#745b0d] dark:text-[#ffdf91]">flight_takeoff</span>
                  <h3 className="text-lg font-bold">Upcoming Contract Stays</h3>
                </div>
                <span className="text-xs text-gray-500">Upcoming Assignment</span>
              </div>

              <div className="space-y-3">
                {activeBookings.slice(1).map((booking) => (
                  <div
                    key={booking.id}
                    className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex flex-col sm:flex-row sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-16 h-16 rounded-xl bg-[#0A6FA8]/10 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center shrink-0">
                        <span className="material-symbols-outlined text-[28px]">apartment</span>
                      </div>
                      <div>
                        <span className="px-2.5 py-0.5 rounded-full bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db] text-[10px] font-bold uppercase tracking-wider mb-1 inline-block">
                          {booking.status === 'approved' ? 'Host Approved' : 'Pending Host Review'}
                        </span>
                        <h4 className="text-sm font-bold">{booking.listingTitle}</h4>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {booking.hospitalName} • {booking.startDate} – {booking.endDate} ({booking.durationWeeks} wks)
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
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
              clinicianName={`${displayName}${currentUser?.role === 'nurse' ? ', RN' : ''}`}
              clinicianTitle={verificationData?.professionSpecialty || (isDemoAccount ? "Registered Nurse (RN) - Travel ICU/Telemetry" : "Registered Nurse (RN)")}
              verificationTimestamp={userIsVerified ? "September 2026" : "Verification In Progress"}
              stateBoard={verificationData?.issuingStateBoard || (isDemoAccount ? "California & North Carolina State Boards" : "State Board of Nursing")}
              titleBadge={userIsVerified ? "Credential Audit Passed" : "Audit In Progress"}
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
                    <label className="text-gray-400 block mb-1">Clinician Name &amp; Contact</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      {displayName} {displayEmail ? `(${displayEmail})` : ''}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Clinical Specialty</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      {verificationData?.professionSpecialty || (isDemoAccount ? 'Registered Nurse (RN) - Travel ICU/Telemetry' : 'Registered Nurse (RN)')}
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
                      {verificationData?.experienceYears
                        ? `${verificationData.experienceYears}+ Years Clinical Experience`
                        : (isDemoAccount ? '6+ Years Level 1 Pediatric Trauma Center' : 'Clinical Experience Verified on File')}
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
                      {verificationData?.travelAgency || (isDemoAccount ? 'Aya Healthcare (Travel Nurse Division)' : 'Direct Placement / Independent')}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Current Healthcare System Assignment</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      {activeBookings.length > 0
                        ? activeBookings[0].hospitalName
                        : (verificationData?.contractHospital || 'No active assignment selected')}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Active Contract Rotation</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      {activeBookings.length > 0
                        ? `${activeBookings[0].durationWeeks}-Week Contract`
                        : (verificationData?.contractHospital ? '13-Week Standard Rotation' : 'No active contract')}
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
                      {verificationData?.emergencyContact || (verificationData?.mobilePhone ? `Phone: ${verificationData.mobilePhone}` : (isDemoAccount ? '+1 (919) 555-0198' : 'Clinical Emergency Contact On File'))}
                    </div>
                  </div>
                  <div>
                    <label className="text-gray-400 block mb-1">Unit Clinical Supervisor</label>
                    <div className="font-semibold text-[#001848] dark:text-white">
                      {verificationData?.supervisorContact || (isDemoAccount ? 'Nursing Operations Admin • On-Call' : 'Unit Clinical Supervisor • On File')}
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


      {activeTab === 'current' && activeBookings.length === 0 && (
        <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-12 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col items-center justify-center text-center animate-fadeIn">
          <div className="w-20 h-20 rounded-full bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-center mb-6">
            <span className="material-symbols-outlined text-[32px] text-[#005684] dark:text-[#93ccff]">
              luggage
            </span>
          </div>
          <h2 className="text-xl font-bold mb-2">No active sanctuary stays</h2>
          <p className="text-sm text-gray-500 max-w-md mb-8">
            You don't have any current or upcoming bookings. Explore our vetted listings to find your next assignment sanctuary.
          </p>
          <button
            onClick={onGoToHousing}
            className="px-6 py-3 rounded-full bg-[#001848] text-white text-sm font-bold hover:bg-[#162e62] transition-colors focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] cursor-pointer"
          >
            Explore Listings
          </button>
        </div>
      )}

      {/* TAB 2: My Saved Pillows */}
      {activeTab === 'saved' && (
        <div className="space-y-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold">Saved Pillows</h2>
              <p className="text-xs text-gray-500">Saved favorites for upcoming travel contract rotations</p>
            </div>
            <button
              type="button"
              onClick={onGoToHousing}
              className="px-4 py-2 rounded-full bg-[#001848] text-white text-xs font-bold cursor-pointer hover:bg-[#162e62]"
            >
              Search housing
            </button>
          </div>

          {savedListings.length === 0 ? (
            <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-12 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex flex-col items-center justify-center text-center">
              <div className="w-16 h-16 rounded-full bg-[#EFF6FB] dark:bg-[#182840] flex items-center justify-center mb-4 text-[#0A6FA8] dark:text-[#3E9AD1]">
                <span className="material-symbols-outlined text-[28px]">bookmark</span>
              </div>
              <h3 className="text-base font-bold text-[#0B2559] dark:text-white mb-1">
                No saved pillows yet
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mb-6">
                Tap the pillow icon on any shift-ready sanctuary to save and compare commute times to your hospital.
              </p>
              <button
                type="button"
                onClick={onGoToHousing}
                className="px-5 py-2.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Search housing
              </button>
            </div>
          ) : (
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
                      <div className="absolute top-2.5 right-2.5">
                        <PillowSaveButton
                          isSaved={true}
                          onToggle={() => onToggleSave(listing.id)}
                          size={16}
                          className="w-8 h-8 rounded-full bg-white/90 dark:bg-black/80 flex items-center justify-center shadow-sm"
                        />
                      </div>
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
          )}
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
              clinicianName={`${displayName}${currentUser?.role === 'nurse' ? ', RN' : ''}`}
              clinicianTitle={verificationData?.professionSpecialty || (isDemoAccount ? "Registered Nurse • PICU Specialty" : "Registered Nurse")}
              verificationTimestamp={userIsVerified ? "September 2026" : "Verification in Progress"}
              stateBoard={verificationData?.issuingStateBoard || (isDemoAccount ? "California & North Carolina State Boards" : "State Board of Nursing")}
              titleBadge={userIsVerified ? "Primary Source Registry Verified" : "Verification in Progress"}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#005684]/10 dark:bg-[#005684]/20 flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                    <span className="material-symbols-outlined text-[20px]">badge</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs">Stripe Identity (ID &amp; Bio Selfie)</div>
                    <div className="text-[11px] text-gray-500">
                      {userIsVerified || verificationData?.idVerified ? 'Government RealID Verified' : 'Government RealID Verification'}
                    </div>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={userIsVerified || verificationData?.idVerified ? { backgroundColor: '#E1EFE9', color: '#2F6E5E' } : { backgroundColor: '#FBF0D6', color: '#B9822E' }}
                >
                  {userIsVerified || verificationData?.idVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#005684]/10 dark:bg-[#005684]/20 flex items-center justify-center text-[#005684] dark:text-[#93ccff]">
                    <span className="material-symbols-outlined text-[20px]">phonelink_ring</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs">Twilio Shift Carrier Token</div>
                    <div className="text-[11px] text-gray-500">
                      {verificationData?.mobilePhone
                        ? `${verificationData.mobilePhone} Verified`
                        : (isDemoAccount ? '+1 (919) 555-0198 Verified' : 'SMS Phone Verification Pending')}
                    </div>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={verificationData?.phoneVerified || userIsVerified ? { backgroundColor: '#E1EFE9', color: '#2F6E5E' } : { backgroundColor: '#FBF0D6', color: '#B9822E' }}
                >
                  {verificationData?.phoneVerified || userIsVerified ? 'Verified' : 'Pending'}
                </span>
              </div>

              <div className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#2F6E5E]/15 dark:bg-[#2F6E5E]/25 flex items-center justify-center text-[#2F6E5E] dark:text-[#aff0db]">
                    <span className="material-symbols-outlined text-[20px]">health_and_safety</span>
                  </div>
                  <div>
                    <div className="font-bold text-xs">Official Primary Source Registry &amp; State</div>
                    <div className="text-[11px] text-gray-500">
                      {userIsVerified ? 'Active, Clear & Unencumbered Standing' : 'Registry Review in Progress'}
                    </div>
                  </div>
                </div>
                <span
                  className="px-2.5 py-1 rounded-full text-[11px] font-bold"
                  style={userIsVerified ? { backgroundColor: '#E1EFE9', color: '#2F6E5E' } : { backgroundColor: '#FBF0D6', color: '#B9822E' }}
                >
                  {userIsVerified ? 'Active' : 'Pending'}
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
                <span className="text-xs font-bold text-[#005684] dark:text-[#93ccff]">
                  {userIsVerified ? 'Eligible' : 'Pending'}
                </span>
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
              <div className="w-10 h-10 rounded-full bg-[#0A6FA8]/10 text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center font-bold text-sm shrink-0">
                <span className="material-symbols-outlined text-[20px]">
                  {activeBookings.length > 0 ? 'real_estate_agent' : 'support_agent'}
                </span>
              </div>
              <div>
                <div className="text-sm font-bold">
                  {activeBookings.length > 0
                    ? `Host Communication • ${activeBookings[0].listingTitle}`
                    : 'Sanctuary Host & Shift Support'}
                </div>
                <div className="text-[11px] text-gray-500">
                  {activeBookings.length > 0
                    ? `${activeBookings[0].hospitalName} • Verified Sanctuary Channel`
                    : 'Direct messaging with your property host'}
                </div>
              </div>
            </div>
            <span className="text-xs text-[#195b4c] dark:text-[#aff0db] font-semibold flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-[#195b4c]"></span>
              <span>Active Channel</span>
            </span>
          </div>

          {/* Thread messages or Empty State */}
          <div className="flex-1 overflow-y-auto py-4 space-y-3">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3 animate-fadeIn">
                <div className="w-16 h-16 rounded-full bg-[#EFF6FB] dark:bg-[#182840] text-[#0A6FA8] dark:text-[#3E9AD1] flex items-center justify-center">
                  <span className="material-symbols-outlined text-[30px]">chat_bubble_outline</span>
                </div>
                <div>
                  <h3 className="text-base font-bold text-[#0B2559] dark:text-white">
                    No messages yet
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 max-w-sm mt-1 leading-relaxed">
                    {activeBookings.length > 0
                      ? `Coordinate keyless check-in, daytime quiet hours, or blackout amenities directly with your host.`
                      : `When you request or book a furnished sanctuary near your hospital, direct messaging with your host will appear here.`}
                  </p>
                </div>
                {activeBookings.length === 0 && (
                  <button
                    type="button"
                    onClick={onGoToHousing}
                    className="mt-2 px-5 py-2.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold transition-colors cursor-pointer"
                  >
                    Search housing
                  </button>
                )}
              </div>
            ) : (
              messages.map((m, idx) => (
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
              ))
            )}
          </div>

          {/* Form */}
          <form onSubmit={handleSendMessage} className="pt-3 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex items-center gap-2">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder={activeBookings.length > 0 ? "Type message to your host..." : "Type message..."}
              className="flex-1 px-4 py-2.5 rounded-full bg-[#f2f3ff] dark:bg-[#182840] text-xs focus:outline-none focus:ring-1 focus:ring-[#005684]"
            />
            <button
              type="submit"
              disabled={!newMessage.trim()}
              className="px-5 py-2.5 rounded-full bg-[#001848] text-white text-xs font-bold hover:bg-[#162e62] disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              Send
            </button>
          </form>
        </div>
      )}

      {/* TAB 5: Receipts & History */}
      {activeTab === 'receipts' && (
        <div className="space-y-6">
          <div className="bg-white dark:bg-[#0B1626] rounded-3xl p-6 sm:p-8 shadow-sm border border-[rgba(11,37,89,0.08)] dark:border-[#233550]">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
              <div>
                <h2 className="text-xl font-bold">GSA Per Diem &amp; Tax Home Ledger</h2>
                <p className="text-xs text-gray-500">IRS-compliant duplicate lodging expense records</p>
              </div>
              {(activeBookings.length > 0 || isDemoAccount) && (
                <button
                  type="button"
                  onClick={() => alert('Exporting full IRS travel tax packet (PDF)...')}
                  className="px-4 py-2 rounded-full bg-[#001848] text-white text-xs font-bold flex items-center gap-1.5 cursor-pointer hover:bg-[#0A6FA8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] transition-colors"
                >
                  <span className="material-symbols-outlined text-[16px]">file_download</span>
                  <span>Export Tax Packet</span>
                </button>
              )}
            </div>

            {!isDemoAccount && activeBookings.length === 0 ? (
              <div className="py-12 flex flex-col items-center justify-center text-center">
                <div className="w-16 h-16 rounded-full bg-[#EFF6FB] dark:bg-[#182840] flex items-center justify-center mb-4 text-[#0A6FA8] dark:text-[#3E9AD1]">
                  <span className="material-symbols-outlined text-[30px]">receipt_long</span>
                </div>
                <h3 className="text-base font-bold text-[#0B2559] dark:text-white mb-1">
                  No receipts or lodging records yet
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 max-w-md mb-6 leading-relaxed">
                  When you book and complete contract stays through Nurses Pillow, IRS-compliant lodging expense records, GSA per diem tracking, and tax home documentation will be generated here automatically.
                </p>
                <button
                  type="button"
                  onClick={onGoToHousing}
                  className="px-5 py-2.5 rounded-full bg-[#0A6FA8] hover:bg-[#0C7EBF] text-white text-xs font-bold transition-colors cursor-pointer"
                >
                  Search housing
                </button>
              </div>
            ) : activeBookings.length > 0 ? (
              <>
                <div className="p-4 rounded-2xl bg-[#eaedff]/60 dark:bg-[#15233a] border border-[#005684]/20 space-y-2 text-xs mb-6">
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>{activeBookings[0].hospitalName} Contract Lodging Per Diem Cap:</span>
                    <span className="font-bold text-black dark:text-white">
                      ${((activeBookings[0].monthlyRent || 2000) * 1.35).toFixed(2)} / mo
                    </span>
                  </div>
                  <div className="flex justify-between text-gray-600 dark:text-gray-300">
                    <span>{activeBookings[0].listingTitle} Actual Contract Rate:</span>
                    <span className="font-bold text-[#195b4c] dark:text-[#aff0db]">
                      ${(activeBookings[0].monthlyRent || 0).toFixed(2)} / mo
                    </span>
                  </div>
                  <div className="flex justify-between pt-2 border-t border-[rgba(11,37,89,0.08)] dark:border-[#233550] font-bold text-sm text-[#005684] dark:text-[#93ccff]">
                    <span>Untaxed Surplus Retained:</span>
                    <span>
                      +${((activeBookings[0].monthlyRent || 2000) * 0.35).toFixed(2)} / mo in Pocket
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  {activeBookings.map((b, i) => (
                    <div key={b.id || i} className="p-4 rounded-2xl bg-[#f2f3ff] dark:bg-[#182840] flex items-center justify-between text-xs">
                      <div>
                        <div className="font-bold">{b.hospitalName} ({b.unitSpecialty || 'Active Stay'})</div>
                        <div className="text-gray-500">{b.startDate} – {b.endDate} • Invoice #NP-{b.id ? b.id.slice(-6).toUpperCase() : `STAY-${i + 1}`}</div>
                      </div>
                      <div className="text-right">
                        <div className="font-bold">${b.monthlyRent?.toFixed(2)} / mo</div>
                        <span className="text-[11px] text-[#195b4c] font-semibold">
                          {b.status === 'approved' || b.status === 'active' ? 'Paid via Stripe Escrow' : 'Pending Host Approval'}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
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
              </>
            )}
          </div>
        </div>
      )}
        </>
      )}
    </div>
  );
};
