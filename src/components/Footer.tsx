import React from 'react';
import { NursesPillowLogo } from './NursesPillowLogo';
import { InteractiveUSMap } from './InteractiveUSMap';
import { HousingListing, Hospital } from '../types';
import { ClearedStateData } from '../services/coverageService';
import { Headphones, ArrowRight, ShieldCheck, MapPin } from 'lucide-react';

interface FooterProps {
  isNightShiftMode: boolean;
  onOpenSupport: () => void;
  onSelectTab: (tab: any) => void;
  isDeveloper?: boolean;
  onSelectState?: (stateCode: string) => void;
  selectedStateCode?: string;
  listings?: HousingListing[];
  hospitals?: Hospital[];
  clearedStates?: ClearedStateData[];
}

export const Footer: React.FC<FooterProps> = ({
  isNightShiftMode,
  onOpenSupport,
  onSelectTab,
  isDeveloper = false,
  onSelectState,
  selectedStateCode = 'NC',
  listings = [],
  hospitals = [],
  clearedStates,
}) => {
  const handleStateClick = (stateCode: string) => {
    if (onSelectState) {
      onSelectState(stateCode);
    } else {
      onSelectTab('find-housing');
    }
  };

  return (
    <footer
      className={`w-full border-t transition-colors mt-auto ${
        isNightShiftMode
          ? 'bg-[#08101C] border-[#233550] text-[#9CB3D3]'
          : 'bg-[#EFF6FB] border-[rgba(11,37,89,0.08)] text-[#404850]'
      }`}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-12 py-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 mb-10">
          {/* Brand & Mission */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <NursesPillowLogo size={26} className="h-6 w-6" />
              <span
                className={`text-[20px] font-bold tracking-tight ${
                  isNightShiftMode ? 'text-white' : 'text-[#001848]'
                }`}
              >
                Nurses Pillow
              </span>
            </div>
            <p className="text-sm leading-relaxed mb-4">
              Sanctuary-grade housing built exclusively for traveling clinicians navigating grueling shifts.
            </p>

            {/* 24/7 Clinician Support badge with zero-flash SVG icon */}
            <button
              onClick={onOpenSupport}
              type="button"
              className={`inline-flex items-center gap-2.5 px-3.5 py-2 rounded-xl border text-left transition-all duration-200 ease-in-out cursor-pointer ${
                isNightShiftMode
                  ? 'bg-[#0E1A2E] border-[#233550] shadow-md hover:border-[#3E9AD1]'
                  : 'bg-white border-[rgba(11,37,89,0.08)] shadow-[0_4px_20px_rgba(11,37,89,0.06)] hover:border-[#0a6fa8]'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-[#EFF6FB] dark:bg-[#1a2b42] flex items-center justify-center text-[#0A6FA8] dark:text-[#3E9AD1] shrink-0">
                <Headphones className="w-4 h-4" />
              </div>
              <div>
                <div
                  className={`text-xs font-semibold ${
                    isNightShiftMode ? 'text-white' : 'text-[#001848]'
                  }`}
                >
                  Clinician Help &amp; Support
                </div>
                <div className="text-[11px] opacity-80 leading-none">
                  Shift assistance &amp; ticket portal
                </div>
              </div>
            </button>
          </div>

          {/* Column 1: Travel Nurses */}
          <div>
            <h3
              className={`text-sm font-bold uppercase tracking-wider mb-3 ${
                isNightShiftMode ? 'text-white' : 'text-[#001848]'
              }`}
            >
              Travel Nurses
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onSelectTab('find-housing')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Hospital Proximity Search
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('how-it-works')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Stipend &amp; Per Diem Guides
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('find-housing')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Shift-Friendly Housing
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('how-it-works')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Blackout Curtains Guarantee
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('how-it-works')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Quiet Hours Certification
                </button>
              </li>
            </ul>
          </div>

          {/* Column 2: Hosts & Properties */}
          <div>
            <h3
              className={`text-sm font-bold uppercase tracking-wider mb-3 ${
                isNightShiftMode ? 'text-white' : 'text-[#001848]'
              }`}
            >
              Hosts &amp; Properties
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onSelectTab('for-hosts')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Host a Nurse
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('for-hosts')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Furnishing Standards Guide
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('verification')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Safety &amp; ID Verification
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('for-hosts')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Contract Flex Protection
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('for-hosts')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Host Resource Center
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Trust & Sanctuary */}
          <div>
            <h3
              className={`text-sm font-bold uppercase tracking-wider mb-3 ${
                isNightShiftMode ? 'text-white' : 'text-[#001848]'
              }`}
            >
              Trust &amp; Sanctuary
            </h3>
            <ul className="space-y-2 text-sm">
              <li>
                <button
                  onClick={() => onSelectTab('how-it-works')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Safety Protocols
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('verified-hospitals')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] transition-colors text-left cursor-pointer"
                >
                  Hospital Safe Badges
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('legal-policies')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] dark:hover:text-[#93ccff] focus-visible:text-[#93ccff] transition-colors text-left cursor-pointer"
                >
                  Cancellation &amp; Refund Policy
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('legal-policies')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] dark:hover:text-[#93ccff] focus-visible:text-[#93ccff] transition-colors text-left cursor-pointer"
                >
                  Privacy Policy &amp; Terms
                </button>
              </li>
              <li>
                <button
                  onClick={() => onSelectTab('system-status')}
                  className="hover:text-[#005684] focus-visible:text-[#005684] dark:hover:text-[#93ccff] focus-visible:text-[#93ccff] transition-colors text-left cursor-pointer"
                >
                  Platform Reliability &amp; Status
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenSupport}
                  className="hover:text-[#005684] focus-visible:text-[#005684] dark:hover:text-[#93ccff] focus-visible:text-[#93ccff] transition-colors text-left cursor-pointer"
                >
                  Help &amp; Clinical Support
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Multi-State Interactive US Map Component (NC, MD, CT, ND, KS) */}
        <div className="mb-10">
          <InteractiveUSMap
            isNightShiftMode={isNightShiftMode}
            selectedStateCode={selectedStateCode}
            onSelectState={handleStateClick}
            listings={listings}
            hospitals={hospitals}
            clearedStates={clearedStates}
          />
        </div>

        {/* Bottom bar */}
        <div
          className={`pt-6 border-t flex flex-col sm:flex-row items-center justify-between gap-4 ${
            isNightShiftMode ? 'border-[#233550]' : 'border-[rgba(11,37,89,0.08)]'
          }`}
        >
          <div className="text-sm">
            © 2026 Nurses Pillow Inc. All clinical housing verified. Zero card deposit holds for clinicians.
          </div>
          <div
            className="text-[#745b0d] dark:text-[#E4C36D] text-[20px]"
            style={{ fontFamily: "'Kaushan Script', cursive" }}
          >
            Rest Well. Heal Better.
          </div>
        </div>
      </div>
    </footer>
  );
};
