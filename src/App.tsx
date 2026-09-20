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

export default function App() {
  // Navigation & verification step state
  const [currentTab, setCurrentTab] = useState<NavigationTab>('find-housing');
  const [verificationStep, setVerificationStep] = useState<VerificationStepId>(3);
  const [verificationData, setVerificationData] = useState<VerificationFormData>(
    INITIAL_VERIFICATION_DATA
  );

  // Saved listings state (initialized with 1 saved sanctuary)
  const [savedListingIds, setSavedListingIds] = useState<string[]>(['hosp-1']);

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
  const [currentUser, setCurrentUser] = useState<{ role: UserRole; name: string }>({
    role: 'nurse',
    name: 'Sarah Jenkins',
  });

  // Checkout modal state (Screen A4)
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [checkoutListing, setCheckoutListing] = useState<HousingListing>(MOCK_LISTINGS[0]);

  // Dedicated search params state (Screen A2)
  const [searchParamsState, setSearchParamsState] = useState({
    hospital: 'UCSF Medical Center - Mission Bay (San Francisco, CA)',
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
      />

      {/* Main Content Area */}
      <main className="w-full pt-20 flex-1 flex flex-col">
        {/* PORTAL A: Screen A5 Nurse Dashboard */}
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

        {/* PORTAL B: Screens B1-B3 Host Portal */}
        {currentTab === 'host-dashboard' && (
          <HostPortalView
            isNightShiftMode={isNightShiftMode}
            bookingRequests={bookingRequests}
            onApproveBooking={handleApproveBooking}
            onDeclineBooking={handleDeclineBooking}
            onGoToHousing={() => setCurrentTab('find-housing')}
          />
        )}

        {/* PORTAL C: Screens C1-C4 Super-Admin Portal */}
        {currentTab === 'admin-portal' && (
          <AdminPortalView
            isNightShiftMode={isNightShiftMode}
            onGoToHousing={() => setCurrentTab('find-housing')}
            onOpenGoogleSheets={handleOpenGoogleSheets}
            bookingRequests={bookingRequests}
            listings={MOCK_LISTINGS}
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
          />
        )}

        {/* Verified Hospitals Directory View */}
        {currentTab === 'verified-hospitals' && (
          <VerifiedHospitalsView
            isNightShiftMode={isNightShiftMode}
            onSelectHospital={handleSelectHospitalFromDirectory}
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
