// Nurses Pillow - Dynamic Cleared State Coverage Service
// Data-driven architecture querying live database registry of cleared healthcare states

export interface ClearedStateData {
  code: string;
  name: string;
  capital: string;
  hospitalsCount: string;
  status: string;
  isLaunchHub: boolean;
  sampleCity: string;
  sanctuaryHighlights: string;
  topFacilities: string[];
  centerCoords: { x: number; y: number };
  activeListingsCount?: number;
  actualFacilitiesCount?: number;
  isActive?: boolean;
}

// Fallback initial dataset in case API is temporarily unavailable during boot
const INITIAL_CLEARED_STATES: ClearedStateData[] = [
  {
    code: 'NC',
    name: 'North Carolina',
    capital: 'Raleigh',
    hospitalsCount: '110+',
    status: 'Primary Launch Hub',
    isLaunchHub: true,
    sampleCity: 'Durham / Raleigh / Chapel Hill',
    sanctuaryHighlights: 'Verified day-sleeper suites near Duke Health and UNC Research Triangle.',
    topFacilities: [
      'Duke University Hospital (Durham)',
      'UNC Medical Center (Chapel Hill)',
      'WakeMed Raleigh Campus',
      'Atrium Health Carolinas Medical Center',
    ],
    centerCoords: { x: 805, y: 345 },
    activeListingsCount: 12,
    isActive: true,
  },
  {
    code: 'MD',
    name: 'Maryland',
    capital: 'Annapolis',
    hospitalsCount: '45+',
    status: 'Cleared & Active',
    isLaunchHub: false,
    sampleCity: 'Baltimore / Bethesda / Silver Spring',
    sanctuaryHighlights: 'Acoustically insulated housing along the Baltimore clinical corridor.',
    topFacilities: [
      'The Johns Hopkins Hospital (Baltimore)',
      'University of Maryland Medical Center',
      'MedStar Health',
    ],
    centerCoords: { x: 825, y: 285 },
    activeListingsCount: 4,
    isActive: true,
  },
  {
    code: 'CT',
    name: 'Connecticut',
    capital: 'Hartford',
    hospitalsCount: '32+',
    status: 'Cleared & Active',
    isLaunchHub: false,
    sampleCity: 'New Haven / Hartford / Stamford',
    sanctuaryHighlights: 'Blackout-certified furnished homes minutes from Yale New Haven.',
    topFacilities: [
      'Yale New Haven Hospital',
      'Hartford Hospital',
      'Stamford Hospital',
    ],
    centerCoords: { x: 890, y: 220 },
    activeListingsCount: 4,
    isActive: true,
  },
  {
    code: 'ND',
    name: 'North Dakota',
    capital: 'Bismarck',
    hospitalsCount: '28+',
    status: 'Cleared & Active',
    isLaunchHub: false,
    sampleCity: 'Fargo / Grand Forks / Bismarck',
    sanctuaryHighlights: 'High-thermal-comfort winterized apartments with heated garage bays.',
    topFacilities: [
      'Sanford Medical Center (Fargo)',
      'Altru Health System (Grand Forks)',
      'CHI St. Alexius Health',
    ],
    centerCoords: { x: 450, y: 155 },
    activeListingsCount: 4,
    isActive: true,
  },
  {
    code: 'KS',
    name: 'Kansas',
    capital: 'Topeka',
    hospitalsCount: '50+',
    status: 'Cleared & Active',
    isLaunchHub: false,
    sampleCity: 'Kansas City / Wichita / Topeka',
    sanctuaryHighlights: 'Turnkey $0-deposit homes equipped with scrub washers and blackout drapes.',
    topFacilities: [
      'The University of Kansas Health System (Kansas City)',
      'Ascension Via Christi St. Francis (Wichita)',
      'Stormont Vail Health',
    ],
    centerCoords: { x: 490, y: 320 },
    activeListingsCount: 4,
    isActive: true,
  },
];

class CoverageService {
  private cache: ClearedStateData[] = [...INITIAL_CLEARED_STATES];
  private lastFetchTime = 0;
  private readonly CACHE_TTL_MS = 60000; // 1 minute client cache

  async fetchClearedStates(forceRefresh = false): Promise<ClearedStateData[]> {
    const now = Date.now();
    if (!forceRefresh && this.cache.length > 0 && now - this.lastFetchTime < this.CACHE_TTL_MS) {
      return this.cache;
    }

    try {
      const response = await fetch('/api/coverage/states');
      if (response.ok) {
        const data = await response.json();
        if (Array.isArray(data) && data.length > 0) {
          this.cache = data;
          this.lastFetchTime = now;
          return this.cache;
        }
      }
    } catch (err) {
      console.warn('[CoverageService] Failed to load states dynamically, using cached registry:', err);
    }

    return this.cache;
  }

  getStates(): ClearedStateData[] {
    return this.cache;
  }

  getStateByCode(code: string): ClearedStateData | undefined {
    return this.cache.find((st) => st.code.toUpperCase() === code.toUpperCase());
  }
}

export const coverageService = new CoverageService();
