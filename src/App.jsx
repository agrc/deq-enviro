import { setUtahHeaderSettings } from '@utahdts/utah-design-system-header';
import { getAnalytics } from 'firebase/analytics';
import { useEffect } from 'react';
import { AnalyticsProvider, useFirebaseApp } from 'reactfire';
import RemoteConfigProvider from './RemoteConfigProvider.jsx';
import { SearchMachineProvider } from './SearchMachineProvider.jsx';
import MapComponent from './components/Map.jsx';
import ResultsPanel from './components/ResultsPanel.jsx';
import SearchWizard from './components/search-wizard/Wizard.jsx';

function App() {
  useEffect(() => {
    setUtahHeaderSettings({
      // this prop's implementation has not been released yet
      // domLocationTarget: {
      //   element: headerRef.current,
      // },
      title: 'Environmental Interactive Map',
      titleURL: null,
      logo: {
        imageUrl: '/deq_logo.png',
      },
      utahId: false,
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
    });
  }, []);

  const app = useFirebaseApp();

  return (
    <AnalyticsProvider sdk={getAnalytics(app)}>
      <SearchMachineProvider>
        <div className="flex h-full w-full flex-col md:flex-row">
          <div className="flex flex-1 flex-col border-b border-slate-300 md:border-r">
            <MapComponent />
            <ResultsPanel />
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
