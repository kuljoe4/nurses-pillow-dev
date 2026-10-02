export interface DbListingRow {
  id: string;
  host_id?: string;
  title: string;
  property_type?: string;
  address?: string;
  city: string;
  state: string;
  zip?: string;
  latitude: number | string;
  longitude: number | string;
  nearest_hospital_id?: string;
  monthly_rate: number | string;
  security_deposit?: number | string;
  cleaning_fee?: number | string;
  is_active?: boolean;
  cancellation_tier?: string;
  pet_fee: number | string;
  parking_fee?: number | string;
  extra_options?: any;
}

// Maps enterprise DB schema formats to the `HousingListing` format the frontend expects.
export function mapDbListingToFrontend(dbRow: DbListingRow) {

  return {
    id: dbRow.id,
    title: dbRow.title,
    neighborhood: dbRow.address || '',
    city: dbRow.city,
    state: dbRow.state,
    proximityToHospital: "Under 5 Miles",
    nearestHospital: dbRow.nearest_hospital_id || 'Unknown',
    driveTimeMinutes: 10,
    monthlyRate: Number(dbRow.monthly_rate),
    weeklyRate: Math.round(Number(dbRow.monthly_rate) / 4),
    beds: 1,
    baths: 1,
    sqft: 800,
    images: [
      'https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=800',
      'https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=800'
    ],
    nurseRating: 98,
    reviewsCount: 12,
    amenities: {
      blackoutCurtains: true,
      whiteNoiseMachine: true,
      daySleeperQuietHours: true,
      washerDryerInUnit: true,
      dedicatedParking: true,
      highSpeedWifi: true,
      fullyFurnished: true,
      petFriendly: Number(dbRow.pet_fee) > 0,
      privateEntrance: false
    },
    contractFlexProtection: dbRow.cancellation_tier === 'flexible',
    featuredSanctuary: false,
    propertyType: dbRow.property_type,
    latitude: Number(dbRow.latitude),
    longitude: Number(dbRow.longitude),
    petFee: Number(dbRow.pet_fee || 0),
    parkingFee: Number(dbRow.parking_fee || 0),
    extraOptions: typeof dbRow.extra_options === 'string' ? JSON.parse(dbRow.extra_options) : dbRow.extra_options,
  };
}
