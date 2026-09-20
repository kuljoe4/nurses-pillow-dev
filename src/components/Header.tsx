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
}) => {
  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-colors duration-200 ${
        isNightShiftMode
          ? 'bg-[#0B1626] border-b border-[#233550] shadow-[0_4px_20px_rgba(0,0,0,0.5)] text-[#E6ECF7]'
          : 'bg-white border-b border-[rgba(11,37,89,0.12)] shadow-[0_4px_20px_rgba(11,37,89,0.06)] text-[#001848]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-12 h-20 flex items-center justify-between gap-4">
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
              className={`text-[21px] font-bold tracking-tight leading-tight transition-colors ${
                isNightShiftMode ? 'text-white' : 'text-[#001848]'
              }`}
            >
              Nurses Pillow
            </span>
            <span
              className="text-[#745b0d] text-[16px] leading-none -mt-0.5"
              style={{ fontFamily: "'Kaushan Script', cursive" }}
            >
              Rest Well. Heal Better.
            </span>
          </div>
        </button>

        {/* Navigation */}
        <nav className="hidden xl:flex items-center gap-6 2xl:gap-8">
          <button
            onClick={() => onSelectTab('find-housing')}
            className={`text-sm font-semibold transition-colors ${
              currentTab === 'find-housing'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            Find Housing
          </button>

          <button
            onClick={() => onSelectTab('verification')}
            className={`text-sm font-semibold transition-colors flex items-center gap-1.5 ${
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
            <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-[#0a6fa8]/10 text-[#0a6fa8] dark:bg-[#3E9AD1]/20 dark:text-[#3E9AD1]">
              Portal
            </span>
          </button>

          <button
            onClick={() => onSelectTab('how-it-works')}
            className={`text-sm font-semibold transition-colors ${
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

          <button
            onClick={() => onSelectTab('for-hosts')}
            className={`text-sm font-semibold transition-colors ${
              currentTab === 'for-hosts'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            For Hosts
          </button>

          <button
            onClick={onOpenSupport}
            className={`text-sm font-semibold transition-colors ${
              currentTab === 'nurse-support'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            Nurse Support
          </button>

          <button
            onClick={() => onSelectTab('verified-hospitals')}
            className={`text-sm font-semibold transition-colors ${
              currentTab === 'verified-hospitals'
                ? isNightShiftMode
                  ? 'text-[#3E9AD1] font-bold border-b-2 border-[#3E9AD1] pb-0.5'
                  : 'text-[#005684] font-bold border-b-2 border-[#005684] pb-0.5'
                : isNightShiftMode
                ? 'text-[#9CB3D3] hover:text-white'
                : 'text-[#404850] hover:text-[#001848]'
            }`}
          >
            Verified Hospitals
          </button>
        </nav>

        {/* Right actions */}
        <div className="flex items-center gap-2.5 sm:gap-4 shrink-0">
          {/* RN Verified Pill */}
          <div
            onClick={() => onSelectTab('verification')}
            className={`cursor-pointer hidden sm:flex items-center gap-2 px-3.5 py-1.5 rounded-full border transition-all ${
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
            <span className="text-xs font-bold tracking-wide">
              {isVerified ? 'RN Verified' : 'Verification Active'}
            </span>
          </div>

          {/* Night Shift Mode Toggle */}
          <button
            onClick={onToggleNightShift}
            type="button"
            aria-label="Toggle Night Shift Mode"
            title={isNightShiftMode ? 'Switch to Day Shift Mode' : 'Switch to Night Shift Mode'}
            className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isNightShiftMode
                ? 'bg-[#0E1A2E] border border-[#233550] text-[#ffdf91] hover:bg-[#162744]'
                : 'bg-white border border-[rgba(11,37,89,0.08)] shadow-[0_4px_20px_rgba(11,37,89,0.06)] text-[#001848] hover:bg-[#f2f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[19px]">
              {isNightShiftMode ? 'light_mode' : 'bedtime'}
            </span>
          </button>

          {/* Saved listings bed button */}
          <button
            onClick={onOpenSaved}
            type="button"
            aria-label="Saved listings"
            title="Saved Housing Sanctuaries"
            className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all ${
              isNightShiftMode
                ? 'bg-[#0E1A2E] border border-[#233550] text-white hover:bg-[#162744]'
                : 'bg-white border border-[rgba(11,37,89,0.08)] shadow-[0_4px_20px_rgba(11,37,89,0.06)] text-[#001848] hover:bg-[#f2f3ff]'
            }`}
          >
            <span className="material-symbols-outlined text-[20px]">bed</span>
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 rounded-full bg-[#0a6fa8] text-white text-[10px] font-bold items-center justify-center border-2 border-white">
                {savedCount}
              </span>
            )}
          </button>

          {/* User profile with active status pip */}
          <div className="relative flex items-center">
            <button
              onClick={() => onSelectTab('verification')}
              aria-label="User profile"
              className="relative focus:outline-none group"
              type="button"
            >
              <div className="w-9 h-9 rounded-full bg-[#005684] group-hover:bg-[#0a6fa8] flex items-center justify-center transition-colors">
                <span className="material-symbols-outlined text-white text-[20px]">person</span>
              </div>
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#0a6fa8] border-2 border-white"></span>
              </span>
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
