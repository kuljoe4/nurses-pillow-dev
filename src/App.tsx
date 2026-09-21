import React, { useState, useEffect } from 'react';
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
import { SearchListingsView } from './components/SearchListingsView';
import { HowItWorksView } from './components/HowItWorksView';
import { ForHostsView } from './components/ForHostsView';
import { VerifiedHospitalsView } from './components/VerifiedHospitalsView';
import { VerificationSuccessModal } from './components/VerificationSuccessModal';
import { NurseSupportModal } from './components/NurseSupportModal';
import { SavedListingsModal } from './components/SavedListingsModal';
import { PostmarkEmailVerificationView } from './components/PostmarkEmailVerificationView';
import { TwilioPhoneOtpView } from './components/TwilioPhoneOtpView';
import { ItemizedCheckoutModal } from './components/ItemizedCheckoutModal';
import { NurseDashboardView } from './components/NurseDashboardView';
import { HostPortalView } from './components/HostPortalView';
import { AdminPortalView } from './components/AdminPortalView';
import { AuthModal } from './components/AuthModal';
import { GoogleSheetsSyncModal, AdminSheetsPreset } from './components/GoogleSheetsSyncModal';
import { Phase1InventoryView } from './components/Phase1InventoryView';
import { LegalPoliciesView } from './components/LegalPoliciesView';
import { SystemStatusView } from './components/SystemStatusView';
import { MobileParityView } from './components/MobileParityView';
import { StagingAuthGateModal } from './components/StagingAuthGateModal';
import { Milestone2ScopeGate } from './components/Milestone2ScopeGate';

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

  // Navigation & verification step state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('find-housing');
  const [verificationStep, setVerificationStep] = useState<VerificationStepId>(3);
  const [verificationData, setVerificationData] = useState<VerificationFormData>(
    INITIAL_VERIFICATION_DATA
  );

  // Saved listings state (initialized with 1 saved sanctuary)
  const [savedListingIds, setSavedListingIds] = useState<string[]>(['nc-duke-condo']);

  // Night shift mode state
  const [isNightShiftMode, setIsNightShiftMode] = useState<boolean>(false);

  // Modals state
  const [isSupportOpen, setIsSupportOpen] = useState(false);
  const [isSavedOpen, setIsSavedOpen] = useState(false);
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false);

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

      {/* Staging Status Banner */}
      {isDeveloper ? (
        <div className="w-full bg-[#130b2e] text-white py-1.5 px-4 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-purple-500/20 z-40 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-purple-400 animate-pulse" />
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
              className="hover:underline text-amber-300 cursor-pointer flex items-center gap-1 font-semibold"
              title="Switch to Client Review perspective to see what Lawrence sees"
            >
              <span className="material-symbols-outlined text-[14px]">visibility</span>
              View as Client
            </button>
            <span className="opacity-40">|</span>
            <button
              type="button"
              onClick={() => {
                sessionStorage.removeItem('np_staging_auth_lawrence');
                sessionStorage.removeItem('np_staging_user');
                setIsStagingAuthenticated(false);
              }}
              className="hover:underline text-[#ffb4ab] cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Lock Preview
            </button>
          </div>
        </div>
      ) : (
        <div className="w-full bg-[#001848] text-white py-1.5 px-4 text-xs flex flex-wrap items-center justify-between gap-2 border-b border-white/10 z-40 relative">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-[#10b981] animate-pulse" />
            <span className="font-semibold tracking-wide">
              Staging Review Link: <span className="text-[#aff0db]">lawrence</span> (HajjMalik)
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
              className="hover:underline text-gray-400 hover:text-purple-300 text-[10px] font-mono cursor-pointer"
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
              className="hover:underline text-[#ffb4ab] cursor-pointer flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">lock</span>
              Lock Preview
            </button>
          </div>
        </div>
      )}

      {/* Fixed Navigation Header */}
      <Header
        currentTab={currentTab}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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
      />

      {/* Main Content Area */}
      <main className="w-full pt-20 flex-1 flex flex-col">
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
            <div className="max-w-lg w-full bg-white dark:bg-[#0B1626] rounded-3xl p-8 border border-[rgba(11,37,89,0.1)] dark:border-[#233550] shadow-xl text-center space-y-5">
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
                  className="px-6 py-3 rounded-full bg-[#001848] dark:bg-[#005684] text-white text-xs font-bold hover:bg-[#162e62] transition-colors shadow-sm flex items-center justify-center gap-2 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  <span>Switch to Super-Admin Role</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCurrentTab(currentUser.role === 'host' ? 'host-dashboard' : 'find-housing')}
                  className="px-6 py-3 rounded-full border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-xs font-bold hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
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
            bookingRequests={bookingRequests}
            listings={MOCK_LISTINGS}
            isDeveloper={isDeveloper}
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
      </main>

      {/* Global Footer */}
      <Footer
        isNightShiftMode={isNightShiftMode}
        onOpenSupport={() => setIsSupportOpen(true)}
        onSelectTab={(tab) => {
          setCurrentTab(tab);
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        isDeveloper={isDeveloper}
      />

      {/* Itemized Checkout Modal (Screen A4) */}
      <ItemizedCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        listing={checkoutListing}
        isNightShiftMode={isNightShiftMode}
        onBookingSubmitted={handleConfirmCheckout}
      />

      {/* Safe Clinical Onboarding & Sign-In Modal (Screens AU-01 & AU-03) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialMode={authModalMode}
        onClose={() => setIsAuthModalOpen(false)}
        isNightShiftMode={isNightShiftMode}
        onAuthenticated={handleAuthenticated}
        onOpenEmailVerification={() => setCurrentTab('email-verification')}
      />

      {/* Celebration / Success Modal */}
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

      {/* 24/7 Nurse Concierge Support Modal */}
      <NurseSupportModal
        isOpen={isSupportOpen}
        onClose={() => setIsSupportOpen(false)}
        isNightShiftMode={isNightShiftMode}
      />

      {/* Saved Housing Sanctuaries Modal */}
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

      {/* Google Sheets Live Integration & Tax/Payout Sync Modal (Admin Tool) */}
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
    </div>
  );
}
