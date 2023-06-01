import { useMachine } from '@xstate/react';
import { getItem, setItem } from 'localforage';
import PropTypes from 'prop-types';
import { createContext, useContext } from 'react';
import { assign, createMachine } from 'xstate';
import { downloadFormats, fieldNames } from '../functions/common/config';

const CACHE_KEY = 'searchContext';
function cacheSearchContext(cachedContext) {
  console.log('cacheSearchContext');
  setItem(CACHE_KEY, JSON.stringify(cachedContext));
}

const blankContext = {
  /* I think that this means that I need Typescript. ;)
    {
      ...queryLayerConfig,
      filter: '...' || null // not yet implemented
    }
  */
  searchLayers: [],
  filter: null,
  /*
    {
      id: 3,
      count: 123,
    }
  */
  resultLayers: null,
  resultExtent: null,
  selectedDownloadLayers: [],
  downloadResultLayers: [],
  downloadFormat: downloadFormats.shapefile,
  error: null,
};

const machine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlgHb4Au+qANvgF5gDEEA9oWAYQG6MDWrKGObUuSq0ERTplRlmAbQAMAXXkLEoAA6NYQ5qpAAPRAE4AbIdwB2AEzHj5gKwBmcw8NyALAEYANCACeiSwcHXDlQuQ8guwAOQ0MPOTsAX0SfPiw8FAowTBIAGVRfMHRYOgBBABEANVKAOQBhAFFy5V0NLWlCXQMEeLlLXBcouzs3BztXY3Gffx6HfrCEhIjXUKjk1LR03EzsvIKikoBlBtKAJTqACRakEDbtTpvuiPNjXA9LOzko81i3UPfpogoh43LghoY-kEPsC5OZ1iA0gIdjl8oVinRjrkGnUACoAfVypQAmg1Ttd1Jp7l1EB4PIY7LhLIYHLCQW5PpYPOZAQhzAkwZYmbSolE3JY3MYHPDERkwFkUft0QBVGqY7H4wkksmKVqUjrUnoeUWMhxuNwxBySxw84xyMyWwxWcwvcxRSVSlIIzZIuW7VEHOh1LFncm3PX4HSPGmC17mqION3GGL0o08uzvXBxSau8LMs1rT0y3CoCDsVCETCQDEnc5XHU3O76qMIExmKw2exOFzubx+IEeXCfUKmqym1yC6XevAlssVqsARSVpKJBOJpMOocbEYeoG6rYs1lsjmcrk8PKN-SHcgcdMtZuGcMLU+2U6IUDopwahyVuRxm-Dka7jS4zBBCIxxF8UR9HY543gOhjxuBdKWK6HiTvwsoYW+dCkqcADy2oqA2AE7voNJ-FEFhDjEnKclEgTnqM5gWJMxhuAhzp2JYMToVsMrYXUeEALIAApYjiDT-u024Gs8rzvJ83y-P8ljnrCryISmTqeAkvE+lhhDvnUtSNLkUlUs2yzMeE0ShOB4wQjyLygmMEKcq4cyTJYel4OgcAAK4UCQgbBoRurSYBZEIMMciDiMfLGBEoyxFEPJOKCHyhGKwweFxZo+bgfmwIFwUVNU9RNOZTZAdFnxxW4CVJS4CGwfBsQIVyqHmBEHobBhhUBUFdCLsuq5ahu9YUhFpHdDF9WNaazWpX2CANbFfI3nYPxzFybqPn1WxFSV1ZnJcVUyc2c3DGtiWLSlPL0q8XzjIl4S3a6BVHUN5R4QA6jUuR4RU52RbNdXXQtyUtSt9j9EaXzmgmoyJW4BVMAA7oQFCMCWIU1iDM1GKYB4dse3ZnjDMQDPR8aShK9jGN5T79RjWM4xAdAAEKlHUADSBMGozDKOK4Jjxm6nhuDyUH9EmXxMlBpismjjCY9juM-f9gMVAAkjUADiAuXemjLWOMrr0fFDjSwOV7DsMQuiiravs9W+JqriTRjeuRs1c4DJyELIzsUahg2t8maB9YfzivEW3O2zuPHPiABiBFCaUf6TWG00Gs6LmWrmgcmFyMEreMA7sje5psaa6ao8zWys+rEDYZ+36-r7UXE1yRq2olEHDKpK0IcE4J19eSb0r1Xos6riet4ZOGnPhYXEbnzaCrF0-vA1MRbe8xjnkyrwi3adFWOE+2z0388twJwliQ0Eld90W+Zo4u+uvS3XWE5pqMncNxEECQWTdQTvfJexkKpmWzluUGARLDb0-uKb+B8-4rVpPEMECkbKCkcNxCB7NsLcz5q-RByCbyoP3r-I+mCPCJQGApLkVC3INwOgIIo6BGDoDxiGOBJEDT7nbEeLsp5ewzHeEgwcQs7SeGdE4YwBUuE8JOrWchLZiYiM7CeHsrVrK5TYnSeicwG6ekIIwCAcBdAynChZGqABaCRiAHFPQWO4sIhgmYcLwEQIQlAaBgDsdVKKLowRfCTHlH4cQpYrUCJXF4W07TOiQZ4bxN8fTyj2GieA697FRXeIHAU9FcrpnsI6MuMwoLMRQraFC0cVhKMbgIGc5ZKwQGCRdP2CE3j7wYQ1B2ppYKXjCJ8dM3ZVgFX4oZTpCCegHwsM4W63F2LfGtpgzwwRka2BvJMP4ERPqDRILMwmCBLSvFtLlYEppzTcTsHQmYzhQTw3omad08Qmk+NwM3dmJy85WEzPDLijhgS0liY8qmrknAQncOU6+RYfkljfH85sDU1JDCYeKW08jwKfIyXgFR6AUU1VeZmEuXi4iKOhpIuYsUbJGIQoEcUyRkhAA */
    id: 'search',
    initial: 'initialize',
    predictableActionArguments: true,
    context: blankContext,
    states: {
      initialize: {
        invoke: {
          src: async () => {
            const cachedContext = JSON.parse(await getItem(CACHE_KEY));

            return cachedContext || {};
          },
          onDone: {
            actions: assign((context, event) => {
              return {
                ...context,
                ...event.data,
              };
            }),
            target: 'selectLayers',
          },
        },
      },
      selectLayers: {
        on: {
          ADVANCED: {
            target: 'advanced',
          },
          SEARCH: {
            target: 'searching',
          },
          SELECT_LAYER: {
            actions: 'selectLayer',
          },
          UNSELECT_LAYER: {
            actions: 'unselectLayer',
          },
          CLEAR: {
            actions: 'clear',
          },
        },
      },
      advanced: {
        on: {
          SEARCH: {
            target: 'searching',
          },
          QUERY_LAYERS: {
            target: 'selectLayers',
          },
        },
      },
      searching: {
        entry: assign({
          resultLayers: [],
          resultExtent: null,
          error: null,
          downloadResultLayers: [],
          downloadFormat: downloadFormats.shapefile,
          selectedDownloadLayers: [],
        }),
        on: {
          RESULT: {
            actions: assign({
              resultLayers: (context, event) => [
                ...context.resultLayers,
                event.result,
              ],
            }),
          },
          // generic error with search (not specific to a query layer)
          ERROR: {
            target: 'error',
            actions: assign({
              error: (_, event) => event.message,
            }),
          },
          COMPLETE: {
            target: 'result',
            actions: assign({
              resultExtent: (_, event) => event.extent,
            }),
          },
          CANCEL: {
            target: 'selectLayers',
          },
        },
      },
      result: {
        entry: assign({
          // set relevant layers as selected by default for download
          selectedDownloadLayers: (context) =>
            context.resultLayers
              .filter((result) => result.supportedExportFormats)
              .map((result) => result[fieldNames.queryLayers.uniqueId]),
        }),
        on: {
          CLEAR: {
            target: 'selectLayers',
            actions: 'clear',
          },
          ADVANCED: {
            target: 'advanced',
          },
          QUERY_LAYERS: {
            target: 'selectLayers',
          },
          SEARCH: {
            target: 'searching',
          },
          DOWNLOAD: {
            target: 'download',
          },
        },
      },
      download: {
        entry: assign({
          downloadResultLayers: [],
        }),
        on: {
          CLEAR: {
            target: 'selectLayers',
            actions: 'clear',
          },
          BACK: {
            target: 'result',
          },
          DOWNLOADING: {
            target: 'downloading',
          },
          SET_SELECTED_LAYERS: {
            actions: assign({
              selectedDownloadLayers: (_, event) => event.selectedLayers,
            }),
          },
          SET_FORMAT: {
            actions: assign({
              downloadFormat: (_, event) => event.format,
            }),
          },
        },
      },
      downloading: {
        entry: assign({
          error: null,
        }),
        on: {
          RESULT: {
            actions: assign({
              downloadResultLayers: (context, event) => [
                ...context.downloadResultLayers,
                event.result,
              ],
            }),
          },
          // generic error with download (not specific to a query layer)
          ERROR: {
            target: 'error',
            actions: assign({
              error: (_, event) => event.message,
            }),
          },
          COMPLETE: {
            target: 'result',
            actions: assign({
              resultExtent: (_, event) => event.extent,
            }),
          },
          CANCEL: {
            target: 'download',
          },
          BACK: {
            target: 'download',
          },
        },
      },
      error: {
        on: {
          CLEAR: {
            target: 'selectLayers',
            actions: 'clear',
          },
          SEARCH: {
            target: 'searching',
          },
        },
      },
    },
  },
  {
    actions: {
      clear: assign(() => {
        console.log('clear action');
        cacheSearchContext({ searchLayers: [], filter: null });

        return { ...blankContext };
      }),
      selectLayer: assign({
        searchLayers: (context, event) => {
          const newData = [...context.searchLayers, event.queryLayer];
          cacheSearchContext({ searchLayers: newData, filter: context.filter });

          return newData;
        },
      }),
      unselectLayer: assign({
        searchLayers: (context, event) => {
          const newData = context.searchLayers.filter(
            (config) =>
              config[fieldNames.queryLayers.uniqueId] !==
              event.queryLayer[fieldNames.queryLayers.uniqueId]
          );
          cacheSearchContext({ searchLayers: newData, filter: context.filter });

          return newData;
        },
      }),
    },
  }
);

// exported for mocking in Storybook
export const SearchMachineContext = createContext();
export function SearchMachineProvider({ children }) {
  const [state, send] = useMachine(machine);

  return (
    <SearchMachineContext.Provider value={[state, send]}>
      {children}
    </SearchMachineContext.Provider>
  );
}

SearchMachineProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

// This file doesn't work well fast refresh with the state machine anyways so there's
// no reason to move the hook to a different file.
// eslint-disable-next-line react-refresh/only-export-components
export function useSearchMachine() {
  const context = useContext(SearchMachineContext);

  if (context === undefined) {
    throw new Error(
      'useSearchMachine must be used within a SearchMachineProvider'
    );
  }

  return context;
}
