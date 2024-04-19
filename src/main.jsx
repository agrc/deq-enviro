import '@arcgis/core/assets/esri/themes/light/main.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@utahdts/utah-design-system-header/css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { ErrorBoundary } from 'react-error-boundary';
import { FirebaseAppProvider } from 'reactfire';
import App from './App.jsx';
import './console-tools.js';
import './index.css';
import RootErrorFallback from './utah-design-system/RootErrorFallback.jsx';
import FirebaseProvider from './contexts/FirebaseProvider.jsx';

const queryClient = new QueryClient();

console.log(`Enviro app version: ${import.meta.env.PACKAGE_VERSION}`);

ReactDOM.createRoot(document.getElementById('root')).render(
  <ErrorBoundary FallbackComponent={RootErrorFallback}>
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <FirebaseAppProvider
          firebaseConfig={JSON.parse(import.meta.env.VITE_FIREBASE_CONFIG)}
        >
          <FirebaseProvider>
            <App />
          </FirebaseProvider>
        </FirebaseAppProvider>
      </QueryClientProvider>
    </React.StrictMode>
  </ErrorBoundary>,
);
