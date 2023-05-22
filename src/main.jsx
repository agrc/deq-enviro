import '@arcgis/core/assets/esri/themes/light/main.css';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import '@utahdts/utah-design-system-header/css';
import React from 'react';
import ReactDOM from 'react-dom/client';
import { FirebaseAppProvider } from 'reactfire';
import App from './App.jsx';
import './index.css';

const queryClient = new QueryClient();
ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <FirebaseAppProvider
        firebaseConfig={{
          apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
          appId: import.meta.env.VITE_FIREBASE_APP_ID,
          authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
          messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
          projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
          storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
        }}
      >
        <App />
      </FirebaseAppProvider>
    </QueryClientProvider>
  </React.StrictMode>
);
