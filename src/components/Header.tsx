import React, { useState, useEffect, useRef } from 'react';
import { NavigationTab, UserRole } from '../types';
import { NursesPillowLogo } from './NursesPillowLogo';

interface HeaderProps {
  topBanner?: React.ReactNode;
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  savedCount: number;
  onOpenSaved: () => void;
  isNightShiftMode: boolean;
  onToggleNightShift: () => void;
  onOpenSupport: () => void;
  isVerified: boolean;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
  currentUser: { role: UserRole; name: string };
  onSwitchRole: (role: UserRole) => void;
  m2BypassMode: boolean;
  onToggleM2Bypass: () => void;
  isDeveloper?: boolean;
  onLogout?: () => void;
  showScreenCodes?: boolean;
  onToggleScreenCodes?: () => void;
}

export const LOGO_URL = '/nurses-pillow-logo.png';

export const Header: React.FC<HeaderProps> = ({
  topBanner,
  currentTab,
  onSelectTab,
  savedCount,
  onOpenSaved,
  isNightShiftMode,
  onToggleNightShift,
  onOpenSupport,
  isVerified,
  onOpenAuth,
  currentUser,
  onSwitchRole,
  m2BypassMode,
  onToggleM2Bypass,
  isDeveloper = false,
  onLogout,
  showScreenCodes = false,
  onToggleScreenCodes,
}) => {
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const headerRef = useRef<HTMLElement>(null);
  const [headerHeight, setHeaderHeight] = useState<number>(72);
  const moreMenuRef = useRef<HTMLDivElement>(null);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  // Track dynamic header height to prevent any clipping of dropdowns or mobile drawers
  useEffect(() => {
    if (!headerRef.current) return;
    const updateHeight = () => {
      if (headerRef.current) {
        setHeaderHeight(headerRef.current.offsetHeight);
      }
    };
    updateHeight();
    const observer = new ResizeObserver(updateHeight);
    observer.observe(headerRef.current);
    window.addEventListener('resize', updateHeight);
    return () => {
      observer.disconnect();
      window.removeEventListener('resize', updateHeight);
    };
  }, []);

  // Close menus on outside click or Escape key
  useEffect(() => {
    function handleClickOutside(event: MouseEvent | TouchEvent) {
      if (moreMenuRef.current && !moreMenuRef.current.contains(event.target as Node)) {
        setIsMoreMenuOpen(false);
      }
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setIsProfileMenuOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setIsMoreMenuOpen(false);
        setIsProfileMenuOpen(false);
        setIsMobileMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, []);

  // Lock body scroll when mobile menu is open to prevent background scrolling
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMobileMenuOpen]);

  // Close mobile navigation drawer if viewport expands to desktop size
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 1024 && isMobileMenuOpen) {
        setIsMobileMenuOpen(false);
      }
    }
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobileMenuOpen]);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'nurse':
        return 'Clinician';
      case 'host':
        return 'Property Host';
      case 'super_admin':
        return 'Super-Admin';
      case 'developer':
        return 'Developer';
      case 'guest':
        return 'Guest Traveler';
    }
  };

  const getRoleInitials = (role: UserRole) => {
    switch (role) {
      case 'nurse':
        return 'SJ';
      case 'host':
        return 'MV';
      case 'super_admin':
        return 'OA';
      case 'developer':
        return 'JD';
      case 'guest':
        return 'GT';
    }
  };

  const getRoleColorStyles = (role: UserRole) => {
    switch (role) {
      case 'nurse':
        return {
          badge: 'bg-[#195b4c]/10 text-[#195b4c] dark:bg-[#aff0db]/15 dark:text-[#aff0db]',
          avatar: 'bg-[#195b4c] text-white',
        };
      case 'host':
        return {
          badge: 'bg-[#005684]/10 text-[#005684] dark:bg-[#93ccff]/15 dark:text-[#93ccff]',
          avatar: 'bg-[#005684] text-white',
        };
      case 'super_admin':
        return {
          badge: 'bg-amber-500/15 text-amber-800 dark:text-amber-300',
          avatar: 'bg-amber-600 text-white',
        };
      case 'developer':
        return {
          badge: 'bg-purple-500/15 text-purple-800 dark:text-purple-300',
          avatar: 'bg-purple-700 text-white',
        };
      case 'guest':
        return {
          badge: 'bg-gray-500/15 text-gray-700 dark:text-gray-300',
          avatar: 'bg-gray-500 text-white',
        };
    }
  };

  const roleStyles = getRoleColorStyles(currentUser.role);

  return (
    <header
      ref={headerRef}
      className={`sticky top-0 z-50 w-full transition-colors duration-200 ${
        isNightShiftMode
          ? 'bg-[#0B1626]/95 backdrop-blur-md border-b border-[#233550] shadow-[0_4px_24px_rgba(0,0,0,0.5)] text-[#E6ECF7]'
          : 'bg-white/95 backdrop-blur-md border-b border-[rgba(11,37,89,0.08)] shadow-[0_4px_24px_rgba(11,37,89,0.04)] text-[#001848]'
      }`}
    >
      {topBanner}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Lockup */}
        <button
          onClick={() => onSelectTab('find-housing')}
          className="flex items-center gap-2 sm:gap-3 min-w-0 shrink text-left focus:outline-none group cursor-pointer"
          type="button"
          aria-label="Go to Nurses Pillow homepage"
        >
          <NursesPillowLogo size={32} className="h-8 w-8 sm:h-9 sm:w-9 shrink-0 transition-transform group-hover:scale-105" />
          <div className="flex flex-col min-w-0">
            <span
              className={`text-[17px] sm:text-[20px] font-bold tracking-tight leading-tight transition-colors truncate ${
                isNightShiftMode ? 'text-white' : 'text-[#001848]'
              }`}
            >
              Nurses Pillow
            </span>
            <span
              className="hidden sm:block text-[#745b0d] dark:text-[#ffdf91] text-[13px] sm:text-[14px] leading-none"
              style={{ fontFamily: "'Kaushan Script', cursive" }}
            >
              Rest Well. Heal Better.
            </span>
          </div>
        </button>

        {/* Desktop Primary Navigation - Streamlined & Reduced Density */}
        <nav className="hidden lg:flex items-center gap-1 xl:gap-2">
          <button
            onClick={() => onSelectTab('find-housing')}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 ease-in-out cursor-pointer ${
              currentTab === 'find-housing'
                ? isNightShiftMode
                  ? 'bg-[#182840] text-[#93ccff] font-bold'
                  : 'bg-[#eaedff] text-[#005684] font-bold'
                : isNightShiftMode
                ? 'text-[#c0c7d1] hover:text-white hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/5'
                : 'text-[#404850] hover:text-[#001848] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100/80'
            }`}
          >
            {showScreenCodes && (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[10px] mr-1.5 font-bold">
                [HL-01]
              </span>
            )}
            <span>Explore Stays</span>
          </button>

          <button
            onClick={() => onSelectTab('search-listings')}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 ease-in-out cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'search-listings'
                ? isNightShiftMode
                  ? 'bg-[#182840] text-[#93ccff] font-bold'
                  : 'bg-[#eaedff] text-[#005684] font-bold'
                : isNightShiftMode
                ? 'text-[#c0c7d1] hover:text-white hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/5'
                : 'text-[#404850] hover:text-[#001848] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100/80'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">travel_explore</span>
            {showScreenCodes && (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                [HL-02]
              </span>
            )}
            <span>Search &amp; Map</span>
          </button>

          <button
            onClick={() => {
              if (currentUser.role === 'host') {
                onSelectTab('host-dashboard');
              } else {
                onSelectTab('for-hosts');
              }
            }}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 ease-in-out cursor-pointer flex items-center gap-1.5 ${
              currentTab === 'for-hosts' || currentTab === 'host-dashboard'
                ? isNightShiftMode
                  ? 'bg-[#005684]/25 text-[#93ccff] font-bold'
                  : 'bg-[#eaedff] text-[#005684] font-bold'
                : isNightShiftMode
                ? 'text-[#c0c7d1] hover:text-white hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/5'
                : 'text-[#404850] hover:text-[#001848] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100/80'
            }`}
          >
            <span className="material-symbols-outlined text-[17px]">home</span>
            {showScreenCodes && (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                [H-01]
              </span>
            )}
            <span>For Property Hosts</span>
          </button>

          <button
            onClick={() => onSelectTab('how-it-works')}
            className={`px-3.5 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 ease-in-out cursor-pointer ${
              currentTab === 'how-it-works'
                ? isNightShiftMode
                  ? 'bg-[#182840] text-[#93ccff] font-bold'
                  : 'bg-[#eaedff] text-[#005684] font-bold'
                : isNightShiftMode
                ? 'text-[#c0c7d1] hover:text-white hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/5'
                : 'text-[#404850] hover:text-[#001848] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100/80'
            }`}
          >
            {showScreenCodes && (
              <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[10px] mr-1.5 font-bold">
                [P-01]
              </span>
            )}
            <span>How It Works</span>
          </button>

          {/* More Menu Dropdown */}
          <div className="relative" ref={moreMenuRef}>
            <button
              type="button"
              onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
              className={`px-3 py-2 rounded-xl text-xs xl:text-sm font-semibold transition-all duration-200 ease-in-out flex items-center gap-1 cursor-pointer ${
                isMoreMenuOpen
                  ? isNightShiftMode
                    ? 'bg-[#182840] text-white'
                    : 'bg-gray-100 text-[#001848]'
                  : isNightShiftMode
                  ? 'text-[#c0c7d1] hover:text-white hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/5'
                  : 'text-[#404850] hover:text-[#001848] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100/80'
              }`}
            >
              <span>More</span>
              <span className="material-symbols-outlined text-[18px] transition-transform duration-200">
                {isMoreMenuOpen ? 'expand_less' : 'expand_more'}
              </span>
            </button>

            {isMoreMenuOpen && (
              <div className="absolute left-0 mt-2 w-72 rounded-2xl bg-white dark:bg-[#0E1A2E] border border-gray-200 dark:border-[#233550] shadow-2xl p-2 z-50 text-xs max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain">
                {/* Section 1: Healthcare & Verification */}
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Healthcare Directory &amp; Licenses
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('verified-hospitals');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#005684] dark:text-[#93ccff]">
                    local_hospital
                  </span>
                  <div>
                    <div className="font-bold text-[#001848] dark:text-white flex items-center gap-1.5">
                      {showScreenCodes && (
                        <span className="font-mono text-[10px] text-purple-600 dark:text-purple-300 font-bold">
                          [HOS-01]
                        </span>
                      )}
                      <span>Verified Hospitals Directory</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">NC trauma centers &amp; teaching systems</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('verification');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#195b4c] dark:text-[#aff0db]">
                    verified_user
                  </span>
                  <div>
                    <div className="font-bold text-[#001848] dark:text-white flex items-center gap-1.5">
                      {showScreenCodes && (
                        <span className="font-mono text-[10px] text-purple-600 dark:text-purple-300 font-bold">
                          [C-01]
                        </span>
                      )}
                      <span>Clinician Credentialing</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">Nursys compact &amp; license verification</div>
                  </div>
                </button>

                {/* Section 2: Standards & Protections */}
                <div className="my-1.5 border-t border-gray-100 dark:border-[#1e3048]"></div>
                <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  Standards &amp; Reliability
                </div>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('legal-policies');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-[#005684] dark:text-[#93ccff]">
                    policy
                  </span>
                  <div>
                    <div className="font-bold text-[#001848] dark:text-white flex items-center gap-1.5">
                      {showScreenCodes && (
                        <span className="font-mono text-[10px] text-purple-600 dark:text-purple-300 font-bold">
                          [P-05]
                        </span>
                      )}
                      <span>Sanctuary Standards &amp; Policies</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">Quiet guarantee, contract flex &amp; auto-purge</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSelectTab('system-status');
                    setIsMoreMenuOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840] flex items-center gap-2.5 transition-colors cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">
                    dns
                  </span>
                  <div>
                    <div className="font-bold text-[#001848] dark:text-white flex items-center gap-1.5">
                      {showScreenCodes && (
                        <span className="font-mono text-[10px] text-purple-600 dark:text-purple-300 font-bold">
                          [P-12]
                        </span>
                      )}
                      <span>Platform Reliability &amp; Status</span>
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">Live uptime &amp; system health metrics</div>
                  </div>
                </button>

                {/* Section 3: Developer Tools - STRICTLY SHOWN ONLY IF isDeveloper IS TRUE */}
                {isDeveloper && (
                  <>
                    <div className="my-1.5 border-t border-gray-100 dark:border-[#1e3048]"></div>
                    <div className="px-3 py-1.5 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                      <span>Developer Deliverables</span>
                      <span className="px-1.5 py-0.5 rounded text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono">
                        Dev Access
                      </span>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('mobile-preview');
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-purple-600 dark:text-purple-400">
                          smartphone
                        </span>
                        <span className="font-medium text-[#001848] dark:text-white">Mobile Native App</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold">
                        Milestone 2
                      </span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        onSelectTab('phase1-inventory');
                        setIsMoreMenuOpen(false);
                      }}
                      className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840] flex items-center justify-between transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-purple-600 dark:text-purple-400">
                          integration_instructions
                        </span>
                        <span className="font-medium text-[#001848] dark:text-white">Product Scope &amp; Screens</span>
                      </div>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold">
                        Developer
                      </span>
                    </button>

                    <div className="mt-1 pt-2 border-t border-gray-100 dark:border-[#1e3048] px-3 pb-1 flex items-center justify-between">
                      <span className="text-[11px] font-bold text-gray-600 dark:text-gray-300">
                        Milestone 2 Scope
                      </span>
                      <button
                        type="button"
                        onClick={onToggleM2Bypass}
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold transition-all duration-200 ease-in-out cursor-pointer ${
                          m2BypassMode
                            ? 'bg-purple-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-800 text-gray-600 dark:text-gray-300'
                        }`}
                      >
                        {m2BypassMode ? 'UNLOCKED' : 'GATED'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </div>
        </nav>

        {/* Right Action Cluster - Desktop Utilities & Mobile/Tablet Unified Menu */}
        <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
          {/* Saved Listings Counter (Desktop only; on mobile/tablet accessible via unified menu with badge counter) */}
          <button
            onClick={onOpenSaved}
            type="button"
            aria-label="View saved listings"
            className={`hidden lg:flex relative p-2 sm:p-2.5 rounded-xl transition-all duration-200 ease-in-out cursor-pointer ${
              isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/5'
                : 'text-[#404850] hover:text-[#001848] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100'
            }`}
            title="Saved shift sanctuaries"
          >
            <span className="material-symbols-outlined text-[20px]">bed</span>
            {savedCount > 0 && (
              <span className="absolute 1 top-1 right-1 w-4 h-4 rounded-full bg-[#005684] text-white text-[10px] font-bold flex items-center justify-center shadow-xs">
                {savedCount}
              </span>
            )}
          </button>

          {/* Night Shift Mode Toggle (Desktop only; on mobile/tablet accessible via unified menu) */}
          <button
            onClick={onToggleNightShift}
            type="button"
            aria-label="Toggle Night Shift Mode"
            className={`hidden lg:flex p-1.5 sm:p-2.5 rounded-xl transition-all duration-200 ease-in-out cursor-pointer shrink-0 ${
              isNightShiftMode
                ? 'text-[#ffdf91] hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/5'
                : 'text-[#001848] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100'
            }`}
            title={isNightShiftMode ? 'Switch to Day Shift Mode' : 'Switch to Night Shift Mode (Day-Sleeper Dark)'}
          >
            <span className="material-symbols-outlined text-[18px] sm:text-[20px]">
              {isNightShiftMode ? 'light_mode' : 'dark_mode'}
            </span>
          </button>

          {/* Guest Sign In & Register Buttons or User Profile Capsule (Desktop only; on mobile/tablet unified in drawer menu) */}
          {currentUser.role === 'guest' ? (
            <div className="hidden lg:flex items-center gap-2">
              <button
                type="button"
                onClick={() => onOpenAuth?.('signin')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all duration-200 ease-in-out cursor-pointer ${
                  isNightShiftMode
                    ? 'border-[#233550] text-[#93ccff] hover:bg-white/10 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8]'
                    : 'border-gray-200 text-[#001848] hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8]'
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => onOpenAuth?.('signup')}
                className="px-4 py-2 rounded-xl text-xs font-bold bg-[#001848] dark:bg-[#005684] text-white hover:opacity-90 transition-all duration-200 ease-in-out cursor-pointer shadow-xs focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8]"
              >
                Get Started
              </button>
            </div>
          ) : (
            <div className="hidden lg:flex relative shrink-0" ref={profileMenuRef}>
              <button
                type="button"
                onClick={() => {
                  setIsProfileMenuOpen(!isProfileMenuOpen);
                  setIsMobileMenuOpen(false);
                }}
                className={`flex items-center gap-1.5 sm:gap-2 p-1 sm:pl-2 sm:pr-3 sm:py-1.5 rounded-2xl border transition-all duration-200 ease-in-out cursor-pointer shadow-xs ${
                  isProfileMenuOpen
                    ? isNightShiftMode
                      ? 'bg-[#182840] border-[#005684]'
                      : 'bg-white border-[#005684]'
                    : isNightShiftMode
                    ? 'bg-[#0E1A2E] border-[#233550] hover:border-[#385175]'
                    : 'bg-white border-gray-200 hover:border-gray-300'
                }`}
              >
                {/* Avatar with Verified checkmark */}
                <div className="relative">
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs tracking-tight ${roleStyles.avatar}`}
                  >
                    {getRoleInitials(currentUser.role)}
                  </div>
                  {isVerified && (
                    <span
                      className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-500 border border-white dark:border-[#0E1A2E] flex items-center justify-center shadow-2xs"
                      title="Verified Identity & Clinical Credentials"
                    >
                      <span className="material-symbols-outlined text-[9px] text-white font-bold">check</span>
                    </span>
                  )}
                </div>

                {/* Identity Details (Desktop) */}
                <div className="hidden sm:flex flex-col text-left">
                  <span className="text-xs font-bold leading-tight max-w-[120px] truncate text-[#001848] dark:text-white">
                    {currentUser.name}
                  </span>
                  <span className="text-[10px] font-semibold opacity-70 leading-none flex items-center gap-1">
                    <span>{getRoleLabel(currentUser.role)}</span>
                    {isVerified && (
                      <span className="text-emerald-600 dark:text-emerald-400 font-bold text-[9px]">✓</span>
                    )}
                  </span>
                </div>

                <span className="material-symbols-outlined text-[16px] opacity-60">
                  {isProfileMenuOpen ? 'expand_less' : 'expand_more'}
                </span>
              </button>

              {/* Profile & Perspective Switcher Popover */}
              {isProfileMenuOpen && (
                <>
                  {/* Mobile Backdrop for Profile Popover */}
                  <div
                    className="sm:hidden fixed inset-0 bg-black/40 backdrop-blur-2xs z-40"
                    onClick={() => setIsProfileMenuOpen(false)}
                    aria-hidden="true"
                  />

                  <div
                    className="fixed left-3 right-3 sm:absolute sm:left-auto sm:right-0 sm:top-full sm:mt-2 sm:w-80 max-w-sm sm:max-w-none mx-auto sm:mx-0 rounded-3xl bg-white dark:bg-[#0E1A2E] border border-gray-200 dark:border-[#233550] shadow-2xl p-4 z-50 text-xs space-y-3 max-h-[calc(100vh-6rem)] overflow-y-auto overscroll-contain"
                    style={{ top: typeof window !== 'undefined' && window.innerWidth < 640 ? `${headerHeight + 8}px` : undefined }}
                  >
                  {/* Account Card */}
                  <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#15233a] border border-gray-200/80 dark:border-[#233550] flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-sm ${roleStyles.avatar}`}>
                      {getRoleInitials(currentUser.role)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-bold text-sm truncate text-[#001848] dark:text-white flex items-center gap-1.5">
                        <span className="truncate">{currentUser.name}</span>
                        {isVerified && (
                          <span
                            className="w-4 h-4 rounded-full bg-emerald-500 text-white flex items-center justify-center shrink-0"
                            title="Verified Platform Credentials"
                          >
                            <span className="material-symbols-outlined text-[10px] font-bold">check</span>
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1.5 mt-0.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${roleStyles.badge}`}>
                          {getRoleLabel(currentUser.role)}
                        </span>
                        {isVerified && (
                          <button
                            type="button"
                            onClick={() => {
                              if (currentUser.role === 'nurse') onSelectTab('verification');
                              setIsProfileMenuOpen(false);
                            }}
                            className="text-[10px] text-emerald-600 dark:text-emerald-400 font-semibold flex items-center gap-0.5 hover:underline cursor-pointer"
                          >
                            <span className="material-symbols-outlined text-[12px]">verified</span>
                            <span>Verified Status</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Developer Screen Codes Toggle HUD */}
                  {onToggleScreenCodes && (
                    <div className="p-2.5 rounded-2xl bg-purple-500/10 dark:bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[17px] text-purple-600 dark:text-purple-400">
                          code
                        </span>
                        <div>
                          <div className="text-[11px] font-bold text-purple-900 dark:text-purple-200">
                            Screen Codes [XX-00]
                          </div>
                          <div className="text-[10px] text-gray-500 dark:text-gray-400">
                            {showScreenCodes ? 'Visible (Dev Mode Active)' : 'Clean Client View (Hidden)'}
                          </div>
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={onToggleScreenCodes}
                        className={`px-2.5 py-1 rounded-full text-[10px] font-bold font-mono transition-all duration-200 ease-in-out cursor-pointer ${
                          showScreenCodes
                            ? 'bg-purple-600 text-white shadow-xs'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-300 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-300 dark:hover:bg-gray-600 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-600'
                        }`}
                        title="Toggle Developer Screen Codes in navigation and UI"
                      >
                        {showScreenCodes ? 'ON' : 'OFF'}
                      </button>
                    </div>
                  )}

                  {/* Primary Workspace Action */}
                  <div className="space-y-1">
                    {currentUser.role === 'nurse' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab('nurse-dashboard');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#195b4c] text-white font-bold flex items-center justify-between hover:bg-[#13493c] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#13493c] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">clinical_notes</span>
                          <span>Open Clinician Dashboard</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    )}

                    {currentUser.role === 'host' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab('host-dashboard');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-[#005684] text-white font-bold flex items-center justify-between hover:bg-[#00476d] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#00476d] transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">real_estate_agent</span>
                          <span>Open Host Portal</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    )}

                    {currentUser.role === 'super_admin' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab('admin-portal');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-amber-600 text-white font-bold flex items-center justify-between hover:bg-amber-700 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-amber-700 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">admin_panel_settings</span>
                          <span>Open Admin Operations Hub</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    )}

                    {currentUser.role === 'developer' && (
                      <button
                        type="button"
                        onClick={() => {
                          onSelectTab('phase1-inventory');
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full py-2 px-3 rounded-xl bg-purple-700 text-white font-bold flex items-center justify-between hover:bg-purple-800 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-purple-800 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[18px]">terminal</span>
                          <span>Developer System Specs</span>
                        </div>
                        <span className="material-symbols-outlined text-[16px]">arrow_forward</span>
                      </button>
                    )}
                  </div>

                  {/* Switch Perspective Section */}
                  <div className="pt-2 border-t border-gray-100 dark:border-[#1e3048]">
                    <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 mb-1.5">
                      Switch Perspective
                    </div>
                    <div className="space-y-1">
                      <button
                        type="button"
                        onClick={() => {
                          onSwitchRole('nurse');
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                          currentUser.role === 'nurse'
                            ? 'bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db] font-bold'
                            : 'hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">stethoscope</span>
                          <span>Clinician (Sarah Jenkins)</span>
                        </div>
                        {currentUser.role === 'nurse' && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSwitchRole('host');
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                          currentUser.role === 'host'
                            ? 'bg-[#005684]/15 text-[#005684] dark:text-[#93ccff] font-bold'
                            : 'hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">home</span>
                          <span>Property Host (Michael Vance)</span>
                        </div>
                        {currentUser.role === 'host' && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          onSwitchRole('super_admin');
                          setIsProfileMenuOpen(false);
                        }}
                        className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                          currentUser.role === 'super_admin'
                            ? 'bg-amber-500/15 text-amber-700 dark:text-amber-300 font-bold'
                            : 'hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[16px]">shield_person</span>
                          <span>Super-Admin Operations</span>
                        </div>
                        {currentUser.role === 'super_admin' && (
                          <span className="material-symbols-outlined text-[14px]">check</span>
                        )}
                      </button>

                      {isDeveloper && (
                        <button
                          type="button"
                          onClick={() => {
                            onSwitchRole('developer');
                            setIsProfileMenuOpen(false);
                          }}
                          className={`w-full text-left px-2.5 py-2 rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                            currentUser.role === 'developer'
                              ? 'bg-purple-500/15 text-purple-700 dark:text-purple-300 font-bold'
                              : 'hover:bg-gray-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-100 dark:hover:bg-[#182840] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#182840]'
                          }`}
                        >
                          <div className="flex items-center gap-2">
                            <span className="material-symbols-outlined text-[16px]">terminal</span>
                            <span>Lead Developer (Joshua)</span>
                          </div>
                          {currentUser.role === 'developer' && (
                            <span className="material-symbols-outlined text-[14px]">check</span>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Support & Auth Modal Trigger */}
                  <div className="pt-2 border-t border-gray-100 dark:border-[#1e3048] flex items-center justify-between">
                    <button
                      type="button"
                      onClick={() => {
                        onOpenSupport();
                        setIsProfileMenuOpen(false);
                      }}
                      className="text-xs opacity-75 hover:opacity-100 hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[15px]">help_outline</span>
                      <span>Support</span>
                    </button>
                    {onOpenAuth && (
                      <button
                        type="button"
                        onClick={() => {
                          onOpenAuth('signin');
                          setIsProfileMenuOpen(false);
                        }}
                        className="text-xs text-[#005684] dark:text-[#93ccff] font-bold hover:underline cursor-pointer"
                      >
                        Switch Account
                      </button>
                    )}
                  </div>

                  {/* Dedicated Log Out Button */}
                  {onLogout && (
                    <div className="pt-2 border-t border-gray-100 dark:border-[#1e3048]">
                      <button
                        type="button"
                        onClick={() => {
                          onLogout();
                          setIsProfileMenuOpen(false);
                        }}
                        className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 font-bold text-xs flex items-center justify-between hover:bg-rose-100 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-rose-100 dark:hover:bg-rose-900 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-rose-900/50 transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span className="material-symbols-outlined text-[17px]">logout</span>
                          <span>Log Out</span>
                        </div>
                        <span className="text-[10px] opacity-75 font-normal">Switch to Guest</span>
                      </button>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>
        )}

          {/* Mobile & Tablet Unified Menu Toggle Button - Pinned with Saved Counter Badge */}
          <button
            id="mobile-menu-toggle-button"
            onClick={() => {
              setIsMobileMenuOpen(!isMobileMenuOpen);
            }}
            type="button"
            className={`lg:hidden shrink-0 relative flex items-center gap-1.5 sm:gap-2 px-2.5 py-1.5 sm:px-3 sm:py-2 rounded-xl transition-all duration-200 ease-in-out cursor-pointer border ${
              isMobileMenuOpen
                ? isNightShiftMode
                  ? 'bg-[#182840] border-[#005684] text-[#93ccff]'
                  : 'bg-[#eaedff] border-[#005684] text-[#005684]'
                : isNightShiftMode
                ? 'bg-[#15233a] border-[#233550] text-[#E6ECF7] hover:bg-[#1e3250]'
                : 'bg-gray-100 border-gray-200 text-[#001848] hover:bg-gray-200'
            } focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8]`}
            aria-label={isMobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={isMobileMenuOpen}
            aria-controls="mobile-nav-menu"
          >
            <span className="material-symbols-outlined text-[20px] sm:text-[22px] leading-none transition-transform duration-200">
              {isMobileMenuOpen ? 'close' : 'menu'}
            </span>
            <span className="text-xs font-bold">
              {isMobileMenuOpen ? 'Close' : 'Menu'}
            </span>
            {savedCount > 0 && (
              <span
                className="px-1.5 py-0.2 rounded-full bg-[#005684] text-white text-[10px] font-bold leading-tight flex items-center justify-center shadow-xs"
                title={`${savedCount} saved shift sanctuaries`}
              >
                {savedCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Responsive Navigation Drawer / Dropdown Panel */}
      <div
        id="mobile-nav-menu"
        role="dialog"
        aria-modal="true"
        aria-label="Mobile Navigation Menu"
        className={`lg:hidden fixed inset-x-0 bottom-0 z-50 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen
            ? 'opacity-100 pointer-events-auto visible'
            : 'opacity-0 pointer-events-none invisible'
        }`}
        style={{ top: `${headerHeight}px` }}
      >
        {/* Backdrop Overlay with smooth fade */}
        <div
          className={`absolute inset-0 bg-black/60 backdrop-blur-xs transition-opacity duration-300 ease-in-out ${
            isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
          }`}
          onClick={() => setIsMobileMenuOpen(false)}
          aria-hidden="true"
        />

        {/* Sliding / Expanding Container */}
        <div
          className={`relative w-full max-w-lg mx-auto bg-white dark:bg-[#0E1A2E] border-b border-gray-200 dark:border-[#233550] shadow-2xl transition-all duration-300 ease-out transform max-h-[calc(100dvh-${headerHeight + 16}px)] flex flex-col rounded-b-2xl overflow-hidden ${
            isMobileMenuOpen
              ? 'translate-y-0 opacity-100 scale-100'
              : '-translate-y-4 opacity-0 scale-[0.98]'
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Scrollable Content inside Drawer */}
          <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 overscroll-contain">
            {/* 1. Quick Auth / Profile Strip for Mobile */}
            {currentUser.role === 'guest' ? (
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-sky-50 to-blue-50 dark:from-[#13233a] dark:to-[#172b47] border border-blue-100 dark:border-[#233550] flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-xl bg-[#001848] dark:bg-[#005684] text-white flex items-center justify-center shrink-0 shadow-xs">
                    <span className="material-symbols-outlined text-[20px]">person</span>
                  </div>
                  <div>
                    <div className="text-xs font-bold text-[#001848] dark:text-white">
                      Clinician &amp; Host Access
                    </div>
                    <div className="text-[11px] text-gray-500 dark:text-gray-400">
                      Sign in for verified booking &amp; listings
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuth?.('signin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 sm:flex-none py-1.5 px-3.5 rounded-xl border border-gray-300 dark:border-[#233550] text-xs font-bold text-[#001848] dark:text-white bg-white dark:bg-[#0E1A2E] text-center hover:bg-gray-50 dark:hover:bg-[#182840] cursor-pointer"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuth?.('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 sm:flex-none py-1.5 px-3.5 rounded-xl bg-[#001848] dark:bg-[#005684] text-white text-xs font-bold text-center hover:opacity-90 cursor-pointer shadow-xs"
                  >
                    Get Started
                  </button>
                </div>
              </div>
            ) : (
              <div className="p-3 rounded-2xl bg-gray-50 dark:bg-[#15233a] border border-gray-200 dark:border-[#233550] flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs shrink-0 ${roleStyles.avatar}`}>
                    {getRoleInitials(currentUser.role)}
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-[#001848] dark:text-white truncate flex items-center gap-1">
                      <span className="truncate">{currentUser.name}</span>
                      {isVerified && (
                        <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[8px] font-bold shrink-0">
                          ✓
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-500 dark:text-gray-400 flex items-center gap-1">
                      <span className={`px-1.5 py-0.2 rounded font-bold ${roleStyles.badge}`}>
                        {getRoleLabel(currentUser.role)}
                      </span>
                      {isVerified && (
                        <span className="text-emerald-600 dark:text-emerald-400 font-semibold">• Verified</span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Dashboard Shortcut */}
                <button
                  type="button"
                  onClick={() => {
                    if (currentUser.role === 'nurse') onSelectTab('nurse-dashboard');
                    else if (currentUser.role === 'host') onSelectTab('host-dashboard');
                    else if (currentUser.role === 'super_admin') onSelectTab('admin-portal');
                    else if (currentUser.role === 'developer') onSelectTab('phase1-inventory');
                    setIsMobileMenuOpen(false);
                  }}
                  className="px-2.5 py-1.5 rounded-xl bg-[#005684] text-white text-xs font-bold shrink-0 flex items-center gap-1 hover:bg-[#00476d] cursor-pointer shadow-2xs"
                >
                  <span>Dashboard</span>
                  <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                </button>
              </div>
            )}

            {/* 2. PRIMARY NAVIGATION LINKS (Clear, prominent, visible without scrolling) */}
            <div className="space-y-1">
              <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1 flex items-center justify-between">
                <span>Main Navigation</span>
                <span className="text-[9px] text-[#005684] dark:text-[#93ccff] font-semibold">Phase 1 Marketplace</span>
              </div>

              {/* Explore Stays */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab('find-housing');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-150 cursor-pointer ${
                  currentTab === 'find-housing'
                    ? 'bg-[#eaedff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff] shadow-2xs'
                    : 'text-[#001848] dark:text-white hover:bg-gray-100 dark:hover:bg-[#182840]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${
                    currentTab === 'find-housing' ? 'text-[#005684] dark:text-[#93ccff]' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    bed
                  </span>
                  <span>Explore Stays</span>
                </div>
                {showScreenCodes && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                    [HL-01]
                  </span>
                )}
              </button>

              {/* Search & Map */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab('search-listings');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-150 cursor-pointer ${
                  currentTab === 'search-listings'
                    ? 'bg-[#eaedff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff] shadow-2xs'
                    : 'text-[#001848] dark:text-white hover:bg-gray-100 dark:hover:bg-[#182840]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${
                    currentTab === 'search-listings' ? 'text-[#005684] dark:text-[#93ccff]' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    travel_explore
                  </span>
                  <span>Search Stays &amp; Map</span>
                </div>
                {showScreenCodes && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                    [HL-02]
                  </span>
                )}
              </button>

              {/* For Property Hosts */}
              <button
                type="button"
                onClick={() => {
                  if (currentUser.role === 'host') {
                    onSelectTab('host-dashboard');
                  } else {
                    onSelectTab('for-hosts');
                  }
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-150 cursor-pointer ${
                  currentTab === 'for-hosts' || currentTab === 'host-dashboard'
                    ? 'bg-[#005684]/15 text-[#005684] dark:text-[#93ccff] shadow-2xs'
                    : 'text-[#001848] dark:text-white hover:bg-gray-100 dark:hover:bg-[#182840]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${
                    currentTab === 'for-hosts' || currentTab === 'host-dashboard'
                      ? 'text-[#005684] dark:text-[#93ccff]'
                      : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    home
                  </span>
                  <span>For Property Hosts</span>
                </div>
                <div className="flex items-center gap-1.5">
                  {showScreenCodes && (
                    <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                      [H-01]
                    </span>
                  )}
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#005684]/10 text-[#005684] dark:text-[#93ccff] font-bold">
                    {currentUser.role === 'host' ? 'My Portal' : 'Host Info'}
                  </span>
                </div>
              </button>

              {/* How It Works & Quiet Guarantee */}
              <button
                type="button"
                onClick={() => {
                  onSelectTab('how-it-works');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3.5 py-2.5 rounded-xl font-bold text-sm flex items-center justify-between transition-all duration-150 cursor-pointer ${
                  currentTab === 'how-it-works'
                    ? 'bg-[#eaedff] dark:bg-[#182840] text-[#005684] dark:text-[#93ccff] shadow-2xs'
                    : 'text-[#001848] dark:text-white hover:bg-gray-100 dark:hover:bg-[#182840]'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`material-symbols-outlined text-[20px] ${
                    currentTab === 'how-it-works' ? 'text-[#005684] dark:text-[#93ccff]' : 'text-gray-500 dark:text-gray-400'
                  }`}>
                    verified
                  </span>
                  <span>How It Works &amp; Quiet Guarantee</span>
                </div>
                {showScreenCodes && (
                  <span className="px-1.5 py-0.5 rounded bg-purple-500/15 text-purple-700 dark:text-purple-300 font-mono text-[10px] font-bold">
                    [P-01]
                  </span>
                )}
              </button>
            </div>

            {/* 3. DIRECTORY & CLINICAL RESOURCES */}
            <div className="pt-2 border-t border-gray-100 dark:border-[#233550] space-y-1">
              <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 mb-1">
                Directory &amp; Clinical Verification
              </div>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('verified-hospitals');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentTab === 'verified-hospitals'
                    ? 'bg-blue-50 dark:bg-[#182840] text-[#005684] dark:text-[#93ccff] font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#182840]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#005684]">
                    local_hospital
                  </span>
                  <span>Verified Hospitals Directory</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-100 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 font-medium">
                  NC Focus
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('verification');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentTab === 'verification'
                    ? 'bg-emerald-50 dark:bg-[#182840] text-[#195b4c] dark:text-[#aff0db] font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#182840]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-[#195b4c]">
                    verified_user
                  </span>
                  <span>Clinician Credentialing (Nursys)</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-100 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300 font-medium">
                  Step 4
                </span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('legal-policies');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center gap-2.5 transition-colors cursor-pointer ${
                  currentTab === 'legal-policies'
                    ? 'bg-gray-100 dark:bg-[#182840] text-[#001848] dark:text-white font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#182840]'
                }`}
              >
                <span className="material-symbols-outlined text-[18px] text-gray-500">
                  policy
                </span>
                <span>Sanctuary Standards &amp; Policies</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onSelectTab('system-status');
                  setIsMobileMenuOpen(false);
                }}
                className={`w-full text-left px-3 py-2 rounded-xl text-xs font-semibold flex items-center justify-between transition-colors cursor-pointer ${
                  currentTab === 'system-status'
                    ? 'bg-emerald-50 dark:bg-[#182840] text-emerald-800 dark:text-emerald-300 font-bold'
                    : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-[#182840]'
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-[18px] text-emerald-600 dark:text-emerald-400">
                    dns
                  </span>
                  <span>Platform Reliability &amp; Status</span>
                </div>
                <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  Operational
                </span>
              </button>
            </div>

            {/* 4. UTILITIES (Saved & Night Shift Toggle) */}
            <div className="pt-2 border-t border-gray-100 dark:border-[#233550] grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenSaved();
                  setIsMobileMenuOpen(false);
                }}
                className="py-2.5 px-3 rounded-xl border border-gray-200 dark:border-[#233550] bg-gray-50 dark:bg-[#15233a] flex items-center justify-between text-xs font-bold text-[#001848] dark:text-white hover:bg-gray-100 dark:hover:bg-[#1c2e4c] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#005684] dark:text-[#93ccff]">bed</span>
                  <span>Saved Stays</span>
                </div>
                {savedCount > 0 ? (
                  <span className="px-1.5 py-0.5 rounded-full bg-[#005684] text-white text-[10px] font-bold">
                    {savedCount}
                  </span>
                ) : (
                  <span className="text-[10px] text-gray-400">0</span>
                )}
              </button>

              <button
                type="button"
                onClick={onToggleNightShift}
                className="py-2.5 px-3 rounded-xl border border-gray-200 dark:border-[#233550] bg-gray-50 dark:bg-[#15233a] flex items-center justify-between text-xs font-bold text-[#001848] dark:text-white hover:bg-gray-100 dark:hover:bg-[#1c2e4c] cursor-pointer"
              >
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#ffdf91]">
                    {isNightShiftMode ? 'light_mode' : 'dark_mode'}
                  </span>
                  <span>{isNightShiftMode ? 'Day Mode' : 'Night Mode'}</span>
                </div>
                <span className="text-[10px] px-1.5 py-0.5 rounded font-mono font-bold bg-amber-500/15 text-amber-700 dark:text-amber-300">
                  {isNightShiftMode ? 'ON' : 'OFF'}
                </span>
              </button>
            </div>

            {/* 5. ROLE & PERSPECTIVE SWITCHER */}
            <div className="pt-2 border-t border-gray-100 dark:border-[#233550] space-y-2">
              <div className="px-1 text-[10px] font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500">
                Switch Perspective
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    onSwitchRole('nurse');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    currentUser.role === 'nurse'
                      ? 'border-[#195b4c] bg-[#195b4c]/10 text-[#195b4c] dark:text-[#aff0db] font-bold'
                      : 'border-gray-200 dark:border-[#233550] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#182840]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[16px] text-[#195b4c]">stethoscope</span>
                    <span className="truncate">Clinician</span>
                  </div>
                  {currentUser.role === 'nurse' && <span className="text-xs">✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSwitchRole('host');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    currentUser.role === 'host'
                      ? 'border-[#005684] bg-[#005684]/10 text-[#005684] dark:text-[#93ccff] font-bold'
                      : 'border-gray-200 dark:border-[#233550] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#182840]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[16px] text-[#005684]">home</span>
                    <span className="truncate">Host</span>
                  </div>
                  {currentUser.role === 'host' && <span className="text-xs">✓</span>}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    onSwitchRole('super_admin');
                    setIsMobileMenuOpen(false);
                  }}
                  className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                    currentUser.role === 'super_admin'
                      ? 'border-amber-500 bg-amber-500/10 text-amber-800 dark:text-amber-300 font-bold'
                      : 'border-gray-200 dark:border-[#233550] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#182840]'
                  }`}
                >
                  <div className="flex items-center gap-1.5 truncate">
                    <span className="material-symbols-outlined text-[16px] text-amber-600">shield_person</span>
                    <span className="truncate">Admin</span>
                  </div>
                  {currentUser.role === 'super_admin' && <span className="text-xs">✓</span>}
                </button>

                {isDeveloper ? (
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchRole('developer');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      currentUser.role === 'developer'
                        ? 'border-purple-600 bg-purple-500/10 text-purple-700 dark:text-purple-300 font-bold'
                        : 'border-gray-200 dark:border-[#233550] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#182840]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[16px] text-purple-600">terminal</span>
                      <span className="truncate">Dev</span>
                    </div>
                    {currentUser.role === 'developer' && <span className="text-xs">✓</span>}
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      onSwitchRole('guest');
                      setIsMobileMenuOpen(false);
                    }}
                    className={`py-2 px-2.5 rounded-xl border text-left flex items-center justify-between transition-colors cursor-pointer ${
                      currentUser.role === 'guest'
                        ? 'border-gray-500 bg-gray-500/10 text-gray-800 dark:text-gray-200 font-bold'
                        : 'border-gray-200 dark:border-[#233550] text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#182840]'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="material-symbols-outlined text-[16px] text-gray-500">person</span>
                      <span className="truncate">Guest</span>
                    </div>
                    {currentUser.role === 'guest' && <span className="text-xs">✓</span>}
                  </button>
                )}
              </div>
            </div>

            {/* 6. DEVELOPER HUD CONTROLS (If Developer) */}
            {isDeveloper && (
              <div className="pt-2 border-t border-gray-100 dark:border-[#233550] space-y-2">
                <div className="px-1 flex items-center justify-between text-[10px] font-bold uppercase tracking-wider text-gray-400">
                  <span>Developer Diagnostics</span>
                  <span className="px-1.5 py-0.2 rounded text-[9px] bg-purple-500/10 text-purple-600 dark:text-purple-300 font-mono">
                    Dev Mode
                  </span>
                </div>

                {onToggleScreenCodes && (
                  <div className="p-2.5 rounded-xl bg-purple-500/10 dark:bg-purple-950/20 border border-purple-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="material-symbols-outlined text-[16px] text-purple-600">code</span>
                      <span className="text-xs font-bold text-purple-900 dark:text-purple-200">Screen Codes [XX-00]</span>
                    </div>
                    <button
                      type="button"
                      onClick={onToggleScreenCodes}
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold font-mono cursor-pointer ${
                        showScreenCodes ? 'bg-purple-600 text-white' : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                      }`}
                    >
                      {showScreenCodes ? 'ON' : 'OFF'}
                    </button>
                  </div>
                )}

                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('mobile-preview');
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-1.5 px-2.5 rounded-xl border border-purple-200 dark:border-purple-900/30 text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">smartphone</span>
                    <span>App Simulator</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onSelectTab('phase1-inventory');
                      setIsMobileMenuOpen(false);
                    }}
                    className="py-1.5 px-2.5 rounded-xl border border-purple-200 dark:border-purple-900/30 text-[11px] font-bold text-purple-700 dark:text-purple-300 flex items-center gap-1.5 hover:bg-purple-50 dark:hover:bg-purple-950/20 cursor-pointer"
                  >
                    <span className="material-symbols-outlined text-[15px]">inventory_2</span>
                    <span>Spec Inventory</span>
                  </button>
                </div>
              </div>
            )}

            {/* 7. SUPPORT & AUTH ACTIONS */}
            <div className="pt-2 border-t border-gray-100 dark:border-[#233550] flex flex-col gap-2">
              <button
                type="button"
                onClick={() => {
                  onOpenSupport();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full py-2.5 px-3 rounded-xl border border-gray-200 dark:border-[#233550] text-xs font-bold flex items-center justify-center gap-2 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-[#182840] cursor-pointer"
              >
                <span className="material-symbols-outlined text-[18px] text-[#005684]">support_agent</span>
                <span>24/7 Clinical Support</span>
              </button>

              {currentUser.role !== 'guest' && onLogout ? (
                <button
                  type="button"
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="w-full py-2.5 px-3 rounded-xl border border-rose-200 dark:border-rose-900/40 bg-rose-50/80 dark:bg-rose-950/30 text-rose-700 dark:text-rose-300 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer hover:bg-rose-100 dark:hover:bg-rose-900/50"
                >
                  <span className="material-symbols-outlined text-[18px]">logout</span>
                  <span>Log Out (Switch to Guest)</span>
                </button>
              ) : onOpenAuth ? (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuth('signin');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl border border-gray-300 dark:border-[#233550] text-xs font-bold text-center text-[#001848] dark:text-white hover:bg-gray-50 dark:hover:bg-[#182840]"
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      onOpenAuth('signup');
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex-1 py-2.5 px-3 rounded-xl bg-[#001848] dark:bg-[#005684] text-white text-xs font-bold text-center hover:opacity-90 shadow-xs"
                  >
                    Get Started
                  </button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};
