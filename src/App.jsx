import { setUtahHeaderSettings } from '@utahdts/utah-design-system-header';
import { useEffect } from 'react';
import { useRemoteConfigString } from 'reactfire';
import MapComponent from './components/Map.jsx';
import SearchWizard from './components/search-wizard/Wizard.jsx';

function App() {
  const queryLayersConfig = useRemoteConfigString('queryLayers');
  const linksConfig = useRemoteConfigString('links');

  useEffect(() => {
    if (linksConfig.status !== 'success') {
      return;
    }

    const links = JSON.parse(linksConfig.data);
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
                  url: links['2'].url,
                  openInNewTab: true,
                },
                title: links['2'].description,
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
  }, [linksConfig]);

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
