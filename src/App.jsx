import { setUtahHeaderSettings } from '@utahdts/utah-design-system-header';
import { useEffect } from 'react';
import { useRemoteConfigString } from 'reactfire';
import MapComponent from './components/Map.jsx';
import SearchWizard from './components/search-wizard/Wizard.jsx';
import config from './config';

function App() {
  const queryLayersConfig = useRemoteConfigString('queryLayers');

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

  if (queryLayersConfig.status === 'loading') {
    console.log('loading remote config');

    return null;
  }

  const queryLayers = JSON.parse(queryLayersConfig.data);

  return (
    <div className="h-full w-full flex">
      <div className="flex-1 border-r border-gray-300">
        <MapComponent />
      </div>
      <div className="w-80 overflow-y-auto">
        <SearchWizard queryLayers={queryLayers} />
      </div>
    </div>
  );
}

export default App;
