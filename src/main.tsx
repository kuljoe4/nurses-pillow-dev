import {StrictMode} from 'react';
import { APIProvider } from '@vis.gl/react-google-maps';
import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <APIProvider apiKey={(import.meta as any).env?.VITE_GOOGLE_MAPS_API_KEY || ''}
      solutionChannel="GMP_devsite_samples_v3_rgmautocomplete"
      onLoad={() => console.log('Google Maps API loaded successfully.')}
      onError={(error) => console.error('Failed to load Google Maps API.', error)}
    >
      <App />
    </APIProvider>
  </StrictMode>,
);
