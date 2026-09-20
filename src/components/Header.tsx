import React, { useState } from 'react';
import { NavigationTab } from '../types';
import { NursesPillowLogo } from './NursesPillowLogo';

interface HeaderProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  savedCount: number;
  onOpenSaved: () => void;
  isNightShiftMode: boolean;
  onToggleNightShift: () => void;
  onOpenSupport: () => void;
  isVerified: boolean;
  onOpenAuth?: (mode?: 'signin' | 'signup') => void;
}

export const LOGO_URL = '/nurses-pillow-logo.png';

export const Header: React.FC<HeaderProps> = ({
  currentTab,
  onSelectTab,
  savedCount,
  onOpenSaved,
  isNightShiftMode,
  onToggleNightShift,
  onOpenSupport,
  isVerified,
  onOpenAuth,
}) => {
  const [isPortalsDropdownOpen, setIsPortalsDropdownOpen] = useState(false);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        isNightShiftMode
          ? 'bg-[#0B1626] border-b border-[#233550] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-[#E6ECF7]'
          : 'bg-white border-b border-[rgba(11,37,89,0.12)] shadow-[0_4px_20px_rgba(11,37,89,0.06)] text-[#001848]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between gap-3">
        {/* Brand */}
        <button
          onClick={() => onSelectTab('find-housing')}
          className="flex items-center gap-3 shrink-0 text-left focus:outline-none group cursor-pointer"
          type="button"
          aria-label="Go to Nurses Pillow homepage"
        >
          <NursesPillowLogo size={36} className="h-9 w-9 transition-transform group-hover:scale-105" />
          <div className="flex flex-col">
            <span
              className={`text-[20px] font-bold tracking-tight leading-tight transition-colors ${
                isNightShiftMode ? 'text-white' : 'text-[#001848]'
              }`}
            >
              Nurses Pillow
            </span>
            <span
              className="text-[#745b0d] dark:text-[#ffdf91] text-[15px] leading-none -mt-0.5"
              style={{ fontFamily: "'Kaushan Script', cursive" }}
            >
              Rest Well. Heal Better.
            </span>
          </div>
        </button>

        {/* Navigation Links */}
        <nav className="hidden lg:flex items-center gap-4 xl:gap-6">
          <button
            onClick={() => onSelectTab('find-housing')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'find-housing'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            Home
          </button>

          <button
            onClick={() => onSelectTab('search-listings')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer flex items-center gap-1 ${
              currentTab === 'search-listings'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            <span className="material-symbols-outlined text-[16px]">travel_explore</span>
            <span>Search Stays</span>
          </button>

          <button
            onClick={() => onSelectTab('nurse-dashboard')}
            className={`text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              currentTab === 'nurse-dashboard'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            <span>Nurse Dashboard</span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#195b4c]/15 text-[#195b4c] dark:text-[#aff0db]">
              Portal A
            </span>
          </button>

          <button
            onClick={() => onSelectTab('host-dashboard')}
            className={`text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              currentTab === 'host-dashboard' || currentTab === 'for-hosts'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            <span>Host Portal</span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#005684]/15 text-[#005684] dark:text-[#93ccff]">
              Portal B
            </span>
          </button>

          <button
            onClick={() => onSelectTab('admin-portal')}
            className={`text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              currentTab === 'admin-portal'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            <span>Super-Admin</span>
            <span className="text-[9px] uppercase font-bold tracking-wider px-1.5 py-0.2 rounded bg-[#745b0d]/15 text-[#745b0d] dark:text-[#ffdf91]">
              Portal C
            </span>
          </button>

          <button
            onClick={() => onSelectTab('verification')}
            className={`text-xs xl:text-sm font-semibold transition-colors flex items-center gap-1 cursor-pointer ${
              currentTab === 'verification'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            <span>Credentialing</span>
          </button>

          <button
            onClick={() => onSelectTab('how-it-works')}
            className={`text-xs xl:text-sm font-semibold transition-colors cursor-pointer ${
              currentTab === 'how-it-works'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            How It Works
          </button>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2 sm:gap-3 shrink-0">
          {/* RN Verified Pill */}
          <div
            onClick={() => onSelectTab('verification')}
            className={`cursor-pointer hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all ${
              isNightShiftMode
                ? 'bg-[#195b4c]/30 text-[#aff0db] border-[#195b4c]/60 hover:bg-[#195b4c]/40'
                : 'bg-[#367464]/15 text-[#195b4c] border-[#94d3c0]/60 hover:bg-[#367464]/20'
            }`}
            title="Click to view your credentialing verification status"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#aff0db] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#195b4c]"></span>
            </span>
            <span className="text-[11px] font-bold tracking-wide">
              {isVerified ? 'RN Verified' : 'Verification Active'}
            </span>
          </div>

          {/* Auth Button */}
          {onOpenAuth && (
            <button
              type="button"
              onClick={() => onOpenAuth('signup')}
              className="hidden md:flex items-center gap-1 px-3.5 py-1.5 rounded-full bg-[#001848] dark:bg-[#005684] hover:bg-[#162e62] text-white text-xs font-bold shadow-xs cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">lock</span>
              <span>Sign In / Join</span>
            </button>
          )}

          {/* Night Shift Mode Toggle */}
          <button
            onClick={onToggleNightShift}
            type="button"
            aria-label="Toggle Night Shift Mode"
            title={isNightShiftMode ? 'Switch to Day Shift Mode' : 'Switch to Night Shift Mode'}
            className={`w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isNightShiftMode
                ? 'bg-[#0E1A2E] border border-[#233550] text-[#ffdf91] hover:bg-[#162744]'
                : 'bg-white border border-[rgba(11,37,89,0.08)] shadow-xs text-[#001848] hover:bg-[#f2f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isNightShiftMode ? 'light_mode' : 'bedtime'}
            </span>
          </button>

          {/* Saved listings bed button */}
          <button
            onClick={onOpenSaved}
            type="button"
            aria-label="Saved listings"
            title="Saved Housing Sanctuaries"
            className={`relative w-9 h-9 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all cursor-pointer ${
              isNightShiftMode
                ? 'bg-[#0E1A2E] border border-[#233550] text-white hover:bg-[#162744]'
                : 'bg-white border border-[rgba(11,37,89,0.08)] shadow-xs text-[#001848] hover:bg-[#f2f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">bed</span>
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-[#0a6fa8] text-white text-[10px] font-bold items-center justify-center border-2 border-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* Mobile Portals Menu Button */}
          <div className="relative lg:hidden">
            <button
              onClick={() => setIsPortalsDropdownOpen(!isPortalsDropdownOpen)}
              type="button"
              className="w-9 h-9 rounded-full bg-[#eaedff] dark:bg-[#182840] flex items-center justify-center text-[#001848] dark:text-white cursor-pointer"
            >
              <span className="material-symbols-outlined text-[20px]">menu</span>
            </button>

            {isPortalsDropdownOpen && (
              <div className="absolute right-0 top-12 w-60 rounded-2xl bg-white dark:bg-[#0B1626] border border-gray-200 dark:border-gray-800 shadow-xl p-2 z-50 text-xs font-semibold space-y-1">
                <button
                  onClick={() => {
                    onSelectTab('find-housing');
                    setIsPortalsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 font-bold"
                >
                  Home (Featured Stays)
                </button>
                <button
                  onClick={() => {
                    onSelectTab('search-listings');
                    setIsPortalsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-between"
                >
                  <span className="font-bold text-[#005684] dark:text-[#93ccff]">Search Stays &amp; Map</span>
                  <span className="text-[10px] text-[#005684] font-bold">Screen A2</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab('nurse-dashboard');
                    setIsPortalsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-between"
                >
                  <span>Nurse Dashboard</span>
                  <span className="text-[10px] text-[#195b4c] font-bold">Portal A</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab('host-dashboard');
                    setIsPortalsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-between"
                >
                  <span>Host Portal</span>
                  <span className="text-[10px] text-[#005684] font-bold">Portal B</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab('admin-portal');
                    setIsPortalsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5 flex items-center justify-between"
                >
                  <span>Super-Admin Hub</span>
                  <span className="text-[10px] text-[#745b0d] font-bold">Portal C</span>
                </button>
                <button
                  onClick={() => {
                    onSelectTab('verification');
                    setIsPortalsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  Clinician Credentialing
                </button>
                <button
                  onClick={() => {
                    onSelectTab('how-it-works');
                    setIsPortalsDropdownOpen(false);
                  }}
                  className="w-full text-left px-3 py-2 rounded-xl hover:bg-gray-100 dark:hover:bg-white/5"
                >
                  How It Works
                </button>
                {onOpenAuth && (
                  <button
                    onClick={() => {
                      onOpenAuth('signup');
                      setIsPortalsDropdownOpen(false);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl bg-[#001848] text-white font-bold"
                  >
                    Sign In / Join
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};
