import React, { useState, useEffect, Suspense } from 'react';
import {
  NavigationTab,
  VerificationStepId,
  VerificationFormData,
  HousingListing,
  BookingRequest,
  UserRole,
} from './types';
import { INITIAL_VERIFICATION_DATA, MOCK_LISTINGS, MOCK_DEMAND_REPORTS, MOCK_ADMIN_LICENSE_REVIEWS } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ClinicalLicenseStep } from './components/ClinicalLicenseStep';
import { IdentityStep } from './components/IdentityStep';
import { ContactStep } from './components/ContactStep';
import { WorkContractStep } from './components/WorkContractStep';
import { FindHousingView } from './components/FindHousingView';
import { StagingAuthGateModal } from './components/StagingAuthGateModal';
import { Milestone2ScopeGate } from './components/Milestone2ScopeGate';
import { Breadcrumbs } from './components/Breadcrumbs';
import { ScrollProgressIndicator } from './components/ScrollProgressIndicator';
import type { AdminSheetsPreset } from './components/GoogleSheetsSyncModal';

// Code-split secondary views & heavy feature modules to eliminate initial bundle bloat
const SearchListingsView = React.lazy(() => import('./components/SearchListingsView').then(m => ({ default: m.SearchListingsView })));
const HowItWorksView = React.lazy(() => import('./components/HowItWorksView').then(m => ({ default: m.HowItWorksView })));
const ForHostsView = React.lazy(() => import('./components/ForHostsView').then(m => ({ default: m.ForHostsView })));
const VerifiedHospitalsView = React.lazy(() => import('./components/VerifiedHospitalsView').then(m => ({ default: m.VerifiedHospitalsView })));
const NurseDashboardView = React.lazy(() => import('./components/NurseDashboardView').then(m => ({ default: m.NurseDashboardView })));
const HostPortalView = React.lazy(() => import('./components/HostPortalView').then(m => ({ default: m.HostPortalView })));
const AdminPortalView = React.lazy(() => import('./components/AdminPortalView').then(m => ({ default: m.AdminPortalView })));
const PostmarkEmailVerificationView = React.lazy(() => import('./components/PostmarkEmailVerificationView').then(m => ({ default: m.PostmarkEmailVerificationView })));
const TwilioPhoneOtpView = React.lazy(() => import('./components/TwilioPhoneOtpView').then(m => ({ default: m.TwilioPhoneOtpView })));
const Phase1InventoryView = React.lazy(() => import('./components/Phase1InventoryView').then(m => ({ default: m.Phase1InventoryView })));
const LegalPoliciesView = React.lazy(() => import('./components/LegalPoliciesView').then(m => ({ default: m.LegalPoliciesView })));
const SystemStatusView = React.lazy(() => import('./components/SystemStatusView').then(m => ({ default: m.SystemStatusView })));
const MobileParityView = React.lazy(() => import('./components/MobileParityView').then(m => ({ default: m.MobileParityView })));
const Tier2PlumbingDashboard = React.lazy(() => import('./components/Tier2PlumbingDashboard').then(m => ({ default: m.Tier2PlumbingDashboard })));

// Modals lazy-loaded on demand (prevents heavy modules like Firebase from loading during initial page render)
const GoogleSheetsSyncModal = React.lazy(() => import('./components/GoogleSheetsSyncModal').then(m => ({ default: m.GoogleSheetsSyncModal })));
const ItemizedCheckoutModal = React.lazy(() => import('./components/ItemizedCheckoutModal').then(m => ({ default: m.ItemizedCheckoutModal })));
const VerificationSuccessModal = React.lazy(() => import('./components/VerificationSuccessModal').then(m => ({ default: m.VerificationSuccessModal })));
const NurseSupportModal = React.lazy(() => import('./components/NurseSupportModal').then(m => ({ default: m.NurseSupportModal })));
const SavedListingsModal = React.lazy(() => import('./components/SavedListingsModal').then(m => ({ default: m.SavedListingsModal })));
const AuthModal = React.lazy(() => import('./components/AuthModal').then(m => ({ default: m.AuthModal })));
const LogoutConfirmationModal = React.lazy(() => import('./components/LogoutConfirmationModal').then(m => ({ default: m.LogoutConfirmationModal })));

const ViewLoadingFallback = () => (
  <div className="flex-1 flex items-center justify-center min-h-[50vh] p-8">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 rounded-full border-2 border-[#0A6FA8]/20 border-t-[#0A6FA8] animate-spin" />
      <span className="text-xs text-[#0B2559]/60 dark:text-[#E6ECF7]/60 font-medium">Loading clinical workspace...</span>
    </div>
  </div>
);

export default function App() {
  // Staging Preview Authentication Gate (lawrence / np-preview-2026 or developer / np-dev-2026)
  const [isStagingAuthenticated, setIsStagingAuthenticated] = useState<boolean>(() => {
    return sessionStorage.getItem('np_staging_auth_lawrence') === 'true';
  });

  const [stagingUser, setStagingUser] = useState<'client' | 'developer'>(() => {
    return (sessionStorage.getItem('np_staging_user') as 'client' | 'developer') || 'client';
  });

  // Milestone 2 Scope Bypass Mode (Allows developer review of M2 scaffold)
  const [m2BypassMode, setM2BypassMode] = useState<boolean>(false);

  // Staging Review Bar Visibility: autohidden by default to maximize vertical screen space
  const [isStagingBannerVisible, setIsStagingBannerVisible] = useState<boolean>(false);

  // Navigation & verification step state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('find-housing');
  const [tabHistory, setTabHistory] = useState<NavigationTab[]>([]);
  const [verificationStep, setVerificationStep] = useState<VerificationStepId>(3);
  const [verificationData, setVerificationData] = useState<VerificationFormData>(
    INITIAL_VERIFICATION_DATA
  );

  const handleNavigateTab = (tab: NavigationTab) => {
    if (tab === currentTab) return;
    setTabHistory((prev) => [...prev, currentTab]);
    setCurrentTab(tab);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleGoBack = () => {
    if (currentTab === 'verification' && verificationStep > 1) {
      setVerificationStep((prev) => (prev - 1) as VerificationStepId);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    if (currentTab === 'email-verification' || currentTab === 'phone-verification') {
      handleNavigateTab('verification');
      setVerificationStep(2);
      return;
    }
    if (tabHistory.length > 0) {
      const prevTab = tabHistory[tabHistory.length - 1];
      setTabHistory((prev) => prev.slice(0, -1));
      setCurrentTab(prevTab);
    } else {
      setCurrentTab('find-housing');
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Saved listings state (initialized with 1 saved sanctuary)
  const [savedListingIds, setSavedListingIds] = useState<string[]>(['nc-duke-condo']);

  // Night shift mode state
  const [isNightShiftMode, setIsNightShiftMode] = useState<boolean>(false);

  // Modals state
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);
  const [isLogoutDialogOpen, setIsLogoutDialogOpen] = useState(false);

  // Google Sheets integration state (Administrative Feature)
  const [isSheetsModalOpen, setIsSheetsModalOpen] = useState(false);
  const [sheetsPreset, setSheetsPreset] = useState<AdminSheetsPreset>('admin-demand');

  const handleOpenGoogleSheets = (preset: AdminSheetsPreset = 'admin-demand') => {
    setSheetsPreset(preset);
    setIsSheetsModalOpen(true);
  };

  // Auth modal state (Screens AU-01 & AU-03)
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'signin' | 'signup'>('signup');
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; name: string }>(() => {
    const isDev = sessionStorage.getItem('np_staging_user') === 'developer';
    return isDev
      ? { role: 'developer', name: 'Joshua (Lead Developer)' }
      : { role: 'nurse', name: 'Sarah Jenkins, RN' };
  });

  // Developer mode flag: true ONLY if developer is logged in or in developer role
  const isDeveloper = stagingUser === 'developer' || currentUser.role === 'developer';

  const handleSwitchRole = (newRole: UserRole) => {
    if (newRole === 'nurse') {
      setCurrentUser({ role: 'nurse', name: 'Sarah Jenkins, RN' });
      setCurrentTab('find-housing');
    } else if (newRole === 'host') {
      setCurrentUser({ role: 'host', name: 'Michael Vance (Host)' });
      setCurrentTab('host-dashboard');
    } else if (newRole === 'super_admin') {
      setCurrentUser({ role: 'super_admin', name: 'Operations Admin' });
      setCurrentTab('admin-portal');
    } else if (newRole === 'developer') {
      setStagingUser('developer');
      sessionStorage.setItem('np_staging_user', 'developer');
      setCurrentUser({ role: 'developer', name: 'Joshua (Lead Developer)' });
      setM2BypassMode(true);
    }
  };

  const handleDeveloperSignIn = () => {
    setStagingUser('developer');
    sessionStorage.setItem('np_staging_user', 'developer');
    setCurrentUser({ role: 'developer', name: 'Joshua (Lead Developer)' });
    setM2BypassMode(true);
  };

  const handleDeveloperSignOut = () => {
    setStagingUser('client');
    sessionStorage.setItem('np_staging_user', 'client');
    setCurrentUser({ role: 'nurse', name: 'Sarah Jenkins, RN' });
    setM2BypassMode(false);
    if (currentTab === 'mobile-preview' || currentTab === 'phase1-inventory') {
      setCurrentTab('find-housing');
    }
  };

  // Screen Code visibility state [XX-00]
  const [showScreenCodes, setShowScreenCodes] = useState<boolean>(() => {
    return localStorage.getItem('np_show_screen_codes') === 'true';
  });

  const handleToggleScreenCodes = () => {
    setShowScreenCodes((prev) => {
      const next = !prev;
      localStorage.setItem('np_show_screen_codes', String(next));
      return next;
    });
  };

  // Initiate Logout confirmation dialog
  const handleInitiateLogout = () => {
    setIsLogoutDialogOpen(true);
  };

  // Confirmed Logout handler: clears all active user sessions and resets state to Guest role
  const handleConfirmLogout = () => {
    // 1. Clear session storage items related to user and developer sessions
    sessionStorage.removeItem('np_staging_user');
    sessionStorage.removeItem('np_user_session');
    sessionStorage.removeItem('np_user_token');
    sessionStorage.removeItem('np_active_role');
    sessionStorage.removeItem('np_active_user');
    localStorage.removeItem('np_remembered_user');

    // 2. Reset currentUser state to Guest
    setCurrentUser({ role: 'guest', name: 'Guest Explorer' });

    // 3. Reset developer staging perspective if active
    if (stagingUser === 'developer') {
      setStagingUser('client');
      sessionStorage.setItem('np_staging_user', 'client');
      setM2BypassMode(false);
    }

    // 4. Return to default guest explore tab
    setCurrentTab('find-housing');

    // 5. Close confirmation dialog
    setIsLogoutDialogOpen(false);
  };

  // Checkout modal state (Screen A4)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutListing, setCheckoutListing] = useState<HousingListing>(MOCK_LISTINGS[0]);

  // Dedicated search params state (Screen A2)
  const [searchParamsState, setSearchParamsState] = useState({
    hospital: 'Duke University Hospital - Durham, NC',
    duration: '13',
    radius: 5,
  });

  // Shared booking requests across Portals A & B
  const [bookingRequests, setBookingRequests] = useState<BookingRequest[]>([
    {
      id: 'req-1',
      listingId: 'sf-dogpatch-studio',
      listingTitle: 'Modern Dogpatch Studio w/ Blackout & Parking',
      clinicianName: 'Sarah Jenkins',
      clinicianTitle: 'BSN, RN — PICU',
      clinicianAvatar: 'https://images.unsplash.com/photo-1594824813753-488b3f24bf7c?auto=format&fit=crop&w=256&q=80',
      clinicianPhone: '+1 (919) 555-0198',
      hospitalName: 'UCSF Medical Center - Mission Bay',
      unitSpecialty: 'Pediatric ICU',
      startDate: 'Oct 1, 2024',
      endDate: 'Dec 31, 2024',
      durationWeeks: 13,
      monthlyRent: 1950,
      cleaningFee: 150,
      securityDeposit: 250,
      petFee: 0,
      travelerFee: 0,
      totalInitialCharge: 2350,
      hostNetPayout: 1852.5,
      status: 'pending_host_approval',
      submittedAt: 'Today, 2:15 PM',
      deadlineHoursRemaining: 22,
      specialRequests: 'Night shift schedule: 7 PM – 7 AM. 100% quiet daytime requirement.',
    },
  ]);

  // Synchronize document body class for dark/night mode
  useEffect(() => {
    if (isNightShiftMode) {
      document.documentElement.classList.add('dark');
      document.body.style.backgroundColor = '#08101C';
    } else {
      document.documentElement.classList.remove('dark');
      document.body.style.backgroundColor = '#faf8ff';
    }
  }, [isNightShiftMode]);

  const handleUpdateVerification = (updates: Partial<VerificationFormData>) => {
    setVerificationData((prev) => ({ ...prev, ...updates }));
  };

  const handleToggleSaveListing = (id: string) => {
    setSavedListingIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectHospitalFromDirectory = () => {
    setCurrentTab('find-housing');
  };

  const handleOpenCheckout = (listing: HousingListing) => {
    setCheckoutListing(listing);
    setIsCheckoutOpen(true);
  };

  const handleConfirmCheckout = (booking: BookingRequest) => {
    setBookingRequests((prev) => [booking, ...prev]);
    setIsCheckoutOpen(false);
    setCurrentTab('nurse-dashboard');
  };

  const handleApproveBooking = (id: string) => {
    setBookingRequests((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'approved' } : b))
    );
  };

  const handleDeclineBooking = (id: string) => {
    setBookingRequests((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'declined' } : b))
    );
  };

  const handleAuthenticated = (role: UserRole, name: string) => {
    setCurrentUser({ role, name });
    if (role === 'host') {
      setCurrentTab('host-dashboard');
    } else if (role === 'super_admin') {
      setCurrentTab('admin-portal');
    } else if (role === 'developer') {
      setStagingUser('developer');
      sessionStorage.setItem('np_staging_user', 'developer');
      setM2BypassMode(true);
      setCurrentTab('phase1-inventory');
    } else if (role === 'guest') {
      setCurrentTab('find-housing');
    } else {
      setCurrentTab('nurse-dashboard');
    }
  };

  return (
    <div
      className={`min-h-screen flex flex-col transition-colors duration-200 ${
        isNightShiftMode ? 'bg-[#08101C] text-[#E6ECF7]' : 'bg-[#faf8ff] text-[#001848]'
      }`}
    >
      {/* Staging Auth Modal Gate */}
      <StagingAuthGateModal
        isOpen={!isStagingAuthenticated}
        onAuthenticated={(userType) => {
          setIsStagingAuthenticated(true);
          setStagingUser(userType);
          if (userType === 'developer') {
            setCurrentUser({ role: 'developer', name: 'Joshua (Lead Developer)' });
            setM2BypassMode(true);
          } else {
            setCurrentUser({ role: 'nurse', name: 'Sarah Jenkins, RN' });
            setM2BypassMode(false);
          }
        }}
        isNightShiftMode={isNightShiftMode}
      />

      {/* Sticky Navigation Header with Integrated Staging Status Banner */}
      <Header
        topBanner={
          isStagingAuthenticated && isStagingBannerVisible ? (
            isDeveloper ? (
              <div className="w-full bg-[#130b2e] text-white py-1.5 px-4 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-400" />
                  <span className="font-semibold tracking-wide">
                    Developer Workspace: <span className="text-purple-300 font-mono">Joshua (Lead Dev)</span>
                  </span>
                  <span className="hidden sm:inline opacity-40">•</span>
                  <span className="hidden sm:inline opacity-80 text-purple-200">
                    Milestone 2 In-Flight Tools &amp; System Specs Unlocked
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className={`px-2 py-0.5 rounded-full font-medium ${
                    m2BypassMode
                      ? 'bg-purple-500/30 text-purple-200 border border-purple-400/40'
                      : 'bg-gray-700 text-gray-300 border border-gray-600'
                  }`}>
                    M2 Scope: {m2BypassMode ? 'UNLOCKED' : 'GATED'}
                  </span>
                  <button
                    type="button"
                    onClick={() => setM2BypassMode(!m2BypassMode)}
                    className="hover:underline opacity-80 hover:opacity-100 cursor-pointer font-mono"
                  >
                    {m2BypassMode ? 'Lock M2' : 'Unlock M2'}
                  </button>
                  <span className="opacity-40">|</span>
                  <button
                    type="button"
                    onClick={handleDeveloperSignOut}
                    className="text-amber-300 cursor-pointer flex items-center gap-1 font-semibold group"
                    title="Switch to Client Review perspective to see what Lawrence sees"
                  >
                    <span className="material-symbols-outlined text-[14px]">visibility</span>
                    <span className="group-hover:underline">View as Client</span>
                  </button>
                  <span className="opacity-40">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('np_staging_auth_lawrence');
                      sessionStorage.removeItem('np_staging_user');
                      setIsStagingAuthenticated(false);
                    }}
                    className="text-[#ffb4ab] cursor-pointer flex items-center gap-1 group"
                  >
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span className="group-hover:underline">Lock Preview</span>
                  </button>
                  <span className="opacity-40">|</span>
                  <button
                    type="button"
                    onClick={() => setIsStagingBannerVisible(false)}
                    className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                    title="Autohide staging review bar"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="w-full bg-[#001848] text-white py-1.5 px-4 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#10b981]" />
                  <span className="font-semibold tracking-wide">
                    Staging Review: <span className="text-[#aff0db] font-mono">lawrence</span>
                  </span>
                  <span className="hidden sm:inline opacity-40">•</span>
                  <span className="hidden sm:inline opacity-80">
                    Milestone 1 Core Acceptance Build (NC Focus)
                  </span>
                </div>
                <div className="flex items-center gap-2 text-[11px]">
                  <span className="text-[#aff0db] font-medium hidden sm:inline">
                    Verified Client Review Access
                  </span>
                  <span className="opacity-40 hidden sm:inline">|</span>
                  <button
                    type="button"
                    onClick={handleDeveloperSignIn}
                    className="hover:underline text-gray-400 hover:text-purple-300 focus-visible:text-purple-300 text-[10px] font-mono cursor-pointer"
                    title="Switch to Developer Mode"
                  >
                    Developer Mode
                  </button>
                  <span className="opacity-40">|</span>
                  <button
                    type="button"
                    onClick={() => {
                      sessionStorage.removeItem('np_staging_auth_lawrence');
                      sessionStorage.removeItem('np_staging_user');
                      setIsStagingAuthenticated(false);
                    }}
                    className="text-[#ffb4ab] cursor-pointer flex items-center gap-1 group"
                  >
                    <span className="material-symbols-outlined text-[14px]">lock</span>
                    <span className="group-hover:underline">Lock Preview</span>
                  </button>
                  <span className="opacity-40">|</span>
                  <button
                    type="button"
                    onClick={() => setIsStagingBannerVisible(false)}
                    className="p-1 rounded-md hover:bg-white/10 text-white/70 hover:text-white transition-colors cursor-pointer flex items-center justify-center"
                    title="Autohide staging review bar"
                  >
                    <span className="material-symbols-outlined text-[15px]">close</span>
                  </button>
                </div>
              </div>
            )
          ) : null
        }
        currentTab={currentTab}
        onSelectTab={handleNavigateTab}
        savedCount={savedListingIds.length}
        onOpenSaved={() => setIsSavedOpen(true)}
        isNightShiftMode={isNightShiftMode}
        onToggleNightShift={() => setIsNightShiftMode(!isNightShiftMode)}
        onOpenSupport={() => setIsSupportOpen(true)}
        isVerified={verificationData.licenseStatus === 'verified'}
        onOpenAuth={(mode = 'signup') => {
          setAuthModalMode(mode);
          setIsAuthModalOpen(true);
        }}
        currentUser={currentUser}
        onSwitchRole={handleSwitchRole}
        m2BypassMode={m2BypassMode}
        onToggleM2Bypass={() => setM2BypassMode(!m2BypassMode)}
        isDeveloper={isDeveloper}
        onLogout={handleInitiateLogout}
        showScreenCodes={showScreenCodes}
        onToggleScreenCodes={() => setShowScreenCodes(!showScreenCodes)}
        isStagingAuthenticated={isStagingAuthenticated}
        stagingClientName="lawrence"
        onToggleDeveloperMode={isDeveloper ? handleDeveloperSignOut : handleDeveloperSignIn}
        onLockPreview={() => {
          sessionStorage.removeItem('np_staging_auth_lawrence');
          sessionStorage.removeItem('np_staging_user');
          setIsStagingAuthenticated(false);
        }}
        isStagingBannerVisible={isStagingBannerVisible}
        onToggleStagingBanner={() => setIsStagingBannerVisible(!isStagingBannerVisible)}
      />

      {/* Main Content Area - Seamlessly flush against sticky header */}
      <main className="w-full flex-1 flex flex-col">
        {/* Breadcrumb Navigation Trail */}
        <Breadcrumbs
          currentTab={currentTab}
          onSelectTab={handleNavigateTab}
          isNightShiftMode={isNightShiftMode}
          verificationStep={verificationStep}
          onSelectVerificationStep={(step) => {
            setVerificationStep(step);
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          searchHospital={currentTab === 'search-listings' ? searchParamsState.hospital : undefined}
          currentUserRole={currentUser.role}
          showScreenCodes={showScreenCodes}
          onGoBack={handleGoBack}
          canGoBack={tabHistory.length > 0 || currentTab !== 'find-housing'}
        />
        <Suspense fallback={<ViewLoadingFallback />}>
          {/* Clinician Dashboard & Trust Profile (Exempt from M2 gate per user directive) */}
          {currentTab === 'nurse-dashboard' && (
            <NurseDashboardView
            isNightShiftMode={isNightShiftMode}
            isVerified={verificationData.licenseStatus === 'verified'}
            onGoToVerification={() => {
              setCurrentTab('verification');
              setVerificationStep(3);
            }}
            onGoToHousing={() => setCurrentTab('find-housing')}
            onOpenSupport={() => setIsSupportOpen(true)}
            savedListingIds={savedListingIds}
            onToggleSave={handleToggleSaveListing}
            allListings={MOCK_LISTINGS}
            activeBookings={bookingRequests}
            m2BypassMode={m2BypassMode}
            onToggleM2Bypass={() => setM2BypassMode(!m2BypassMode)}
            isDeveloper={isDeveloper}
          />
        )}

        {/* Host Portal & Dashboard (Exempt from M2 gate per user directive) */}
        {currentTab === 'host-dashboard' && (
          <HostPortalView
            isNightShiftMode={isNightShiftMode}
            bookingRequests={bookingRequests}
            onApproveBooking={handleApproveBooking}
            onDeclineBooking={handleDeclineBooking}
            onGoToHousing={() => setCurrentTab('find-housing')}
          />
        )}

        {/* Super-Admin Portal: Meaningful Access Role Gating */}
        {currentTab === 'admin-portal' && currentUser.role !== 'super_admin' && (
          <div className="flex-1 flex items-center justify-center p-6 bg-[#f8fafc] dark:bg-[#07101e]">
            <div className="max-w-lg w-full bg-white dark:bg-[#0B1626] rounded-3xl p-8 border border-[rgba(11,37,89,0.1)] dark:border-[#233550] shadow-md text-center space-y-5">
              <div className="w-16 h-16 rounded-2xl bg-amber-500/15 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <span className="material-symbols-outlined text-3xl">admin_panel_settings</span>
              </div>
              <div className="space-y-2">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600 dark:text-amber-400">
                  Role Permission Restricted
                </span>
                <h2 className="text-xl sm:text-2xl font-bold text-[#001848] dark:text-white">
                  Super-Admin Workspace Required
                </h2>
                <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  You are currently browsing as <strong>{currentUser.name}</strong> ({currentUser.role === 'nurse' ? 'Clinician' : 'Property Host'}).
                  The Super-Admin Operations Hub manages sensitive primary source license queues, platform fee escrow controls, and the Google Sheets data bridge.
                </p>
              </div>
              <div className="pt-2 flex flex-col sm:flex-row gap-3 justify-center">
                <button
                  type="button"
                  onClick={() => handleSwitchRole('super_admin')}
                  className="px-6 py-3 rounded-full bg-[#001848] dark:bg-[#005684] text-white text-xs font-bold hover:bg-[#162e62] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#162e62] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Switch to Super-Admin Role</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab(currentUser.role === 'host' ? 'host-dashboard' : 'find-housing')}
                  className="px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-50 dark:hover:bg-gray-800 focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-gray-800 transition-colors cursor-pointer"
                >
                  Return to My Workspace
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Super-Admin / Operations Portal: Authorized */}
        {currentTab === 'admin-portal' && (currentUser.role === 'super_admin' || currentUser.role === 'developer') && (
          <AdminPortalView
            isNightShiftMode={isNightShiftMode}
            onGoToHousing={() => setCurrentTab('find-housing')}
            onOpenGoogleSheets={handleOpenGoogleSheets}
            onGoToTier2Plumbing={() => handleNavigateTab('tier2-plumbing')}
            bookingRequests={bookingRequests}
            listings={MOCK_LISTINGS}
            isDeveloper={isDeveloper}
          />
        )}

        {/* Tier 2 Backend & Plumbing Console */}
        {currentTab === 'tier2-plumbing' && (
          <Tier2PlumbingDashboard
            isNightShiftMode={isNightShiftMode}
            onNavigateTab={(tab) => handleNavigateTab(tab as NavigationTab)}
            onOpenCheckoutDemo={() => {
              handleOpenCheckout(MOCK_LISTINGS[0]);
            }}
          />
        )}

        {/* Portal A: Credentialing Flow View */}
        {currentTab === 'verification' && (
          <>
            {verificationStep === 1 && (
              <IdentityStep
                data={verificationData}
                onChange={handleUpdateVerification}
                onNextStep={() => setVerificationStep(2)}
                onSelectStep={(step) => setVerificationStep(step)}
                isNightShiftMode={isNightShiftMode}
              />
            )}
            {verificationStep === 2 && (
              <ContactStep
                data={verificationData}
                onChange={handleUpdateVerification}
                onNextStep={() => setVerificationStep(3)}
                onSelectStep={(step) => setVerificationStep(step)}
                isNightShiftMode={isNightShiftMode}
                onOpenPostmarkEmail={() => setCurrentTab('email-verification')}
                onOpenTwilioOtp={() => setCurrentTab('phone-verification')}
              />
            )}
            {verificationStep === 3 && (
              <ClinicalLicenseStep
                data={verificationData}
                onChange={handleUpdateVerification}
                onNextStep={() => setVerificationStep(4)}
                onSelectStep={(step) => setVerificationStep(step)}
                isNightShiftMode={isNightShiftMode}
                onOpenSuccessModal={() => setIsSuccessModalOpen(true)}
              />
            )}
            {verificationStep === 4 && (
              <WorkContractStep
                data={verificationData}
                onChange={handleUpdateVerification}
                onSelectStep={(step) => setVerificationStep(step)}
                onOpenSuccessModal={() => setIsSuccessModalOpen(true)}
                isNightShiftMode={isNightShiftMode}
              />
            )}
          </>
        )}

        {/* Portal A: Home Page with Featured Sanctuary Listings (Screen A1) */}
        {currentTab === 'find-housing' && (
          <FindHousingView
            isNightShiftMode={isNightShiftMode}
            savedListingIds={savedListingIds}
            onToggleSave={handleToggleSaveListing}
            isVerified={verificationData.licenseStatus === 'verified'}
            onGoToVerification={() => {
              setCurrentTab('verification');
              setVerificationStep(3);
            }}
            onGoToEmailVerification={() => {
              setCurrentTab('email-verification');
            }}
            onGoToPhoneVerification={() => {
              setCurrentTab('phone-verification');
            }}
            onRequestToBookListing={handleOpenCheckout}
            onGoToSearchListings={(params) => {
              if (params) {
                setSearchParamsState((prev) => ({
                  hospital: params.hospital || prev.hospital,
                  duration: params.duration || prev.duration,
                  radius: params.radius ?? prev.radius,
                }));
              }
              setCurrentTab('search-listings');
            }}
            onGoToHostPortal={() => setCurrentTab('host-dashboard')}
            userRole={currentUser.role}
            userName={currentUser.name}
          />
        )}

        {/* Portal A: Dedicated Search Listings & Interactive Map (Screen A2) */}
        {currentTab === 'search-listings' && (
          <SearchListingsView
            isNightShiftMode={isNightShiftMode}
            savedListingIds={savedListingIds}
            onToggleSave={handleToggleSaveListing}
            isVerified={verificationData.licenseStatus === 'verified'}
            onGoToVerification={() => {
              setCurrentTab('verification');
              setVerificationStep(3);
            }}
            onRequestToBookListing={handleOpenCheckout}
            initialHospital={searchParamsState.hospital}
            initialDuration={searchParamsState.duration}
            initialRadius={searchParamsState.radius}
            m2BypassMode={m2BypassMode}
            onToggleM2Bypass={() => setM2BypassMode(!m2BypassMode)}
            isDeveloper={isDeveloper}
          />
        )}

        {/* Postmark Institutional Email Verification Step View */}
        {currentTab === 'email-verification' && (
          <PostmarkEmailVerificationView
            isNightShiftMode={isNightShiftMode}
            initialEmail={verificationData.workEmail}
            onProceedToPhoneVerification={() => {
              handleUpdateVerification({ isContactVerified: true });
              setCurrentTab('phone-verification');
            }}
            onProceedToLicenseVerification={() => {
              handleUpdateVerification({ isContactVerified: true });
              setCurrentTab('verification');
              setVerificationStep(3);
            }}
            onBackToOverview={() => {
              setCurrentTab('verification');
              setVerificationStep(2);
            }}
          />
        )}

        {/* Twilio SMS OTP Mobile Verification Step View */}
        {currentTab === 'phone-verification' && (
          <TwilioPhoneOtpView
            isNightShiftMode={isNightShiftMode}
            initialPhone={verificationData.mobilePhone}
            onProceedToLicenseVerification={() => {
              handleUpdateVerification({ phoneVerified: true });
              setCurrentTab('verification');
              setVerificationStep(3);
            }}
            onBackToEmail={() => {
              setCurrentTab('email-verification');
            }}
          />
        )}

        {/* How It Works View */}
        {currentTab === 'how-it-works' && (
          <HowItWorksView
            isNightShiftMode={isNightShiftMode}
            onGoToVerification={() => {
              setCurrentTab('verification');
              setVerificationStep(3);
            }}
            onGoToHousing={() => setCurrentTab('find-housing')}
          />
        )}

        {/* For Hosts View */}
        {currentTab === 'for-hosts' && (
          <ForHostsView
            isNightShiftMode={isNightShiftMode}
            onGoToHousing={() => setCurrentTab('find-housing')}
            onGoToHostPortal={() => {
              setCurrentUser({ role: 'host', name: 'Michael Vance (Host)' });
              setCurrentTab('host-dashboard');
            }}
          />
        )}

        {/* Verified Hospitals Directory View */}
        {currentTab === 'verified-hospitals' && (
          <VerifiedHospitalsView
            isNightShiftMode={isNightShiftMode}
            onSelectHospital={handleSelectHospitalFromDirectory}
          />
        )}

        {/* Phase 1 Master Inventory & Flow Navigator: Developer Gate */}
        {currentTab === 'phase1-inventory' && !isDeveloper && (
          <Milestone2ScopeGate
            isNightShiftMode={isNightShiftMode}
            featureTitle="Product Scope &amp; Screen Specifications (Developer Audit)"
            featureDescription="This technical specification inventory and screen simulator is restricted to developer access during Milestone 1 client acceptance."
            onReturnToMarketplace={() => setCurrentTab('find-housing')}
          />
        )}

        {currentTab === 'phase1-inventory' && isDeveloper && !m2BypassMode && (
          <Milestone2ScopeGate
            isNightShiftMode={isNightShiftMode}
            featureTitle="Product Scope &amp; Screen Specifications (Developer Audit)"
            featureDescription="The 150-screen master inventory, step-by-step UX flow simulator, and design system contract matrix are internal developer tools. You can enable Developer Mode to inspect all technical deliverables."
            onReturnToMarketplace={() => setCurrentTab('find-housing')}
            onBypassGate={() => setM2BypassMode(true)}
          />
        )}

        {currentTab === 'phase1-inventory' && isDeveloper && m2BypassMode && (
          <Phase1InventoryView
            isNightShiftMode={isNightShiftMode}
            onNavigateTab={(tab) => {
              setCurrentTab(tab);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSupport={() => setIsSupportOpen(true)}
            onOpenAuthModal={() => {
              setAuthModalMode('signup');
              setIsAuthModalOpen(true);
            }}
          />
        )}

        {/* Public &amp; Legal Sanctuaries */}
        {currentTab === 'legal-policies' && (
          <LegalPoliciesView
            isNightShiftMode={isNightShiftMode}
            onNavigateHome={() => {
              setCurrentTab('find-housing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}

        {/* System Error &amp; Maintenance States */}
        {currentTab === 'system-status' && (
          <SystemStatusView
            isNightShiftMode={isNightShiftMode}
            onNavigateHome={() => {
              setCurrentTab('find-housing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            onOpenSupport={() => setIsSupportOpen(true)}
            isDeveloper={isDeveloper}
          />
        )}

        {/* Mobile Native Parity Simulator (Milestone 2 Deliverable) */}
        {currentTab === 'mobile-preview' && !isDeveloper && (
          <Milestone2ScopeGate
            isNightShiftMode={isNightShiftMode}
            featureTitle="Native iOS &amp; Android Mobile Parity (Milestone 2)"
            featureDescription="Native iOS &amp; Android mobile application releases, push notifications, and shift geo-fencing are scheduled as Milestone 2 deliverables following web core milestone acceptance."
            onReturnToMarketplace={() => setCurrentTab('find-housing')}
          />
        )}

        {currentTab === 'mobile-preview' && isDeveloper && !m2BypassMode && (
          <Milestone2ScopeGate
            isNightShiftMode={isNightShiftMode}
            featureTitle="Native iOS &amp; Android Mobile Parity (Milestone 2)"
            featureDescription="Native iOS &amp; Android mobile application releases, push notifications, and shift geo-fencing are scheduled as Milestone 2 deliverables following web core milestone acceptance."
            onReturnToMarketplace={() => setCurrentTab('find-housing')}
            onBypassGate={() => setM2BypassMode(true)}
          />
        )}

        {currentTab === 'mobile-preview' && isDeveloper && m2BypassMode && (
          <MobileParityView
            isNightShiftMode={isNightShiftMode}
            onNavigateHome={() => {
              setCurrentTab('find-housing');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        )}
        </Suspense>

        {/* Subtle, vanishing scroll-progress indicator for long-form views */}
        <ScrollProgressIndicator
          isNightShiftMode={isNightShiftMode}
          currentTab={currentTab}
        />
      </main>

      {/* Global Footer */}
      <Footer
        isNightShiftMode={isNightShiftMode}
        onOpenSupport={() => setIsSupportOpen(true)}
        onSelectTab={handleNavigateTab}
        isDeveloper={isDeveloper}
      />

      {/* Itemized Checkout Modal (Screen A4) - Lazy loaded only when requested */}
      {isCheckoutOpen && (
        <Suspense fallback={null}>
          <ItemizedCheckoutModal
            isOpen={isCheckoutOpen}
            onClose={() => setIsCheckoutOpen(false)}
            listing={checkoutListing}
            isNightShiftMode={isNightShiftMode}
            onBookingSubmitted={handleConfirmCheckout}
          />
        </Suspense>
      )}

      {/* Safe Clinical Onboarding & Sign-In Modal (Screens AU-01 & AU-03) */}
      {isAuthModalOpen && (
        <Suspense fallback={null}>
          <AuthModal
            isOpen={isAuthModalOpen}
            initialMode={authModalMode}
            onClose={() => setIsAuthModalOpen(false)}
            isNightShiftMode={isNightShiftMode}
            onAuthenticated={handleAuthenticated}
            onOpenEmailVerification={() => setCurrentTab('email-verification')}
            showScreenCodes={showScreenCodes}
            onToggleScreenCodes={handleToggleScreenCodes}
            isDeveloper={isDeveloper}
            onDeveloperSignIn={handleDeveloperSignIn}
          />
        </Suspense>
      )}

      {/* Celebration / Success Modal */}
      {isSuccessModalOpen && (
        <Suspense fallback={null}>
          <VerificationSuccessModal
            isOpen={isSuccessModalOpen}
            onClose={() => setIsSuccessModalOpen(false)}
            data={verificationData}
            onGoToHousing={() => {
              setIsSuccessModalOpen(false);
              setCurrentTab('find-housing');
            }}
            isNightShiftMode={isNightShiftMode}
          />
        </Suspense>
      )}

      {/* 24/7 Support Modal */}
      {isSupportOpen && (
        <Suspense fallback={null}>
          <NurseSupportModal
            isOpen={isSupportOpen}
            onClose={() => setIsSupportOpen(false)}
            isNightShiftMode={isNightShiftMode}
          />
        </Suspense>
      )}

      {/* Saved Housing Sanctuaries Modal */}
      {isSavedOpen && (
        <Suspense fallback={null}>
          <SavedListingsModal
            isOpen={isSavedOpen}
            onClose={() => setIsSavedOpen(false)}
            savedListingIds={savedListingIds}
            onToggleSave={handleToggleSaveListing}
            onSelectListing={() => {
              setCurrentTab('find-housing');
            }}
            isNightShiftMode={isNightShiftMode}
            onGoToHousing={() => {
              setCurrentTab('find-housing');
            }}
          />
        </Suspense>
      )}

      {/* Google Sheets Live Integration & Tax/Payout Sync Modal (Admin Tool) */}
      {isSheetsModalOpen && (
        <Suspense fallback={null}>
          <GoogleSheetsSyncModal
            isOpen={isSheetsModalOpen}
            onClose={() => setIsSheetsModalOpen(false)}
            isNightShiftMode={isNightShiftMode}
            initialPreset={sheetsPreset}
            bookingRequests={bookingRequests}
            listings={MOCK_LISTINGS}
            demandReports={MOCK_DEMAND_REPORTS}
            licenseReviews={MOCK_ADMIN_LICENSE_REVIEWS}
            userRole={currentUser.role}
          />
        </Suspense>
      )}

      {/* Logout Confirmation Dialog (Clears user sessions & resets to Guest) */}
      {isLogoutDialogOpen && (
        <Suspense fallback={null}>
          <LogoutConfirmationModal
            isOpen={isLogoutDialogOpen}
            onClose={() => setIsLogoutDialogOpen(false)}
            onConfirmLogout={handleConfirmLogout}
            currentUser={currentUser}
            isNightShiftMode={isNightShiftMode}
          />
        </Suspense>
      )}

      {/* Floating Discreet Staging Indicator when Top Bar is Autohidden */}
      {isStagingAuthenticated && !isStagingBannerVisible && (
        <aside aria-label="Staging Environment Indicator" className="fixed bottom-4 right-4 z-40">
          <button
            type="button"
            onClick={() => setIsStagingBannerVisible(true)}
            className="px-3 py-1.5 rounded-full bg-[#001848]/90 dark:bg-[#111e33]/90 backdrop-blur-md text-white border border-[#0A6FA8]/40 shadow-lg text-[11px] font-medium flex items-center gap-1.5 hover:border-[#0A6FA8] transition-all cursor-pointer group"
            title="Expand staging review bar"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 group-hover:scale-125 transition-transform" />
            <span className="font-mono text-[11px]">lawrence</span>
            <span className="text-[10px] text-gray-300">({isDeveloper ? 'dev' : 'review'})</span>
            <span className="material-symbols-outlined text-[13px] text-gray-400 group-hover:text-white">expand_less</span>
          </button>
        </aside>
      )}
    </div>
  );
}
