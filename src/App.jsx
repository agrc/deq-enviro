import { setUtahHeaderSettings } from '@utahdts/utah-design-system-header';
import { getAnalytics } from 'firebase/analytics';
import { useEffect } from 'react';
import { AnalyticsProvider, useFirebaseApp } from 'reactfire';
import RemoteConfig from './RemoteConfig.jsx';
import MapComponent from './components/Map.jsx';
import SearchWizard from './components/search-wizard/Wizard.jsx';
import config from './config';

function App() {
  useEffect(() => {
    setUtahHeaderSettings({
      // this prop's implementation has not been released yet
      // domLocationTarget: {
      //   element: headerRef.current,
      // },
      title: 'Utah Environmental Interactive Map',
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

  return (
    <AnalyticsProvider sdk={getAnalytics(app)}>
      <div className="flex h-full w-full">
        <div className="flex-1 border-r border-gray-300">
          <MapComponent />
        </div>
        <div className="w-80 overflow-y-auto">
          <RemoteConfig>
            <SearchWizard />
          </RemoteConfig>
        </div>
      </div>
    </AnalyticsProvider>
  );
}

export default App;
