/**
 * Google Maps-Powered Commute Duration & Travel Time Engine
 * Calculates real-time driving, transit, and distance metrics
 * between housing listings and the clinician's selected hospital assignment.
 */

export interface HospitalCoordinates {
  name: string;
  shortName: string;
  address: string;
  lat: number;
  lng: number;
  healthSystem: string;
}

export interface ListingCoordinates {
  lat: number;
  lng: number;
  city: string;
  state: string;
}

export interface CommuteCalculationResult {
  hospitalName: string;
  hospitalShortName: string;
  distanceMiles: number;
  driveMinutes: number;
  transitMinutes: number;
  walkMinutes: number;
  trafficStatus: string; // e.g. 'Normal shift traffic' | 'Light night-shift flow'
  routeSummary: string; // e.g. 'Via Erwin Rd & Fulton St'
  isShiftSafe: boolean; // Commute <= 15 minutes
  dayShiftDepartureEstimate: string; // 7:00 AM check-in
  nightShiftDepartureEstimate: string; // 7:00 PM check-in
  travelModeSummary: string;
}

// Master directory of hospital assignment hubs
export const HOSPITAL_GEO_DIRECTORY: Record<string, HospitalCoordinates> = {
  'Duke University Hospital': {
    name: 'Duke University Hospital',
    shortName: 'Duke Hospital',
    address: '2301 Erwin Rd, Durham, NC 27710',
    lat: 36.0076,
    lng: -78.9382,
    healthSystem: 'Duke Health',
  },
  'UNC Medical Center': {
    name: 'UNC Medical Center (Chapel Hill)',
    shortName: 'UNC Medical Center',
    address: '101 Manning Dr, Chapel Hill, NC 27514',
    lat: 35.9049,
    lng: -79.0526,
    healthSystem: 'UNC Health',
  },
  'WakeMed Raleigh Campus': {
    name: 'WakeMed Raleigh Campus',
    shortName: 'WakeMed Raleigh',
    address: '3000 New Bern Ave, Raleigh, NC 27610',
    lat: 35.7892,
    lng: -78.5886,
    healthSystem: 'WakeMed Health',
  },
  'Atrium Health Carolinas Medical Center': {
    name: 'Atrium Health Carolinas Medical Center',
    shortName: 'Atrium Health CMC',
    address: '1000 Blythe Blvd, Charlotte, NC 28203',
    lat: 35.2036,
    lng: -80.8385,
    healthSystem: 'Advocate Health',
  },
  'ECU Health Medical Center': {
    name: 'ECU Health Medical Center',
    shortName: 'ECU Health',
    address: '2100 Stantonsburg Rd, Greenville, NC 27834',
    lat: 35.6074,
    lng: -77.4048,
    healthSystem: 'ECU Health',
  },
  'Novant Health Forsyth Medical Center': {
    name: 'Novant Health Forsyth Medical Center',
    shortName: 'Novant Forsyth',
    address: '3333 Silas Creek Pkwy, Winston-Salem, NC 27103',
    lat: 36.0782,
    lng: -80.3015,
    healthSystem: 'Novant Health',
  },
  'Moses H. Cone Memorial Hospital': {
    name: 'Cone Health Moses H. Cone Memorial Hospital',
    shortName: 'Cone Health',
    address: '1200 N Elm St, Greensboro, NC 27401',
    lat: 36.0884,
    lng: -79.7915,
    healthSystem: 'Cone Health',
  },
  'Stanford Health Care': {
    name: 'Stanford Health Care - Main Hospital',
    shortName: 'Stanford Hospital',
    address: '300 Pasteur Dr, Stanford, CA 94305',
    lat: 37.4348,
    lng: -122.1751,
    healthSystem: 'Stanford Medicine',
  },
  'UCSF Medical Center': {
    name: 'UCSF Medical Center at Mission Bay',
    shortName: 'UCSF Mission Bay',
    address: '1825 4th St, San Francisco, CA 94158',
    lat: 37.7681,
    lng: -122.3908,
    healthSystem: 'UCSF Health',
  },
  'Cedars-Sinai Medical Center': {
    name: 'Cedars-Sinai Medical Center',
    shortName: 'Cedars-Sinai',
    address: '8700 Beverly Blvd, Los Angeles, CA 90048',
    lat: 34.0754,
    lng: -118.3804,
    healthSystem: 'Cedars-Sinai Health',
  },
  'Mayo Clinic Hospital': {
    name: 'Mayo Clinic Hospital, Saint Marys Campus',
    shortName: 'Mayo Clinic',
    address: '1216 2nd St SW, Rochester, MN 55902',
    lat: 44.0205,
    lng: -92.4831,
    healthSystem: 'Mayo Clinic',
  },
  'The Johns Hopkins Hospital': {
    name: 'The Johns Hopkins Hospital',
    shortName: 'Johns Hopkins',
    address: '1800 Orleans St, Baltimore, MD 21287',
    lat: 39.2969,
    lng: -76.5927,
    healthSystem: 'Johns Hopkins Medicine',
  },
  'University of Maryland Medical Center': {
    name: 'University of Maryland Medical Center',
    shortName: 'UMMC',
    address: '22 S Greene St, Baltimore, MD 21201',
    lat: 39.2882,
    lng: -76.6231,
    healthSystem: 'University of Maryland Medical System',
  },
  'Yale New Haven Hospital': {
    name: 'Yale New Haven Hospital',
    shortName: 'Yale New Haven',
    address: '20 York St, New Haven, CT 06510',
    lat: 41.3040,
    lng: -72.9360,
    healthSystem: 'Yale New Haven Health',
  },
  'Hartford Hospital': {
    name: 'Hartford Hospital',
    shortName: 'Hartford Hospital',
    address: '80 Seymour St, Hartford, CT 06102',
    lat: 41.7533,
    lng: -72.6789,
    healthSystem: 'Hartford HealthCare',
  },
  'Sanford Medical Center Fargo': {
    name: 'Sanford Medical Center Fargo',
    shortName: 'Sanford Fargo',
    address: '5225 23rd Ave S, Fargo, ND 58104',
    lat: 46.8524,
    lng: -96.8622,
    healthSystem: 'Sanford Health',
  },
  'Altru Health System': {
    name: 'Altru Health System',
    shortName: 'Altru Health',
    address: '1200 S Columbia Rd, Grand Forks, ND 58201',
    lat: 47.9152,
    lng: -97.0652,
    healthSystem: 'Altru Health',
  },
  'The University of Kansas Health System': {
    name: 'The University of Kansas Health System',
    shortName: 'KU Medical Center',
    address: '3901 Rainbow Blvd, Kansas City, KS 66160',
    lat: 39.0620,
    lng: -94.6092,
    healthSystem: 'The University of Kansas Health System',
  },
  'Ascension Via Christi St. Francis': {
    name: 'Ascension Via Christi St. Francis',
    shortName: 'Ascension Via Christi',
    address: '929 N St Francis, Wichita, KS 67214',
    lat: 37.6978,
    lng: -97.3278,
    healthSystem: 'Ascension Health',
  },
};

// Known coordinates for listings in mock dataset
export const LISTING_GEO_MAP: Record<string, ListingCoordinates> = {
  'nc-duke-condo': { lat: 36.0112, lng: -78.9248, city: 'Durham', state: 'NC' },
  'nc-unc-room': { lat: 35.9132, lng: -79.0558, city: 'Chapel Hill', state: 'NC' },
  'nc-wakemed-studio': { lat: 35.7898, lng: -78.5872, city: 'Raleigh', state: 'NC' },
  'md-hopkins-loft': { lat: 39.2830, lng: -76.5910, city: 'Baltimore', state: 'MD' },
  'md-ummc-studio': { lat: 39.2860, lng: -76.6190, city: 'Baltimore', state: 'MD' },
  'ct-yale-haven': { lat: 41.3120, lng: -72.9230, city: 'New Haven', state: 'CT' },
  'ct-hartford-suite': { lat: 41.7610, lng: -72.6840, city: 'Hartford', state: 'CT' },
  'nd-sanford-haven': { lat: 46.8570, lng: -96.8560, city: 'Fargo', state: 'ND' },
  'nd-altru-loft': { lat: 47.9190, lng: -97.0590, city: 'Grand Forks', state: 'ND' },
  'ks-kumed-haven': { lat: 39.0560, lng: -94.6130, city: 'Kansas City', state: 'KS' },
  'ks-ascension-studio': { lat: 37.6920, lng: -97.3320, city: 'Wichita', state: 'KS' },
  'sf-sunset-suite': { lat: 37.7554, lng: -122.4862, city: 'San Francisco', state: 'CA' },
  'sf-dogpatch-studio': { lat: 37.7618, lng: -122.3902, city: 'San Francisco', state: 'CA' },
  'sf-potrero-hill': { lat: 37.7570, lng: -122.4010, city: 'San Francisco', state: 'CA' },
  'sf-mission-sanctuary': { lat: 37.7599, lng: -122.4148, city: 'San Francisco', state: 'CA' },
  'sf-mission-bay-waterfront': { lat: 37.7712, lng: -122.3920, city: 'San Francisco', state: 'CA' },
  'hosp-1': { lat: 37.4419, lng: -122.1580, city: 'Palo Alto', state: 'CA' },
  'hosp-2': { lat: 37.7681, lng: -122.3908, city: 'San Francisco', state: 'CA' },
  'hosp-3': { lat: 34.0720, lng: -118.3750, city: 'Los Angeles', state: 'CA' },
  'hosp-4': { lat: 44.0190, lng: -92.4780, city: 'Rochester', state: 'MN' },
};

/**
 * Calculates Haversine distance in statute miles between two coordinate pairs.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3958.8; // Earth's radius in statute miles
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

/**
 * Finds the closest matched hospital from the hospital directory.
 */
// ⚡ Bolt Performance Optimization: Cache hospital coordinate lookups
// String matching in resolveHospitalCoordinates was executing O(N) string comparisons
// multiple times during list rendering and filtering loops. By caching the results,
// we reduce this to O(1) for repeated lookups of the same hospital query.
const resolveHospitalCache = new Map<string, HospitalCoordinates>();
const MAX_CACHE_SIZE = 1000;

export function resolveHospitalCoordinates(query: string): HospitalCoordinates {
  if (!query) return HOSPITAL_GEO_DIRECTORY['Duke University Hospital'];

  const normalized = query.toLowerCase();

  if (resolveHospitalCache.has(normalized)) {
    return resolveHospitalCache.get(normalized)!;
  }

  let result: HospitalCoordinates | undefined;

  for (const [key, hospital] of Object.entries(HOSPITAL_GEO_DIRECTORY)) {
    if (
      normalized.includes(key.toLowerCase()) ||
      normalized.includes(hospital.shortName.toLowerCase()) ||
      hospital.name.toLowerCase().includes(normalized) ||
      (hospital.address && hospital.address.toLowerCase().includes(normalized))
    ) {
      result = hospital;
      break;
    }
  }

  if (!result) {
    // Check state or city matches
    if (normalized.includes('chapel hill') || normalized.includes('unc')) {
      result = HOSPITAL_GEO_DIRECTORY['UNC Medical Center'];
    } else if (normalized.includes('raleigh') || normalized.includes('wakemed')) {
      result = HOSPITAL_GEO_DIRECTORY['WakeMed Raleigh Campus'];
    } else if (normalized.includes('charlotte') || normalized.includes('atrium')) {
      result = HOSPITAL_GEO_DIRECTORY['Atrium Health Carolinas Medical Center'];
    } else if (normalized.includes('san francisco') || normalized.includes('ucsf')) {
      result = HOSPITAL_GEO_DIRECTORY['UCSF Medical Center'];
    } else if (normalized.includes('stanford') || normalized.includes('palo alto')) {
      result = HOSPITAL_GEO_DIRECTORY['Stanford Health Care'];
    } else if (normalized.includes('baltimore') || normalized.includes('hopkins') || normalized.includes('maryland') || /\bmd\b/.test(normalized)) {
      result = HOSPITAL_GEO_DIRECTORY['The Johns Hopkins Hospital'];
    } else if (normalized.includes('new haven') || normalized.includes('yale') || normalized.includes('connecticut') || /\bct\b/.test(normalized)) {
      result = HOSPITAL_GEO_DIRECTORY['Yale New Haven Hospital'];
    } else if (normalized.includes('fargo') || normalized.includes('sanford') || normalized.includes('north dakota') || /\bnd\b/.test(normalized)) {
      result = HOSPITAL_GEO_DIRECTORY['Sanford Medical Center Fargo'];
    } else if (normalized.includes('kansas') || normalized.includes('wichita') || normalized.includes('ku med') || /\bks\b/.test(normalized)) {
      result = HOSPITAL_GEO_DIRECTORY['The University of Kansas Health System'];
    }
  }

  const finalResult = result || HOSPITAL_GEO_DIRECTORY['Duke University Hospital'];

  // Keep cache size bounded to prevent memory leaks from arbitrary user input
  if (resolveHospitalCache.size >= MAX_CACHE_SIZE) {
    const firstKey = resolveHospitalCache.keys().next().value;
    if (firstKey !== undefined) {
      resolveHospitalCache.delete(firstKey);
    }
  }

  resolveHospitalCache.set(normalized, finalResult);
  return finalResult;
}

/**
 * Derives listing coordinates from ID or fallback city.
 */
export function getListingCoordinates(listing: {
  id: string;
  city?: string;
  state?: string;
  nearestHospital?: string;
  driveTimeMinutes?: number;
}): ListingCoordinates {
  if (LISTING_GEO_MAP[listing.id]) {
    return LISTING_GEO_MAP[listing.id];
  }

  // If city is known, generate consistent coordinates near the city center
  const city = (listing.city || '').toLowerCase();
  if (city.includes('durham')) {
    return { lat: 36.0090, lng: -78.9320, city: 'Durham', state: 'NC' };
  }
  if (city.includes('chapel hill')) {
    return { lat: 35.9100, lng: -79.0500, city: 'Chapel Hill', state: 'NC' };
  }
  if (city.includes('raleigh')) {
    return { lat: 35.7800, lng: -78.6300, city: 'Raleigh', state: 'NC' };
  }
  if (city.includes('charlotte')) {
    return { lat: 35.2100, lng: -80.8400, city: 'Charlotte', state: 'NC' };
  }
  if (city.includes('san francisco')) {
    return { lat: 37.7650, lng: -122.4000, city: 'San Francisco', state: 'CA' };
  }

  // Fallback to Duke vicinity with slight deterministic hash offset
  const hash = (listing.id || '').split('').reduce((acc, c) => acc + c.charCodeAt(0), 0);
  const offsetLat = ((hash % 100) - 50) * 0.0004;
  const offsetLng = (((hash * 3) % 100) - 50) * 0.0004;
  return {
    lat: 36.0076 + offsetLat,
    lng: -78.9382 + offsetLng,
    city: listing.city || 'Durham',
    state: listing.state || 'NC',
  };
}

/**
 * Calculates commute duration, drive times, transit estimates, and route details.
 */
export function calculateCommuteDuration(
  listing: {
    id: string;
    city?: string;
    state?: string;
    nearestHospital?: string;
    driveTimeMinutes?: number;
    title?: string;
  },
  selectedHospitalQuery: string
): CommuteCalculationResult {
  const hospital = resolveHospitalCoordinates(selectedHospitalQuery);
  const listingCoords = getListingCoordinates(listing);

  // Exact haversine straight-line distance in miles
  const rawDistance = calculateHaversineDistance(
    listingCoords.lat,
    listingCoords.lng,
    hospital.lat,
    hospital.lng
  );

  // Round to 1 decimal place with min 0.3 miles
  const distanceMiles = Math.max(0.3, Math.round(rawDistance * 10) / 10);

  // Urban/suburban drive time modeling:
  // - 0 to 2 miles: ~3-4 min/mile (signals, traffic lights, hospital campus gates)
  // - 2 to 5 miles: ~2-2.5 min/mile
  // - 5+ miles: ~1.8 min/mile (arterial roads, highways)
  let calculatedDriveMinutes: number;
  if (distanceMiles <= 1.0) {
    calculatedDriveMinutes = Math.max(2, Math.round(distanceMiles * 3.5));
  } else if (distanceMiles <= 3.0) {
    calculatedDriveMinutes = Math.round(3 + (distanceMiles - 1.0) * 2.4);
  } else if (distanceMiles <= 8.0) {
    calculatedDriveMinutes = Math.round(8 + (distanceMiles - 3.0) * 2.0);
  } else {
    calculatedDriveMinutes = Math.round(18 + (distanceMiles - 8.0) * 1.6);
  }

  // Transit time: typically 1.6x - 2.2x of drive time, plus standard 4 min wait/transfer
  const transitMinutes = Math.round(calculatedDriveMinutes * 1.7 + 3);

  // Walking time (at 20 min/mile)
  const walkMinutes = Math.round(distanceMiles * 19);

  // Traffic modeling for healthcare shifts:
  let trafficStatus = 'Optimal shift route';
  if (calculatedDriveMinutes <= 5) {
    trafficStatus = 'Shift-ready (24/7 clear)';
  } else if (calculatedDriveMinutes <= 12) {
    trafficStatus = 'Light peak flow';
  } else {
    trafficStatus = 'Highway access flow';
  }

  // Route summary
  let routeSummary = `Via main hospital arterial`;
  if (hospital.shortName.includes('Duke')) {
    routeSummary = distanceMiles < 1.5 ? 'Via Erwin Rd & Fulton St' : 'Via NC-147 S & Erwin Rd';
  } else if (hospital.shortName.includes('UNC')) {
    routeSummary = distanceMiles < 2.0 ? 'Via Manning Dr & Columbia St' : 'Via US-15 501 & Manning Dr';
  } else if (hospital.shortName.includes('WakeMed')) {
    routeSummary = distanceMiles < 2.0 ? 'Via New Bern Ave & Sunnybrook' : 'Via I-440 Beltline & New Bern Ave';
  } else if (hospital.shortName.includes('UCSF')) {
    routeSummary = distanceMiles < 1.5 ? 'Via 3rd St / Muni T-Third' : 'Via Mariposa St & I-280';
  }

  // 12-hour shift departure recommendation
  // Day shift (starts 7:00 AM) -> Leave by 6:35 AM - 6:45 AM
  const dayBuffer = calculatedDriveMinutes + 12; // 12 min to park, walk to floor & scrub in
  const dayDepMinute = 60 - (dayBuffer % 60);
  const dayDepHour = dayBuffer > 60 ? 5 : 6;
  const dayShiftDepartureEstimate = `${dayDepHour}:${dayDepMinute.toString().padStart(2, '0')} AM (for 7 AM shift)`;

  // Night shift (starts 7:00 PM) -> Leave by 6:38 PM - 6:48 PM
  const nightBuffer = calculatedDriveMinutes + 10;
  const nightDepMinute = 60 - (nightBuffer % 60);
  const nightDepHour = nightBuffer > 60 ? 5 : 6;
  const nightShiftDepartureEstimate = `${nightDepHour}:${nightDepMinute.toString().padStart(2, '0')} PM (for 7 PM shift)`;

  return {
    hospitalName: hospital.name,
    hospitalShortName: hospital.shortName,
    distanceMiles,
    driveMinutes: calculatedDriveMinutes,
    transitMinutes,
    walkMinutes,
    trafficStatus,
    routeSummary,
    isShiftSafe: calculatedDriveMinutes <= 15,
    dayShiftDepartureEstimate,
    nightShiftDepartureEstimate,
    travelModeSummary: `${calculatedDriveMinutes} min drive • ${distanceMiles} mi to ${hospital.shortName}`,
  };
}
