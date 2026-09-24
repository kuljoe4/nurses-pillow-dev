export type NavigationTab = 
  | 'verification'
  | 'email-verification'
  | 'phone-verification'
  | 'find-housing'
  | 'search-listings'
  | 'nurse-dashboard'
  | 'host-dashboard'
  | 'host-onboarding'
  | 'admin-portal'
  | 'tier2-plumbing'
  | 'how-it-works'
  | 'for-hosts'
  | 'nurse-support'
  | 'verified-hospitals'
  | 'phase1-inventory'
  | 'legal-policies'
  | 'mobile-preview'
  | 'system-status';

export type UserRole = 'nurse' | 'host' | 'super_admin' | 'developer' | 'guest';

export type CancellationTier = 'flexible_30d' | 'moderate_60d' | 'strict_90d';

export interface BookingRequest {
  id: string;
  clinicianName: string;
  clinicianTitle: string;
  clinicianAvatar: string;
  clinicianPhone: string;
  hospitalName: string;
  unitSpecialty: string;
  listingId: string;
  listingTitle: string;
  startDate: string;
  endDate: string;
  durationWeeks: number;
  monthlyRent: number;
  securityDeposit: number;
  cleaningFee: number;
  petFee: number;
  travelerFee: number;
  totalInitialCharge: number;
  hostNetPayout: number;
  status: 'pending_host_approval' | 'approved' | 'declined' | 'active' | 'completed';
  submittedAt: string;
  deadlineHoursRemaining: number;
  specialRequests?: string;
  doorCode?: string;
  wifiNetwork?: string;
}

export interface AdminLicenseReview {
  id: string;
  clinicianLegalName: string;
  profession: 'RN' | 'MD' | 'DO' | 'PA' | 'NP' | 'PT' | 'CRNA';
  issuingState: string;
  licenseNumber: string;
  licenseStatus: 'pending_review' | 'verified' | 'rejected' | 'info_requested';
  hospitalAffiliation: string;
  submittedAt: string;
  nursysLookupUrl: string;
  documentPurged: boolean;
}

export interface MarketDemandReport {
  hospitalName: string;
  healthSystem: string;
  cityState: string;
  clinicianSearchCount30d: number;
  activeHostListings: number;
  priorityRecruitmentTier: 'CRITICAL' | 'HIGH' | 'MODERATE';
}

export interface PromoCode {
  id: string;
  code: string;
  discountPercentage: number;
  minBookingValue: number;
  expiresAt: string;
  usageLimit: number;
  usageCount: number;
  isActive: boolean;
}

export type VerificationStepId = 1 | 2 | 3 | 4;

export interface VerificationFormData {
  // Step 1: Identity
  legalFirstName: string;
  legalLastName: string;
  dob: string;
  lastFourSSN: string;
  idDocumentName?: string;
  isIdVerified: boolean;

  // Step 2: Email & Phone
  workEmail: string;
  mobilePhone: string;
  phoneVerified: boolean;
  isContactVerified: boolean;

  // Step 3: Clinical License (Exact screen)
  professionSpecialty: string;
  licenseNumber: string;
  issuingStateBoard: string;
  licenseExpirationDate: string;
  uploadedDocument: {
    name: string;
    size: string;
    uploadedAt: string;
    fileType: string;
  } | null;
  licenseStatus: 'pending_review' | 'verified' | 'unsubmitted';

  // Step 4: Work Contract
  travelAgency: string;
  contractHospital: string;
  assignmentStartDate: string;
  contractDurationWeeks: number;
  contractDocumentName?: string;
  isContractVerified: boolean;
}

export interface HousingListing {
  id: string;
  title: string;
  neighborhood: string;
  city: string;
  state: string;
  proximityToHospital: string;
  nearestHospital: string;
  driveTimeMinutes: number;
  monthlyRate: number;
  weeklyRate: number;
  beds: number;
  baths: number;
  sqft: number;
  images: string[];
  nurseRating: number;
  reviewsCount: number;
  amenities: {
    blackoutCurtains: boolean;
    whiteNoiseMachine: boolean;
    daySleeperQuietHours: boolean;
    washerDryerInUnit: boolean;
    dedicatedParking: boolean;
    highSpeedWifi: boolean;
    fullyFurnished: boolean;
    petFriendly: boolean;
    privateEntrance: boolean;
  };
  contractFlexProtection: boolean;
  featuredSanctuary: boolean;
  propertyType?: string;
  hostType?: string;
  hostId?: string;
  hostName?: string;
  highlightBadges?: string[];
  distanceBadge?: string;
  requiresSecurityDeposit?: boolean;
  securityDeposit?: number;
  depositTermsExplainer?: string;
  customFeeOverridePercent?: number;
  hasFeeOverride?: boolean;
}

export interface Hospital {
  id: string;
  name: string;
  city: string;
  state: string;
  traumaLevel: string;
  teachingHospital: boolean;
  availableSanctuariesCount: number;
  shiftTypes: string[];
  parkingType: string;
  nurseFeedbackScore: number;
}
