export type NavigationTab = 
  | 'verification'
  | 'find-housing'
  | 'how-it-works'
  | 'for-hosts'
  | 'nurse-support'
  | 'verified-hospitals';

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
