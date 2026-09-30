import React, { StrictMode, useEffect, useState } from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Handle Vite dynamic import failures (usually due to deploying a new version and older clients requesting stale chunks).
// This auto-reloads the page to fetch the new `index.html` with correct chunk hashes.
window.addEventListener('vite:preloadError', (event) => {
  event.preventDefault();
  window.location.reload();
});

const RootApp = () => {
  const [mapsApiKey, setMapsApiKey] = useState<string>(
    (import.meta as any).env?.GOOGLE_MAPS_API_KEY || ''
  );

  useEffect(() => {
    if (!mapsApiKey) {
      fetch('/api/config/maps-key')
        .then((res) => (res.ok ? res.json() : null))
        .then((data) => {
          if (data?.apiKey) {
            setMapsApiKey(data.apiKey);
          }
        })
        .catch(() => {
          // silently catch if endpoint is unavailable
        });
    }
  }, [mapsApiKey]);

  return (
    <APIProvider
      apiKey={mapsApiKey}
      solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
      onError={(error) => console.error('Failed to load Google Maps API.', error)}
    >
      <App />
    </APIProvider>
  );
};

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <RootApp />
  </StrictMode>,
);
