import { setUtahHeaderSettings } from '@utahdts/utah-design-system-header';
import { useEffect, useState } from 'react';
import MapComponent from './components/Map.jsx';
import MeasureTools from './components/MeasureTools';
import ResultsPanel from './components/ResultsPanel.jsx';
import SearchWizard from './components/search-wizard/Wizard.jsx';
import MapProvider from './contexts/MapProvider.jsx';
import RemoteConfigProvider from './contexts/RemoteConfigProvider.jsx';
import { SearchMachineProvider } from './contexts/SearchMachineProvider.jsx';
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from './utah-design-system/Dialog.jsx';

function App() {
  useEffect(() => {
    setUtahHeaderSettings({
      domLocationTarget: {
        cssSelector: '#header',
      },
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
                actionFunction: showDisclaimer,
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
      mainMenu: false,
      skipLinkUrl: '#select-map-data',
      title: 'Environmental Interactive Map',
      titleUrl: null,
      utahId: false,
    });
  }, []);

  const [disclaimerOpen, setDisclaimerOpen] = useState(false);
  const showDisclaimer = () => {
    setDisclaimerOpen(true);
  };

  return (
    <>
      <RemoteConfigProvider>
        <SearchMachineProvider>
          <div className="flex min-h-0 flex-1 flex-col md:flex-row">
            <MapProvider>
              <div className="relative flex flex-1 flex-col items-center border-b border-slate-300 md:border-r">
                <MeasureTools />
                <MapComponent />
                <ResultsPanel />
              </div>
              <SearchWizard />
            </MapProvider>
          </div>
        </SearchMachineProvider>
      </RemoteConfigProvider>
      <Dialog open={disclaimerOpen} onOpenChange={setDisclaimerOpen}>
        <DialogContent>
          <DialogTitle>Disclaimer</DialogTitle>
          <p>
            The information contained in this website has been compiled from the
            DEQ database(s) and is provided as a service to the public. This
            Interactive Map is to be used to obtain only a summary of
            information regarding sites regulated by DEQ. Use beyond this
            intended purpose is at the user’s risk. Site location and other
            related information are subject to inherent error and inaccuracies
            due to the limitations of the data collection methods, data entry
            errors, and other factors. DEQ makes no representation as to the
            completeness or accuracy of the information in this website. More
            complete information on all sites can be accessed at the DEQ
            division offices at 195 North 1950 West, Salt Lake City, Utah.
            Information on how to obtain access to DEQ records can be found on{' '}
            <a
              target="_blank"
              rel="noreferrer"
              href="https://deq.utah.gov/general/records-request-government-records-access-and-management-act-grama"
            >
              DEQ’s Records Request page
            </a>
            . Please report any mapping related inaccuracies to{' '}
            <a href="mailto:deqweb@utah.gov">deqweb@utah.gov</a>.
          </p>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default App;
