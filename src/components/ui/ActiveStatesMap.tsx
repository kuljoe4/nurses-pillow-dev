import React from 'react';
import { ComposableMap, Geographies, Geography } from 'react-simple-maps';
import { ACTIVE_STATES } from '../../lib/constants/states';

const geoUrl = '/states-10m.json';

// Utility to convert FIPS codes to State abbreviations
const FIPS_TO_STATE: Record<string, string> = {
  "01": "AL", "02": "AK", "04": "AZ", "05": "AR", "06": "CA", "08": "CO",
  "09": "CT", "10": "DE", "11": "DC", "12": "FL", "13": "GA", "15": "HI",
  "16": "ID", "17": "IL", "18": "IN", "19": "IA", "20": "KS", "21": "KY",
  "22": "LA", "23": "ME", "24": "MD", "25": "MA", "26": "MI", "27": "MN",
  "28": "MS", "29": "MO", "30": "MT", "31": "NE", "32": "NV", "33": "NH",
  "34": "NJ", "35": "NM", "36": "NY", "37": "NC", "38": "ND", "39": "OH",
  "40": "OK", "41": "OR", "42": "PA", "44": "RI", "45": "SC", "46": "SD",
  "47": "TN", "48": "TX", "49": "UT", "50": "VT", "51": "VA", "53": "WA",
  "54": "WV", "55": "WI", "56": "WY"
};

export const ActiveStatesMap: React.FC<{
  className?: string;
  isNightShiftMode?: boolean;
}> = ({ className = '', isNightShiftMode = false }) => {
  return (
    <div className={`relative w-full h-full min-h-[150px] flex items-center justify-center ${className}`}>
      <ComposableMap
        projection="geoAlbersUsa"
        style={{ width: "100%", height: "auto" }}
      >
        <Geographies geography={geoUrl}>
          {({ geographies }) => (
            <>
              {geographies.map((geo) => {
                const stateId = geo.id as string;
                const stateAbbr = FIPS_TO_STATE[stateId];
                const isActive = ACTIVE_STATES.includes(stateAbbr as any);

                return (
                  <Geography
                    key={geo.rsmKey}
                    geography={geo}
                    fill={
                      isActive
                        ? (isNightShiftMode ? '#3E9AD1' : '#0A6FA8')
                        : (isNightShiftMode ? '#1A273D' : '#E2E8F0')
                    }
                    stroke={isNightShiftMode ? '#233550' : '#ffffff'}
                    strokeWidth={0.5}
                    style={{
                      default: { outline: 'none' },
                      hover: {
                        fill: isActive ? '#2F6E5E' : (isNightShiftMode ? '#1A273D' : '#E2E8F0'),
                        outline: 'none',
                        cursor: isActive ? 'pointer' : 'default',
                      },
                      pressed: { outline: 'none' },
                    } as any}
                  >
                    <title>{geo.properties?.name}</title>
                  </Geography>
                );
              })}
              {/* Overlay with a bit thicker stroke just for non-active states outline */}
              {geographies.map((geo) => {
                const stateId = geo.id as string;
                const stateAbbr = FIPS_TO_STATE[stateId];
                const isActive = ACTIVE_STATES.includes(stateAbbr as any);

                if (!isActive) {
                   return (
                     <Geography
                       key={`outline-${geo.rsmKey}`}
                       geography={geo}
                       fill="transparent"
                       stroke={isNightShiftMode ? '#4b6183' : '#cbd5e1'}
                       strokeWidth={1}
                       style={{
                         default: { outline: 'none', pointerEvents: 'none' },
                         hover: { outline: 'none', pointerEvents: 'none' },
                         pressed: { outline: 'none', pointerEvents: 'none' },
                       } as any}
                     />
                   );
                }
                return null;
              })}
            </>
          )}
        </Geographies>
      </ComposableMap>
    </div>
  );
};
