import React, { useState, useEffect } from 'react';
import { NavigationTab, VerificationStepId, VerificationFormData } from './types';
import { INITIAL_VERIFICATION_DATA } from './data/mockData';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { ClinicalLicenseStep } from './components/ClinicalLicenseStep';
import { IdentityStep } from './components/IdentityStep';
import { ContactStep } from './components/ContactStep';
import { WorkContractStep } from './components/WorkContractStep';
import { FindHousingView } from './components/FindHousingView';
import { HowItWorksView } from './components/HowItWorksView';
import { ForHostsView } from './components/ForHostsView';
import { VerifiedHospitalsView } from './components/VerifiedHospitalsView';
import { VerificationSuccessModal } from './components/VerificationSuccessModal';
import { NurseSupportModal } from './components/NurseSupportModal';
import { SavedListingsModal } from './components/SavedListingsModal';

export default function App() {
  // Navigation & verification step state (Default to Screen 1: Healthcare Assignment Housing Marketplace)
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

  const handleSelectHospitalFromDirectory = (hospitalName: string) => {
    setCurrentTab('find-housing');
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
      />

      {/* Main Content Area */}
      <main className="w-full pt-20 flex-1 flex flex-col">
        {/* Verification Flow View */}
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

        {/* Find Housing Marketplace View */}
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
    </div>
  );
}
