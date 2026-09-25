// Maps enterprise DB schema formats to the `HousingListing` format the frontend expects.
export function mapDbListingToFrontend(dbRow: any) {
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
      'https://images.unsplash.com/photo-1502672260266-1c1de2d9d00c?auto=format&fit=crop&q=80&w=800'
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
    longitude: Number(dbRow.longitude)
  };
}
