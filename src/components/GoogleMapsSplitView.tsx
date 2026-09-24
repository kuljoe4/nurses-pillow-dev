// Source: Google Maps Platform Code Assist
import React, { useState, useEffect } from 'react';
import {
  APIProvider,
  Map,
  AdvancedMarker,
  useMap,
} from '@vis.gl/react-google-maps';
import { HousingListing } from '../types';

interface HospitalLocation {
  name: string;
  lat: number;
  lng: number;
  system: string;
}

const NC_HOSPITALS: Record<string, HospitalLocation> = {
  'Duke University Hospital': {
    name: 'Duke University Hospital',
    lat: 36.0076,
    lng: -78.9382,
    system: 'Duke Health (Level I Trauma)',
  },
  'UNC Medical Center': {
    name: 'UNC Medical Center',
    lat: 35.9049,
    lng: -79.0526,
    system: 'UNC Health (Level I Trauma & Burn Center)',
  },
  'WakeMed Raleigh Campus': {
    name: 'WakeMed Raleigh Campus',
    lat: 35.7892,
    lng: -78.5886,
    system: 'WakeMed Health (Level I Trauma)',
  },
  'Atrium Health Carolinas Medical Center': {
    name: 'Atrium Health Carolinas Medical Center',
    lat: 35.2036,
    lng: -80.8385,
    system: 'Advocate Health (Level I Trauma)',
  },
  'ECU Health Medical Center': {
    name: 'ECU Health Medical Center',
    lat: 35.6074,
    lng: -77.4048,
    system: 'ECU Health (Level I Trauma)',
  },
};

interface GoogleMapsSplitViewProps {
  isNightShiftMode: boolean;
  listings: HousingListing[];
  selectedListingId: string | null;
  onSelectListing: (listing: HousingListing) => void;
  hospitalName?: string;
  radiusMiles?: number;
}

// Map Controller to smoothly pan when selected hospital or listing changes
const MapPanController: React.FC<{ center: { lat: number; lng: number }; zoom: number }> = ({ center, zoom }) => {
  const map = useMap();
  useEffect(() => {
    if (map) {
      map.panTo(center);
      map.setZoom(zoom);
    }
  }, [map, center.lat, center.lng, zoom]);
  return null;
};

export const GoogleMapsSplitView: React.FC<GoogleMapsSplitViewProps> = ({
  isNightShiftMode,
  listings,
  selectedListingId,
  onSelectListing,
  hospitalName = 'Duke University Hospital',
  radiusMiles = 5,
}) => {
  // Find hospital coordinates
  const matchedHospitalKey = Object.keys(NC_HOSPITALS).find((k) =>
    hospitalName.toLowerCase().includes(k.toLowerCase())
  ) || 'Duke University Hospital';
  const hospital = NC_HOSPITALS[matchedHospitalKey] || NC_HOSPITALS['Duke University Hospital'];

  const [activeCenter, setActiveCenter] = useState({ lat: hospital.lat, lng: hospital.lng });
  const [activeZoom, setActiveZoom] = useState(13);

  // Sync center when hospital changes
  useEffect(() => {
    setActiveCenter({ lat: hospital.lat, lng: hospital.lng });
    setActiveZoom(13);
  }, [hospital.lat, hospital.lng]);

  // Sync center when listing selected
  useEffect(() => {
    if (selectedListingId) {
      const listing = listings.find((l) => l.id === selectedListingId);
      if (listing) {
        // Place listing slightly offset from hospital if exact lat/lng is within NC
        const listingLat = hospital.lat + (Math.sin(listing.title.length) * 0.02);
        const listingLng = hospital.lng + (Math.cos(listing.title.length) * 0.02);
        setActiveCenter({ lat: listingLat, lng: listingLng });
      }
    }
  }, [selectedListingId, hospital.lat, hospital.lng, listings]);

  const apiKey = (import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || 'AIzaSyDaF-kyMHn1puwn5Q5w-_dkija7MPOsV8o';

  // Compute simulated positions for listings around the hospital
  const listingMarkers = listings.slice(0, 10).map((listing, idx) => {
    // Distribute markers in real proximity ring (0.4 to 4.2 miles)
    const angle = (idx * (2 * Math.PI)) / Math.min(listings.length, 10) + 0.4;
    const distanceKm = 0.8 + (idx % 4) * 1.2;
    const degLat = (distanceKm / 111);
    const degLng = (distanceKm / (111 * Math.cos((hospital.lat * Math.PI) / 180)));

    const lat = hospital.lat + Math.sin(angle) * degLat;
    const lng = hospital.lng + Math.cos(angle) * degLng;
    const isSelected = selectedListingId === listing.id;
    const distanceMiles = Math.max(0.1, Math.round((distanceKm * 0.621371) * 10) / 10);

    return {
      listing,
      position: { lat, lng },
      isSelected,
      distanceMiles,
    };
  });

  return (
    <div className="relative w-full h-full min-h-[520px] rounded-3xl overflow-hidden border border-[rgba(11,37,89,0.1)] dark:border-[#233550] shadow-sm flex flex-col bg-[#eaf1f8] dark:bg-[#0c1626]">
      {/* Top Map HUD: Hospital & Proximity Tag */}
      <div className="absolute top-3 left-3 right-3 z-10 flex items-center justify-between gap-2 pointer-events-none">
        <div className="pointer-events-auto bg-white/95 dark:bg-[#111e33]/95 backdrop-blur-md px-3.5 py-2 rounded-2xl shadow-md border border-[rgba(11,37,89,0.08)] dark:border-[#233550] flex items-center gap-2.5 max-w-[85%]">
          <div className="w-7 h-7 rounded-xl bg-[#005684] text-white flex items-center justify-center shrink-0 shadow-xs">
            <span className="material-symbols-outlined text-[16px]">local_hospital</span>
          </div>
          <div className="min-w-0">
            <div className="text-[10px] uppercase font-bold tracking-wider text-[#005684] dark:text-[#93ccff]">
              Active Assignment Hub
            </div>
            <div className="text-xs font-bold text-[#001848] dark:text-white truncate">
              {hospital.name}
            </div>
          </div>
          <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full bg-[#195b4c]/10 text-[#195b4c] dark:bg-[#aff0db]/20 dark:text-[#aff0db] text-[10px] font-bold shrink-0">
            ≤{radiusMiles} mi radius
          </span>
        </div>

        <div className="pointer-events-auto bg-white/90 dark:bg-[#111e33]/90 backdrop-blur-md px-3 py-1.5 rounded-xl shadow-xs border border-[rgba(11,37,89,0.08)] dark:border-[#233550] text-[11px] font-bold text-[#005684] dark:text-[#93ccff]">
          {listings.length} Sanctuaries
        </div>
      </div>

      {/* Main Google Map Container */}
      <div className="w-full h-full flex-1 min-h-[460px] relative">
        <APIProvider
          apiKey={apiKey}
          solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
        >
          <Map
            mapId="bf51a910020fa25a"
            defaultCenter={{ lat: hospital.lat, lng: hospital.lng }}
            defaultZoom={activeZoom}
            gestureHandling="greedy"
            disableDefaultUI={false}
            mapTypeControl={false}
            streetViewControl={false}
            fullscreenControl={false}
            zoomControl={true}
            style={{ width: '100%', height: '100%' }}
            internalUsageAttributionIds={['gmp_mcp_codeassist_v1_aistudio']}
          >
            <MapPanController center={activeCenter} zoom={activeZoom} />

            {/* Hospital Anchor Marker with Pulsating Animation and Radius Graphic */}
            <AdvancedMarker
              position={{ lat: hospital.lat, lng: hospital.lng }}
              title={hospital.name}
            >
              <div className="relative group cursor-pointer -translate-x-1/2 -translate-y-full flex flex-col items-center">
                {/* Commute Radius Graphic & Pulsating Radar Rings */}
                <div className="absolute top-[80%] left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none w-56 h-56 flex items-center justify-center -z-10">
                  {/* Outer pulsating wave */}
                  <div className="absolute w-52 h-52 rounded-full bg-[#0A6FA8]/10 border border-[#0A6FA8]/25 animate-ping opacity-75" />
                  {/* Intermediate commute radius boundary */}
                  <div className="absolute w-36 h-36 rounded-full bg-[#0A6FA8]/15 border border-[#0A6FA8]/40 animate-pulse" />
                  {/* Inner hospital core halo */}
                  <div className="absolute w-20 h-20 rounded-full bg-[#195b4c]/20 border-2 border-dashed border-[#195b4c]/50" />
                </div>

                <div className="relative z-10 px-3 py-1.5 rounded-2xl bg-[#001848] text-white text-xs font-extrabold shadow-xl ring-2 ring-white flex items-center gap-1.5 whitespace-nowrap">
                  <span className="material-symbols-outlined text-[15px] text-[#aff0db]">local_hospital</span>
                  <span>{hospital.name.split(' ')[0]} Hub</span>
                </div>
                {/* Needle */}
                <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-[#001848] mx-auto -mt-0.5 z-10" />
              </div>
            </AdvancedMarker>

            {/* Housing Listing Markers */}
            {listingMarkers.map(({ listing, position, isSelected, distanceMiles }) => (
              <AdvancedMarker
                key={listing.id}
                position={position}
                title={`${listing.title} - $${listing.monthlyRate}/mo`}
                onClick={() => onSelectListing(listing)}
              >
                <div
                  className={`relative cursor-pointer transition-all duration-200 ease-in-out -translate-x-1/2 -translate-y-full flex flex-col items-center ${
                    isSelected ? 'scale-110 z-30' : 'hover:scale-105 z-10'
                  }`}
                >
                  {/* Proximity Badge above price pin when hovered/selected */}
                  <div className={`absolute -top-7 whitespace-nowrap px-2 py-1 rounded-md bg-[#195b4c] text-white text-[10px] font-bold shadow-sm transition-opacity duration-200 ${isSelected ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                    📍 {distanceMiles} miles from {hospital.name}
                  </div>
                  <div
                    className={`px-2.5 py-1 mt-6 rounded-full text-xs font-extrabold shadow-md flex items-center gap-1 whitespace-nowrap transition-colors ${
                      isSelected
                        ? 'bg-[#005684] text-white ring-2 ring-white ring-offset-1'
                        : 'bg-white dark:bg-[#111e33] text-[#001848] dark:text-white border border-[rgba(11,37,89,0.18)] hover:bg-[#f2f3ff]'
                    }`}
                  >
                    <span className="material-symbols-outlined text-[13px] text-amber-500">bed</span>
                    <span className="tabular-nums">${listing.monthlyRate.toLocaleString()}</span>
                  </div>
                  {/* Point */}
                  <div
                    className={`w-0 h-0 border-l-[4px] border-l-transparent border-r-[4px] border-r-transparent border-t-[6px] mx-auto -mt-0.5 ${
                      isSelected ? 'border-t-[#005684]' : 'border-t-white dark:border-t-[#111e33]'
                    }`}
                  />
                </div>
              </AdvancedMarker>
            ))}
          </Map>
        </APIProvider>
      </div>

      {/* Bottom Floating Legend / Proximity Bar */}
      <div className="absolute bottom-3 left-3 right-3 z-10 flex items-center justify-between p-2.5 rounded-2xl bg-white/95 dark:bg-[#111e33]/95 backdrop-blur-md border border-[rgba(11,37,89,0.08)] dark:border-[#233550] shadow-md text-xs">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#001848] dark:text-white">
            <span className="w-2.5 h-2.5 rounded-full bg-[#001848] ring-1 ring-white" />
            <span>Hospital Assignment</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] font-semibold text-[#005684] dark:text-[#93ccff]">
            <span className="w-2.5 h-2.5 rounded-full bg-[#005684]" />
            <span>Furnished Sanctuary</span>
          </div>
        </div>
        <div className="text-[11px] text-[#404850] dark:text-[#c0c7d1]">
          Click pin to preview stay
        </div>
      </div>
    </div>
  );
};
