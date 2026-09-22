import React from 'react';
import { NavigationTab, VerificationStepId, UserRole } from '../types';

export interface BreadcrumbsProps {
  currentTab: NavigationTab;
  onSelectTab: (tab: NavigationTab) => void;
  isNightShiftMode: boolean;
  verificationStep?: VerificationStepId;
  onSelectVerificationStep?: (step: VerificationStepId) => void;
  searchHospital?: string;
  currentUserRole?: UserRole;
  showScreenCodes?: boolean;
  onGoBack?: () => void;
  canGoBack?: boolean;
}

interface CrumbItem {
  id: string;
  label: string;
  shortLabel?: string;
  icon?: string;
  onClick?: () => void;
  isCurrent?: boolean;
  screenCode?: string;
  badge?: string;
}

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  currentTab,
  onSelectTab,
  isNightShiftMode,
  verificationStep = 1,
  onSelectVerificationStep,
  searchHospital,
  currentUserRole = 'nurse',
  showScreenCodes = false,
  onGoBack,
  canGoBack = false,
}) => {
  // If at root homepage (find-housing), hide the breadcrumbs to avoid empty single-item clutter and maintain flush hero spacing
  if (currentTab === 'find-housing') {
    return null;
  }

  const navigateTo = (tab: NavigationTab) => {
    onSelectTab(tab);
  };

  const getVerificationStepTitle = (step: VerificationStepId) => {
    switch (step) {
      case 1:
        return 'Step 1: Identity & Legal Name';
      case 2:
        return 'Step 2: Contact & Auth';
      case 3:
        return 'Step 3: Primary Source Clinical License';
      case 4:
        return 'Step 4: Assignment Work Contract';
    }
  };

  const getVerificationStepCode = (step: VerificationStepId) => {
    switch (step) {
      case 1:
        return '[C-01]';
      case 2:
        return '[C-02]';
      case 3:
        return '[C-03]';
      case 4:
        return '[C-04]';
    }
  };

  // Build the hierarchical trail items based on currentTab
  const buildTrail = (): CrumbItem[] => {
    const homeCrumb: CrumbItem = {
      id: 'home',
      label: 'Home',
      icon: 'home',
      onClick: () => navigateTo('find-housing'),
    };

    switch (currentTab) {
      case 'search-listings': {
        const items: CrumbItem[] = [
          homeCrumb,
          {
            id: 'search-root',
            label: 'Sanitized Housing Search',
            shortLabel: 'Search',
            icon: 'travel_explore',
            screenCode: '[A-02]',
            isCurrent: !searchHospital,
            onClick: searchHospital ? () => navigateTo('search-listings') : undefined,
          },
        ];
        if (searchHospital) {
          items.push({
            id: 'hospital-filter',
            label: searchHospital,
            icon: 'local_hospital',
            isCurrent: true,
          });
        }
        return items;
      }

      case 'verification': {
        return [
          homeCrumb,
          {
            id: 'credentialing',
            label: 'Clinician Credentialing',
            shortLabel: 'Credentialing',
            icon: 'verified_user',
            onClick: () => {
              navigateTo('verification');
              onSelectVerificationStep?.(1);
            },
          },
          {
            id: `step-${verificationStep}`,
            label: getVerificationStepTitle(verificationStep),
            icon: 'badge',
            screenCode: getVerificationStepCode(verificationStep),
            badge: `Step ${verificationStep} of 4`,
            isCurrent: true,
          },
        ];
      }

      case 'email-verification': {
        return [
          homeCrumb,
          {
            id: 'credentialing',
            label: 'Clinician Credentialing',
            shortLabel: 'Credentialing',
            icon: 'verified_user',
            onClick: () => {
              navigateTo('verification');
              onSelectVerificationStep?.(2);
            },
          },
          {
            id: 'email-verify',
            label: 'Postmark Institutional Email Verification',
            shortLabel: 'Email Verification',
            icon: 'mark_email_read',
            screenCode: '[C-02A]',
            isCurrent: true,
          },
        ];
      }

      case 'phone-verification': {
        return [
          homeCrumb,
          {
            id: 'credentialing',
            label: 'Clinician Credentialing',
            shortLabel: 'Credentialing',
            icon: 'verified_user',
            onClick: () => {
              navigateTo('verification');
              onSelectVerificationStep?.(2);
            },
          },
          {
            id: 'phone-verify',
            label: 'Twilio SMS OTP Mobile Verification',
            shortLabel: 'Phone Verification',
            icon: 'sms',
            screenCode: '[C-02B]',
            isCurrent: true,
          },
        ];
      }

      case 'nurse-dashboard': {
        return [
          homeCrumb,
          {
            id: 'clinician-portal',
            label: 'Clinician Workspace',
            shortLabel: 'Clinician',
            icon: 'clinical_notes',
          },
          {
            id: 'nurse-dashboard-current',
            label: 'My Bookings & Verified Profile',
            shortLabel: 'My Bookings',
            icon: 'inventory_2',
            screenCode: '[C-05]',
            isCurrent: true,
          },
        ];
      }

      case 'host-dashboard': {
        return [
          homeCrumb,
          {
            id: 'host-portal',
            label: 'Property Host Hub',
            shortLabel: 'Host Hub',
            icon: 'apartment',
          },
          {
            id: 'host-dashboard-current',
            label: 'Sanctuary Listings & Reservation Requests',
            shortLabel: 'Listings & Requests',
            icon: 'home_work',
            screenCode: '[H-01]',
            isCurrent: true,
          },
        ];
      }

      case 'host-onboarding': {
        return [
          homeCrumb,
          {
            id: 'host-portal',
            label: 'Property Host Hub',
            shortLabel: 'Host Hub',
            icon: 'apartment',
            onClick: () => navigateTo('host-dashboard'),
          },
          {
            id: 'host-onboarding-current',
            label: 'List a Clinician Sanctuary',
            shortLabel: 'New Sanctuary',
            icon: 'add_home_work',
            screenCode: '[H-02]',
            isCurrent: true,
          },
        ];
      }

      case 'admin-portal': {
        return [
          homeCrumb,
          {
            id: 'admin-root',
            label: 'Super-Admin Operations Portal',
            shortLabel: 'Super-Admin',
            icon: 'admin_panel_settings',
          },
          {
            id: 'admin-queue',
            label: 'Operations & Primary Source License Queue',
            shortLabel: 'License Queue',
            icon: 'fact_check',
            screenCode: '[A-01]',
            isCurrent: true,
          },
        ];
      }

      case 'verified-hospitals': {
        return [
          homeCrumb,
          {
            id: 'healthcare-directory',
            label: 'Healthcare Directory',
            shortLabel: 'Directory',
            icon: 'domain',
          },
          {
            id: 'hospitals-current',
            label: 'NC Trauma Centers & Verified Teaching Hospitals',
            shortLabel: 'Verified Hospitals',
            icon: 'local_hospital',
            screenCode: '[HOS-01]',
            isCurrent: true,
          },
        ];
      }

      case 'how-it-works': {
        return [
          homeCrumb,
          {
            id: 'resources',
            label: 'Platform Resources',
            icon: 'auto_stories',
          },
          {
            id: 'how-it-works-current',
            label: 'How Nurses Pillow Works',
            shortLabel: 'How It Works',
            icon: 'psychology_alt',
            screenCode: '[P-01]',
            isCurrent: true,
          },
        ];
      }

      case 'for-hosts': {
        return [
          homeCrumb,
          {
            id: 'resources',
            label: 'Host Resources',
            icon: 'real_estate_agent',
          },
          {
            id: 'for-hosts-current',
            label: 'Sanctuary Host Standards & Guarantees',
            shortLabel: 'Host Standards',
            icon: 'shield_lock',
            screenCode: '[P-02]',
            isCurrent: true,
          },
        ];
      }

      case 'nurse-support': {
        return [
          homeCrumb,
          {
            id: 'resources',
            label: 'Clinician Support',
            icon: 'support_agent',
          },
          {
            id: 'support-current',
            label: '24/7 Clinical Support Hotline & Dispatch',
            shortLabel: '24/7 Support',
            icon: 'headset_mic',
            screenCode: '[P-03]',
            isCurrent: true,
          },
        ];
      }

      case 'legal-policies': {
        return [
          homeCrumb,
          {
            id: 'compliance',
            label: 'Standards & Reliability',
            icon: 'policy',
          },
          {
            id: 'policies-current',
            label: 'Sanctuary Standards, Cancellation & Terms',
            shortLabel: 'Legal & Policies',
            icon: 'gavel',
            screenCode: '[P-05]',
            isCurrent: true,
          },
        ];
      }

      case 'system-status': {
        return [
          homeCrumb,
          {
            id: 'compliance',
            label: 'Standards & Reliability',
            icon: 'policy',
          },
          {
            id: 'status-current',
            label: 'Platform Reliability & Live Health',
            shortLabel: 'System Status',
            icon: 'dns',
            screenCode: '[P-12]',
            isCurrent: true,
          },
        ];
      }

      case 'phase1-inventory': {
        return [
          homeCrumb,
          {
            id: 'dev-workspace',
            label: 'Developer Workspace',
            shortLabel: 'Dev Workspace',
            icon: 'terminal',
          },
          {
            id: 'inventory-current',
            label: 'Phase 1 Master Screen Inventory & Scope Navigator',
            shortLabel: 'Screen Inventory',
            icon: 'integration_instructions',
            screenCode: '[DEV-01]',
            isCurrent: true,
          },
        ];
      }

      case 'mobile-preview': {
        return [
          homeCrumb,
          {
            id: 'dev-workspace',
            label: 'Developer Workspace',
            shortLabel: 'Dev Workspace',
            icon: 'terminal',
            onClick: () => navigateTo('phase1-inventory'),
          },
          {
            id: 'mobile-preview-current',
            label: 'Native Mobile App Preview (Milestone 2)',
            shortLabel: 'Mobile Preview',
            icon: 'smartphone',
            screenCode: '[M2-01]',
            isCurrent: true,
          },
        ];
      }

      default:
        return [
          homeCrumb,
          {
            id: 'current',
            label: 'Application View',
            isCurrent: true,
          },
        ];
    }
  };

  const trail = buildTrail();

  return (
    <div
      id="content-breadcrumb-nav"
      className={`w-full border-b transition-colors z-20 ${
        isNightShiftMode
          ? 'bg-[#091322]/90 border-[#1c2c44] text-[#a1b5d8]'
          : 'bg-[#faf8ff] border-[rgba(11,37,89,0.06)] text-gray-500'
      }`}
    >
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-2.5 flex items-center justify-between gap-3 text-xs">
        {/* Left Side: Back Shortcut & Trail */}
        <div className="flex items-center gap-2 sm:gap-3 min-w-0 flex-1">
          {/* Back Button */}
          {onGoBack && (
            <button
              type="button"
              onClick={onGoBack}
              className={`flex items-center gap-1 px-2 py-1 rounded-lg font-bold text-xs transition-colors shrink-0 cursor-pointer ${
                isNightShiftMode
                  ? 'text-[#93ccff] hover:text-white hover:bg-[#182840]'
                  : 'text-[#005684] hover:text-[#001848] hover:bg-[#eaedff]'
              }`}
              title="Return to previous screen"
              aria-label="Navigate to previous screen"
            >
              <span className="material-symbols-outlined text-[16px] leading-none" aria-hidden="true">
                arrow_back
              </span>
              <span className="hidden sm:inline">Back</span>
            </button>
          )}

          {onGoBack && (
            <div
              className={`h-4 w-px shrink-0 ${
                isNightShiftMode ? 'bg-[#233550]' : 'bg-gray-200'
              }`}
              aria-hidden="true"
            />
          )}

          {/* Breadcrumb Navigation Trail */}
          <nav aria-label="Breadcrumb" className="min-w-0 flex-1 overflow-x-auto no-scrollbar">
            <ol className="flex items-center flex-nowrap sm:flex-wrap gap-1 sm:gap-1.5 whitespace-nowrap text-xs">
              {trail.map((crumb, index) => {
                const isLast = index === trail.length - 1;

                return (
                  <li key={crumb.id} className="flex items-center gap-1 sm:gap-1.5 shrink-0">
                    {index > 0 && (
                      <span
                        className={`material-symbols-outlined text-[14px] select-none ${
                          isNightShiftMode ? 'text-[#385175]' : 'text-gray-300'
                        }`}
                        aria-hidden="true"
                      >
                        chevron_right
                      </span>
                    )}

                    {isLast ? (
                      <div
                        className={`flex items-center gap-1 sm:gap-1.5 font-bold ${
                          isNightShiftMode ? 'text-white' : 'text-[#001848]'
                        }`}
                        aria-current="page"
                      >
                        {crumb.icon && (
                          <span
                            className={`material-symbols-outlined text-[15px] ${
                              isNightShiftMode ? 'text-[#93ccff]' : 'text-[#005684]'
                            }`}
                            aria-hidden="true"
                          >
                            {crumb.icon}
                          </span>
                        )}
                        <span className="truncate max-w-[200px] sm:max-w-xs md:max-w-md">
                          {crumb.label}
                        </span>

                        {crumb.badge && (
                          <span
                            className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                              isNightShiftMode
                                ? 'bg-[#182840] text-[#93ccff] border border-[#233550]'
                                : 'bg-[#eaedff] text-[#005684]'
                            }`}
                          >
                            {crumb.badge}
                          </span>
                        )}

                        {showScreenCodes && crumb.screenCode && (
                          <span className="font-mono text-[9px] px-1 py-0.2 rounded bg-purple-500/15 text-purple-600 dark:text-purple-300 font-bold ml-0.5">
                            {crumb.screenCode}
                          </span>
                        )}
                      </div>
                    ) : crumb.onClick ? (
                      <button
                        type="button"
                        onClick={crumb.onClick}
                        className={`flex items-center gap-1 font-medium transition-colors hover:underline underline-offset-2 cursor-pointer ${
                          isNightShiftMode
                            ? 'text-[#a1b5d8] hover:text-[#93ccff]'
                            : 'text-gray-600 hover:text-[#005684]'
                        }`}
                      >
                        {crumb.icon && (
                          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                            {crumb.icon}
                          </span>
                        )}
                        <span>{crumb.label}</span>
                      </button>
                    ) : (
                      <span
                        className={`flex items-center gap-1 font-medium ${
                          isNightShiftMode ? 'text-[#6e85a6]' : 'text-gray-400'
                        }`}
                      >
                        {crumb.icon && (
                          <span className="material-symbols-outlined text-[15px]" aria-hidden="true">
                            {crumb.icon}
                          </span>
                        )}
                        <span>{crumb.label}</span>
                      </span>
                    )}
                  </li>
                );
              })}
            </ol>
          </nav>
        </div>

        {/* Right Side: Quick Marketplace Shortcut */}
        <div className="hidden md:flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => navigateTo('find-housing')}
            className={`text-[11px] font-bold px-2.5 py-1 rounded-lg border transition-colors flex items-center gap-1.5 cursor-pointer ${
              isNightShiftMode
                ? 'border-[#233550] text-[#a1b5d8] hover:bg-[#15233a] hover:text-white'
                : 'border-gray-200 text-gray-600 hover:bg-gray-100 hover:text-[#001848]'
            }`}
            title="Return to Sanitized Housing Marketplace"
          >
            <span className="material-symbols-outlined text-[14px]">storefront</span>
            <span>Marketplace Home</span>
          </button>
        </div>
      </div>
    </div>
  );
};
