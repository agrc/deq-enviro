import { setUtahHeaderSettings } from '@utahdts/utah-design-system-header';
import { getAnalytics } from 'firebase/analytics';
import { connectFunctionsEmulator, getFunctions } from 'firebase/functions';
import { useEffect } from 'react';
import { AnalyticsProvider, useFirebaseApp } from 'reactfire';
import RemoteConfigProvider from './RemoteConfigProvider.jsx';
import { SearchMachineProvider } from './SearchMachineProvider.jsx';
import MapComponent from './components/Map.jsx';
import ResultsGrid from './components/ResultsGrid.jsx';
import SearchWizard from './components/search-wizard/Wizard.jsx';
import config from './config';

function App() {
  useEffect(() => {
    setUtahHeaderSettings({
      // this prop's implementation has not been released yet
      // domLocationTarget: {
      //   element: headerRef.current,
      // },
      title: 'Environmental Interactive Map',
      titleURL: null,
      logo: '<img src="/deq_logo.png" alt="DEQ Logo" />',
      utahId: false,
      actionItems: [
        {
          actionPopupMenu: {
            menuItems: [
              {
                actionUrl: {
                  url: config.links.training.url,
                  openInNewTab: true,
                },
                title: config.links.training.description,
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
    });
  }, []);

  const app = useFirebaseApp();

  if (import.meta.env.DEV) {
    connectFunctionsEmulator(getFunctions(), 'localhost', 5001);
  }

  return (
    <AnalyticsProvider sdk={getAnalytics(app)}>
      <SearchMachineProvider>
        <div className="flex h-full w-full flex-col md:flex-row">
          <div className="flex flex-1 flex-col border-b border-slate-300 md:border-r">
            <MapComponent />
            <ResultsGrid />
          </div>
          <div className="md:w-80">
            <RemoteConfigProvider>
              <SearchWizard />
            </RemoteConfigProvider>
          </div>
        </div>
      </SearchMachineProvider>
    </AnalyticsProvider>
  );
}

export default App;
