import { setUtahHeaderSettings } from '@utahdts/utah-design-system-header';
import { getAnalytics } from 'firebase/analytics';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { useEffect } from 'react';
import {
  AnalyticsProvider,
  FunctionsProvider,
  useFirebaseApp,
} from 'reactfire';
import RemoteConfigProvider from './RemoteConfigProvider.jsx';
import { SearchMachineProvider } from './SearchMachineProvider.jsx';
import MapComponent from './components/Map.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import SearchWizard from './components/search-wizard/Wizard.jsx';
import MapProvider from './contexts/MapProvider.jsx';

function App() {
  useEffect(() => {
    setUtahHeaderSettings({
      // this prop's implementation has not been released yet
      // domLocationTarget: {
      //   element: headerRef.current,
      // },
      actionItems: [
        {
          actionPopupMenu: {
            menuItems: [
              {
                actionUrl: {
                  url: 'https://deq.utah.gov/general/training-videos-interactive-map',
                  openInNewTab: true,
                },
                title: 'Training Videos',
              },
              {
                // TODO: add a modal for this
                actionFunction: () => window.alert('not implemented yet!'),
                title: 'Disclaimer',
              },
            ],
            title: 'Links',
          },
          className: 'icon-waffle',
          showTitle: false,
          title: 'Links',
          icon: '<span class="utds-icon-before-waffle" aria-hidden="true" />',
        },
      ],
      footer: null,
      logo: {
        imageUrl: '/deq_logo.png',
      },
      title: 'Environmental Interactive Map',
      titleURL: null,
      utahId: false,
    });
  }, []);

  const app = useFirebaseApp();

  if (import.meta.env.DEV) {
    console.log('connecting to functions emulator');
    connectFunctionsEmulator(getFunctions(), 'localhost', 5001);
  }

  return (
    <FunctionsProvider sdk={getFunctions(app)}>
      <AnalyticsProvider sdk={getAnalytics(app)}>
        <SearchMachineProvider>
          <div className="flex h-full w-full flex-col md:flex-row">
            <MapProvider>
              <div className="flex flex-1 flex-col border-b border-slate-300 md:border-r">
                <MapComponent />
                <ResultsPanel />
              </div>
              <RemoteConfigProvider>
                <SearchWizard />
              </RemoteConfigProvider>
            </MapProvider>
          </div>
        </SearchMachineProvider>
      </AnalyticsProvider>
    </FunctionsProvider>
  );
}

export default App;
