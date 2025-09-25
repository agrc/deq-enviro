import esriConfig from '@arcgis/core/config';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import initializeTheme from '@ugrc/esri-theme-toggle';
import { FirebaseAppProvider } from '@ugrc/utah-design-system';
import '@utahdts/utah-design-system-header/css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import App from './App.jsx';
import './console-tools.js';
import FirebaseProvider from './contexts/FirebaseProvider.jsx';
import './index.css';
import RootErrorFallback from './utah-design-system/RootErrorFallback.jsx';

esriConfig.assetsPath = '/assets';
initializeTheme();

const queryClient = new QueryClient();

console.log(`Enviro app version: ${import.meta.env.PACKAGE_VERSION}`);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary FallbackComponent={RootErrorFallback}>
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <FirebaseAppProvider
          config={JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)}
        >
          <FirebaseProvider>
            <div id="header" />
            <App />
          </FirebaseProvider>
        </FirebaseAppProvider>
      </QueryClientProvider>
    </React.StrictMode>
  </ErrorBoundary>,
);
