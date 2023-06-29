import { useMachine } from '@xstate/react';
import { getItem, setItem } from 'localforage';
import PropTypes from 'prop-types';
import { createContext, useContext } from 'react';
import { assign, createMachine } from 'xstate';
import { downloadFormats, fieldNames } from '../functions/common/config';
import stateOfUtahJson from './data/state-of-utah.json';

const CACHE_KEY = 'searchContext';
function cacheSearchContext(cachedContext) {
  setItem(CACHE_KEY, JSON.stringify(cachedContext));
}

const blankFilter = {
  where: null,
  geometry: stateOfUtahJson,
  name: 'State of Utah',
};
const blankContext = {
  /* I think that this means that I need Typescript. ;)
    {
      ...queryLayerConfig,
      filter: '...' || null // not yet implemented
    }
  */
  searchLayers: [],
  /*
    {
      geometry: {},
      where: '...',
    }
  */
  filter: blankFilter,
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
    /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlgHb4Au+qANvgF5gDEEA9oWAYQG6MDWrKGObUuSq0ERTplRlmAbQAMAXXkLEoAA6NYQ5qpAAPRAE4AbIdwB2ABwBGAEwmAzHPMOALMcsAaEAE9Eth1tcQxCQ81tLAFZXOwcAXzjvPiw8FAowTBIAGVQfMHRYOgBBABEANSKAOQBhAFES5V0NLWlCXQMEazk5INdIh2s+6wdI21tra28-ToHg0MMXOUM+y1dbBKS0FNw0jOzc-MKAZVqigCVqgAlGpBBm7TbbjuHzY1xrS3NIheNXOX7bFNEDYHLgRssBpFIpZfiYNiBkgJdpkcnkCnQTllatUACoAfSyRQAmrUzjd1JoHu1EBNDJEwZFrMYXrZTMZxkCEOY5K5cJYxpZDD1hjyevDEakwOkUQd0QBVSqY7H4wkksmKJqU1rUzofXn2UwDX7GJaGTkmyx80xWVyrDzDeKJBFbJFSvaow50apY87ku5a-A6J40sZvaKGz5rcIeTmMoKGJnGczLSz-GGRcUuvCoCDsVCETCQDGnC7XDW3e7a4MIExmKx2RzONwx3zA6y4VzzFzjW2DQyZ-jZ3P5wsQOgARTlpKJBOJpKOfsrgceoA6tYsNgNThc7i8rc6-I7Xfs5lcIwcxgH2wlRCgdDOtSOcqyOMXAaDq5p315PQvxgcrzcg4-KciKdYOCMrh-Ks-y2BmToSjsWa3nQpJnAA8uqKgVu+K76DS0F8nYkTcqMMSuFYoFnvSrKRBacj-gxjqbIOSGDih1ToQAsgACliOK1G+LTLjqLxvB8Xw-H8AKgc49JyFEdLdNYCxuFerrsYQd7VFUdRZEJVLVsMCy4M4-JQh4IzcuYnKvEEilntYJEMeE5jqXg6BwAArhQJBej6WGasJH74QgUJyLg3wAZ2hgwsyoyctFuC2DF4SWIEjJWG5CFZrgnmwD5fmlBUNT1AZVafmFkQRVFp4hHFTmAvuwztvMqlLCsazuXl3m+ROU5nDOqrzuVInVuFkWGNF9XGPFTXTBREW2HIAzuIxVhijlrH5YVxbnFco0hR0E21TFDUJfudK8hB3zVT0JF9K43U7X1JToQA6pUWToaUh14cd1WTdNsWzY1tmAx4Cn2CEzh9P2W3bEwADuhAUIwOb+SWf06uu9Zbk2u62ZYlrDBEUHGP01WmN1yOo+jY4AEJFNUADS2PVuy9IkTYHwkeGyacqm7YfFDYSfAENOMCjaMY29n3faUACSlQAOLs5VULthExEpU4fwfIL7YxWEgSDDYnaS9L9PFviSq4vUs5qgu5YUsF-2IC49JdFNUQZRep7mjCwRMctaxOAMlt0xjJz4gAYphXFFK+Lv+m7OrmKeYL8ul6VTcySyxkKwT9IMs0pa8nyRzLEAoQ+T4vuroWmO8yYeLNpsfMYnKxUE4JWVZYzMc6rG09XKFoZhjcdGMEUmJGyxyBMi3zSGyzJYK-z9MmyxTVX9McdxfG1AJU-+MtwQeHV+uDNyK9coExdRosTLjHvOYcbptT6SnS5HWfs+X07NfZeoEuiWk3NVWw3JibfDfjXLSdAmas1PggGeF957ANvqA74YJiI9DZOlS8CMBD5HQIwdAmNfQ-1wjjZueNGw7hbNMOwHxIqcx6LfVYXxuqkPIXtUsKDcabgYc2PczDVqRScvRUwsN4JOkIIwCAcBdASiCoZSqABaSY+4NH0javosI6xiF4CIEISgNAwBqIqqFQCfJGTMgpovWakROQBC1rRfkawlgMQpt1ZE+w0TwBwmnIyy03gb2jJ3UYBd9ypnpBnE0vxF4ihSt1HMeYCyQCsWNSqyZLQBH5AsVk9hGSuFAg-Y27VljQi6sYtiKRbzZL-p0Ei7ZVgODpDfewDEynNRiBFNusI+gcOWM9XqJAmnuwQH+XA7DujQnDPyBwtkH6Q08WMYY0Qnp1NHvTSZ6dwgXyWHzZkGdDB3yynY5YcErDnOhHAxpwT1GhQorJdKuCUrsnCG4Ts2UWLbF4egfZ1ZzKmWqqsOwa1knlOsOYSRdEFIMSFKeORcQgA */
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
          SET_FILTER: {
            actions: assign({
              filter: (_, event) => event.filter,
            }),
          },
          CLEAR: {
            actions: 'clear',
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
              .filter(
                (result) => result.supportsExport && result.features.length > 0
              )
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
          CLEAR: {
            target: 'selectLayers',
            actions: 'clear',
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
        cacheSearchContext({ searchLayers: [], filter: blankFilter });

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
