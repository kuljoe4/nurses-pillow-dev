// Source: Google Maps Platform Code Assist - Places API (New)
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useMapsLibrary } from '@vis.gl/react-google-maps';

export interface SelectedHospitalInfo {
  name: string;
  address: string;
  lat?: number;
  lng?: number;
  system?: string;
}

interface GoogleHospitalAutocompleteProps {
  value: string;
  onChange: (hospitalName: string) => void;
  onSelectHospital?: (hospital: SelectedHospitalInfo) => void;
  placeholder?: string;
  isNightShiftMode?: boolean;
}

// Curated hospital directory for instant, offline-resilient lookups
const CURATED_HOSPITALS: SelectedHospitalInfo[] = [
  {
    name: 'Duke University Hospital',
    address: '2301 Erwin Rd, Durham, NC 27710',
    lat: 36.0076,
    lng: -78.9382,
    system: 'Duke Health (Level I Trauma)',
  },
  {
    name: 'UNC Medical Center',
    address: '101 Manning Dr, Chapel Hill, NC 27514',
    lat: 35.9049,
    lng: -79.0526,
    system: 'UNC Health (Level I Trauma & Burn Center)',
  },
  {
    name: 'WakeMed Raleigh Campus',
    address: '3000 New Bern Ave, Raleigh, NC 27610',
    lat: 35.7892,
    lng: -78.5886,
    system: 'WakeMed Health (Level I Trauma)',
  },
  {
    name: 'Atrium Health Carolinas Medical Center',
    address: '1000 Blythe Blvd, Charlotte, NC 28203',
    lat: 35.2036,
    lng: -80.8385,
    system: 'Advocate Health (Level I Trauma)',
  },
  {
    name: 'ECU Health Medical Center',
    address: '2100 Stantonsburg Rd, Greenville, NC 27834',
    lat: 35.6074,
    lng: -77.4048,
    system: 'ECU Health (Level I Trauma)',
  },
  {
    name: 'Novant Health Forsyth Medical Center',
    address: '3333 Silas Creek Pkwy, Winston-Salem, NC 27103',
    lat: 36.0782,
    lng: -80.3015,
    system: 'Novant Health',
  },
  {
    name: 'FirstHealth Moore Regional Hospital',
    address: '155 Memorial Dr, Pinehurst, NC 28374',
    lat: 35.1956,
    lng: -79.4589,
    system: 'FirstHealth of the Carolinas',
  },
  {
    name: 'Moses H. Cone Memorial Hospital',
    address: '1200 N Elm St, Greensboro, NC 27401',
    lat: 36.0884,
    lng: -79.7915,
    system: 'Cone Health',
  },
  {
    name: 'Mission Hospital',
    address: '509 Biltmore Ave, Asheville, NC 28801',
    lat: 35.5786,
    lng: -82.5484,
    system: 'HCA Healthcare (Level II Trauma)',
  },
  {
    name: 'Duke Regional Hospital',
    address: '3643 N Roxboro St, Durham, NC 27704',
    lat: 36.0371,
    lng: -78.9056,
    system: 'Duke Health',
  },
  {
    name: 'UNC Rex Hospital',
    address: '4420 Lake Boone Trail, Raleigh, NC 27607',
    lat: 35.8193,
    lng: -78.6974,
    system: 'UNC Health',
  },
  {
    name: 'WakeMed Cary Hospital',
    address: '1900 Kildaire Farm Rd, Cary, NC 27518',
    lat: 35.7411,
    lng: -78.7842,
    system: 'WakeMed Health',
  },
  {
    name: 'Johns Hopkins Hospital',
    address: '1800 Orleans St, Baltimore, MD 21287',
    lat: 39.2969,
    lng: -76.5927,
    system: 'Johns Hopkins Medicine',
  },
  {
    name: 'Massachusetts General Hospital',
    address: '55 Fruit St, Boston, MA 02114',
    lat: 42.3628,
    lng: -71.0691,
    system: 'Mass General Brigham',
  },
  {
    name: 'Mayo Clinic Hospital - Rochester',
    address: '1216 2nd St SW, Rochester, MN 55902',
    lat: 44.0205,
    lng: -92.4831,
    system: 'Mayo Clinic',
  },
  {
    name: 'Stanford Health Care',
    address: '300 Pasteur Dr, Stanford, CA 94305',
    lat: 37.4348,
    lng: -122.1751,
    system: 'Stanford Medicine',
  },
  {
    name: 'UCSF Medical Center - Mission Bay',
    address: '1825 4th St, San Francisco, CA 94158',
    lat: 37.7681,
    lng: -122.3908,
    system: 'UCSF Health',
  },
];

export const GoogleHospitalAutocomplete: React.FC<GoogleHospitalAutocompleteProps> = ({
  value,
  onChange,
  onSelectHospital,
  placeholder = 'Search hospital or medical center (e.g. Duke, UNC, WakeMed)...',
  isNightShiftMode,
}) => {
  const [inputValue, setInputValue] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [placesSuggestions, setPlacesSuggestions] = useState<google.maps.places.AutocompleteSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Modern Places Library (Places API (New))
  const placesLibrary = useMapsLibrary('places');
  const sessionTokenRef = useRef<google.maps.places.AutocompleteSessionToken | null>(null);

  useEffect(() => {
    setInputValue(value);
  }, [value]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter curated hospitals based on user input
  const filteredCurated = useMemo(() => {
    const query = inputValue.trim().toLowerCase();
    if (!query) {
      return CURATED_HOSPITALS.slice(0, 6);
    }
    return CURATED_HOSPITALS.filter(
      (h) =>
        h.name.toLowerCase().includes(query) ||
        h.address.toLowerCase().includes(query) ||
        (h.system && h.system.toLowerCase().includes(query))
    );
  }, [inputValue]);

  // Handle typing: use Places API (New) AutocompleteSuggestion if available
  const handleInputChange = (text: string) => {
    setInputValue(text);
    onChange(text);
    setIsOpen(true);

    const trimmed = text.trim();
    if (trimmed.length > 2 && placesLibrary?.AutocompleteSuggestion) {
      setIsSearching(true);

      // Initialize session token for Places API (New) if needed
      if (!sessionTokenRef.current && placesLibrary.AutocompleteSessionToken) {
        sessionTokenRef.current = new placesLibrary.AutocompleteSessionToken();
      }

      const request: google.maps.places.AutocompleteRequest = {
        input: trimmed,
        sessionToken: sessionTokenRef.current ?? undefined,
        region: 'us',
      };

      placesLibrary.AutocompleteSuggestion.fetchAutocompleteSuggestions(request)
        .then((res) => {
          if (res?.suggestions) {
            setPlacesSuggestions(res.suggestions);
          } else {
            setPlacesSuggestions([]);
          }
        })
        .catch((err) => {
          // Graceful fallback to curated directory on any API error
          setPlacesSuggestions([]);
        })
        .finally(() => {
          setIsSearching(false);
        });
    } else {
      setPlacesSuggestions([]);
      setIsSearching(false);
    }
  };

  // User selects a curated hospital
  const handleSelectCurated = (hosp: SelectedHospitalInfo) => {
    setInputValue(hosp.name);
    onChange(hosp.name);
    setIsOpen(false);
    onSelectHospital?.(hosp);
  };

  // User selects a Places API (New) suggestion
  const handleSelectPlacesSuggestion = async (suggestion: google.maps.places.AutocompleteSuggestion) => {
    const prediction = suggestion.placePrediction;
    if (!prediction) return;

    const name = prediction.mainText?.text || prediction.text?.text || '';
    const address = prediction.secondaryText?.text || prediction.text?.text || '';

    setInputValue(name);
    onChange(name);
    setIsOpen(false);

    try {
      // Use modern Places API (New) Place.fetchFields()
      const place = prediction.toPlace();
      await place.fetchFields({
        fields: ['displayName', 'formattedAddress', 'location'],
      });

      const lat = place.location ? place.location.lat() : undefined;
      const lng = place.location ? place.location.lng() : undefined;

      onSelectHospital?.({
        name: place.displayName || name,
        address: place.formattedAddress || address,
        lat,
        lng,
      });
    } catch {
      onSelectHospital?.({ name, address });
    } finally {
      // Session concludes after place resolution
      sessionTokenRef.current = null;
    }
  };

  return (
    <div ref={containerRef} className="relative w-full">
      {/* Input Field */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-[#0A6FA8] dark:text-[#3E9AD1] pointer-events-none text-[22px]">
          local_hospital
        </span>
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => handleInputChange(e.target.value)}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="w-full h-14 pl-12 pr-28 rounded-xl bg-[#EFF6FB] hover:bg-[#E5F0F8] dark:bg-[#182840] dark:hover:bg-[#1f3350] text-[#0B2559] dark:text-white text-sm sm:text-base font-semibold border border-[rgba(11,37,89,0.1)] dark:border-[#2b4162] focus:outline-none focus:ring-2 focus:ring-[#0A6FA8] transition-colors"
        />

        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
          {isSearching && (
            <div className="w-4 h-4 border border-[#0A6FA8]/20 border-t-[#0A6FA8] rounded-full animate-spin mr-1" />
          )}
          <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#195b4c]/30 dark:text-[#aff0db] text-[11px] font-bold">
            <span className="material-symbols-outlined text-[13px]">verified</span>
            Verified Directory
          </span>
          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1 rounded-lg hover:bg-black focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-black/5 dark:hover:bg-white focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-white/5 transition-colors cursor-pointer text-[#0B2559]/70 dark:text-[#E6ECF7]/70"
            aria-label="Toggle hospital search options"
          >
            <span className="material-symbols-outlined text-[20px]">
              {isOpen ? 'expand_less' : 'expand_more'}
            </span>
          </button>
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white dark:bg-[#15233a] rounded-2xl shadow-lg z-50 border border-[rgba(11,37,89,0.12)] dark:border-[#2b4162] overflow-hidden flex flex-col max-h-96">
          {/* Quick preset chips */}
          <div className="p-3 bg-[#EFF6FB]/60 dark:bg-[#111e33] border-b border-[rgba(11,37,89,0.08)] dark:border-[#2b4162]">
            <div className="text-[10px] font-bold text-[#0B2559]/60 dark:text-[#9CB3D3] uppercase tracking-wider mb-2 flex items-center gap-1">
              <span className="material-symbols-outlined text-[13px] text-[#0A6FA8]">stars</span>
              <span>North Carolina Flagship Medical Centers</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {CURATED_HOSPITALS.slice(0, 5).map((h) => (
                <button
                  key={h.name}
                  type="button"
                  onClick={() => handleSelectCurated(h)}
                  className="px-2.5 py-1 text-[11px] font-semibold rounded-lg bg-white dark:bg-[#182840] border border-[rgba(11,37,89,0.1)] dark:border-[#2b4162] text-[#0B2559] dark:text-white hover:bg-[#0A6FA8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] hover:text-white dark:hover:bg-[#0A6FA8] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#0A6FA8] transition-colors cursor-pointer"
                >
                  {h.name.replace(' Hospital', '').replace(' Medical Center', '')}
                </button>
              ))}
            </div>
          </div>

          {/* List of results */}
          <div className="overflow-y-auto overscroll-contain py-1">
            {/* Live Places API (New) suggestions if available */}
            {placesSuggestions.length > 0 && (
              <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#0A6FA8] dark:text-[#3E9AD1]">
                Verified Hospital Directory
              </div>
            )}
            {placesSuggestions.map((suggestion, idx) => {
              const mainText = suggestion.placePrediction?.mainText?.text || suggestion.placePrediction?.text?.text || '';
              const secondaryText = suggestion.placePrediction?.secondaryText?.text || '';
              return (
                <div
                  key={`places-${idx}`}
                  onClick={() => handleSelectPlacesSuggestion(suggestion)}
                  className="px-4 py-2.5 hover:bg-[#EFF6FB] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#EFF6FB] dark:hover:bg-[#1f3350] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1f3350] cursor-pointer flex items-center justify-between transition-colors border-b border-gray-50 dark:border-gray-800 last:border-b-0"
                >
                  <div className="flex items-center gap-2.5 pr-2">
                    <span className="material-symbols-outlined text-[#0A6FA8] dark:text-[#3E9AD1] text-[18px] shrink-0">
                      local_hospital
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-[#0B2559] dark:text-white">
                        {mainText}
                      </div>
                      {secondaryText && (
                        <div className="text-[11px] text-gray-500 dark:text-gray-400">
                          {secondaryText}
                        </div>
                      )}
                    </div>
                  </div>
                  <span className="px-2 py-0.5 rounded-full bg-[#E1EFE9] text-[#2F6E5E] dark:bg-[#195b4c]/30 dark:text-[#aff0db] text-[10px] font-bold shrink-0">
                    Live
                  </span>
                </div>
              );
            })}

            {/* Curated Verified Hospital Matches */}
            <div className="px-3 pt-2 pb-1 text-[10px] font-bold uppercase tracking-wider text-[#0B2559]/60 dark:text-[#9CB3D3]">
              Verified Hospital Registry
            </div>
            {filteredCurated.length === 0 && placesSuggestions.length === 0 ? (
              <div className="px-4 py-6 text-center text-xs text-gray-500 dark:text-gray-400">
                No hospitals match "{inputValue}". Select from the flagship list above or try another name.
              </div>
            ) : (
              filteredCurated.map((hosp) => (
                <div
                  key={hosp.name}
                  onClick={() => handleSelectCurated(hosp)}
                  className={`px-4 py-2.5 hover:bg-[#EFF6FB] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#EFF6FB] dark:hover:bg-[#1f3350] focus-visible:ring-2 focus-visible:ring-offset-1 focus-visible:ring-[#1f3350] cursor-pointer flex items-center justify-between transition-colors ${
                    inputValue === hosp.name ? 'bg-[#EFF6FB] dark:bg-[#1f3350]' : ''
                  }`}
                >
                  <div className="flex items-center gap-2.5 pr-2">
                    <span className="material-symbols-outlined text-[#0A6FA8] dark:text-[#3E9AD1] text-[18px] shrink-0">
                      local_hospital
                    </span>
                    <div>
                      <div className="text-xs sm:text-sm font-semibold text-[#0B2559] dark:text-white">
                        {hosp.name}
                      </div>
                      <div className="text-[11px] text-gray-500 dark:text-gray-400">
                        {hosp.address} {hosp.system ? `• ${hosp.system}` : ''}
                      </div>
                    </div>
                  </div>
                  <span className="material-symbols-outlined text-[#2F6E5E] dark:text-[#aff0db] text-[16px] shrink-0">
                    verified
                  </span>
                </div>
              ))
            )}
          </div>

          {/* Footer note */}
          <div className="px-3 py-1.5 bg-[#EFF6FB]/50 dark:bg-[#111e33] border-t border-[rgba(11,37,89,0.08)] dark:border-[#2b4162] flex items-center justify-between text-[11px] text-[#0B2559]/70 dark:text-[#9CB3D3]">
            <span>Hospital Directory Connected</span>
            <span className="flex items-center gap-1 font-medium">
              <span className="material-symbols-outlined text-[13px] text-[#2F6E5E]">check_circle</span>
              Clinical Anchor
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
