import { fromJSON } from '@arcgis/core/geometry/support/jsonUtils';
import { useMachine } from '@xstate/react';
import localforage from 'localforage';
import PropTypes from 'prop-types';
import { createContext, useContext, useEffect } from 'react';
import { assign, createMachine, fromPromise } from 'xstate';
import { downloadFormats, fieldNames } from '../../functions/common/config';
import stateOfUtahJson from '../data/state-of-utah.json';
import { useRemoteConfigValues } from './RemoteConfigProvider';
import { getAnalytics, logEvent } from 'firebase/analytics';

localforage.config({
  name: 'deq-enviro-search-cache',
});

const CACHE_KEY = 'searchContext';
function cacheSearchContext(cachedContext) {
  localforage.setItem(CACHE_KEY, JSON.stringify(cachedContext));
}

/**
 * @typedef {Object} Attribute
 * @property {string[] | number[]} values
 * @property {'all' | 'any'} queryType
 * @property {'name' | 'id'} attributeType
 */

/**
 * @typedef {Object} Filter
 * @property {Object} geometry
 * @property {string} name
 * @property {Attribute | null} attribute
 */

/** @type {Filter} */
const blankFilter = {
  geometry: stateOfUtahJson,
  name: 'State of Utah',
  attribute: null,
};

/**
 * @typedef {Object} Context
 * @property {string[]} searchLayerTableNames
 * @property {Filter} filter
 * @property {QueryLayerResult[]} resultLayers
 * @property {Object} resultExtent
 * @property {string[]} selectedDownloadLayers
 * @property {string} downloadResultId
 * @property {string} downloadFormat
 * @property {string | null} error
 */

/**
 * @typedef {import('../../functions/common/config').QueryLayerConfig & {
 *   error: JSX.Element;
 *   features: import('@arcgis/core/Graphic').default[];
 *   fields: object[];
 *   count: number;
 *   supportedExportFormats: string[];
 *   featureLayer: import('@arcgis/core/layers/FeatureLayer').default;
 * }} QueryLayerResult
 */

/**
 * @typedef {Object} FilterEvent
 * @property {Filter} filter
 */

/** @type {Context} */
const blankContext = {
  searchLayerTableNames: [],
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
  downloadResultId: null,
  downloadFormat: downloadFormats.shapefile,
  error: null,
};

const machine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlgHb4Au+qANvgF5gDEEA9oWAYQG6MDWrKGObUuSq0ERTplRlmAbQAMAXXkLEoAA6NYQ5qpAAPRAE4AbIdwB2ABwBGAEwmAzHPMOALMcsAaEAE9Eth1tcQxCQ81tLAFZXOwcAXzjvPiw8FAowTBIAGVQfMHRYOgBBABEANSKAOQBhAFES5V0NLWlCXQMEazk5INdIh2s+6wdI21tra28-ToHg0MMXOUM+y1dbBKS0FNw0jOzc-MKAZVqigCVqgAlGpBBm7TbbjuHzY1xrS3NIheNXOX7bFNEDYHLgRssBpFIpZfiYNiBkgJdpkcnkCnQTllatUACoAfSyRQAmrUzjd1JoHu1EBNDJEwZFrMYXrZTMZxkCEOY5K5cJYxpZDD1hjyevDEakwOkUQd0QBVSqY7H4wkksmKJqU1rUzofXn2UwDX7GJaGTkmyx80xWVyrDzDeKJBFbJFSvaow50apY87ku5a-A6J40sZvaKGz5rcIeTmMoKGJnGczLSz-GGRcUuvCoCDsVCETCQDGnC7XDW3e7a4MIExmKx2RzONwx3zA6y4VzzFzjW2DQyZ-jZ3P5wsQOgARTlpKJBOJpKOfsrgceoA6tYsNgNThc7i8rc6-I7Xfs5lcIwcxgH2wlRCgdDOtSOcqyOMXAaDq5p315PQvxgcrzcg4-KciKdYOCMrh-Ks-y2BmToSjsWa3nQpJnAA8uqKgVu+K76DS0F8nYkTcqMMSuFYoFnvSrKRBacj-gxjqbIOSGDih1ToQAsgACliOK1G+LTLjqLxvB8Xw-H8AKgc49JyFEdLdNYCxuFerrsYQd7VFUdRZEJVLVsMCy4M4-JQh4IzcuYnKvEEilntYJEMeE5jqXg6BwAArhQJBej6WGasJH74QgUJyLg3wAZ2hgwsyoyctFuC2DF4SWIEjJWG5CFZrgnmwD5fmlBUNT1AZVafmFkQRVFp4hHFTmAvuwztvMqlLCsazuXl3m+ROU5nDOqrzuVInVuFkWGNF9XGPFTXTBREW2HIAzuIxVhijlrH5YVxbnFco0hR0E21TFDUJfudK8hB3zVT0JF9K43U7X1JToQA6pUWToaUh14cd1WTdNsWzY1tmAx4Cn2CEzh9P2W3bEwADuhAUIwOb+SWf06uu9Zbk2u62ZYlrDBEUHGP01WmN1yOo+jY4AEJFNUADS2PVuy9IkTYHwkeGyacqm7YfFDYSfAENOMCjaMY29n3faUACSlQAOLs5VULthExEpU4fwfIL7YxWEgSDDYnaS9L9PFviSq4vUs5qgu5YUsF-2IC49JdFNUQZRep7mjCwRMctaxOAMlt0xjJz4gAYphXFFK+Lv+m7OrmKeYL8ul6VTcySyxkKwT9IMs0pa8nyRzLEAoQ+T4vuroWmO8yYeLNpsfMYnKxUE4JWVZYzMc6rG09XKFoZhjcdGMEUmJGyxyBMi3zSGyzJYK-z9MmyxTVX9McdxfG1AJU-+MtwQeHV+uDNyK9coExdRosTLjHvOYcbptT6SnS5HWfs+X07NfZeoEuiWk3NVWw3JibfDfjXLSdAmas1PggGeF957ANvqA74YJiI9DZOlS8CMBD5HQIwdAmNfQ-1wjjZueNGw7hbNMOwHxIqcx6LfVYXxuqkPIXtUsKDcabgYc2PczDVqRScvRUwsN4JOkIIwCAcBdASiCoZSqABaSY+4NH0javosI6xiF4CIEISgNAwBqIqqFQCfJGTMgpovWakROQBC1rRfkawlgMQpt1ZE+w0TwBwmnIyy03gb2jJ3UYBd9ypnpBnE0vxF4ihSt1HMeYCyQCsWNSqyZLQBH5AsVk9hGSuFAg-Y27VljQi6sYtiKRbzZL-p0Ei7ZVgODpDfewDEynNRiBFNusI+gcOWM9XqJAmnuwQH+XA7DujQnDPyBwtkH6Q08WMYY0Qnp1NHvTSZ6dwgXyWHzZkGdDB3yynY5YcErDnOhHAxpwT1GhQorJdKuCUrsnCG4Ts2UWLbF4egfZ1ZzKmWqqsOwa1knlOsOYSRdEFIMSFKeORcQgA */
    id: 'search',
    initial: 'initialize',
    context: blankContext,
    states: {
      initialize: {
        invoke: {
          src: fromPromise(async () => {
            const cachedContext = JSON.parse(
              await localforage.getItem(CACHE_KEY),
            );
            if (cachedContext?.filter?.geometry) {
              cachedContext.filter.geometry = fromJSON(
                cachedContext.filter.geometry,
              );
            }

            return cachedContext || {};
          }),
          onDone: {
            actions: assign(({ context, event }) => {
              return {
                ...context,
                ...event.output,
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
            actions: 'setFilter',
          },
          CLEAR: {
            actions: 'clear',
            target: 'selectLayers',
          },
        },
      },
      searching: {
        entry: [
          assign({
            resultLayers: [],
            resultExtent: null,
            error: null,
            downloadResultId: null,
            downloadFormat: downloadFormats.filegdb,
            selectedDownloadLayers: [],
          }),
          ({ context }) => {
            logEvent(getAnalytics(), 'search', {
              searchLayerTableNames: context.searchLayerTableNames,
              filter: context.filter.name,
            });
          },
        ],
        on: {
          RESULT: {
            actions: assign({
              resultLayers: ({
                context,
                event: { /** @param QueryLayerResult */ result },
              }) => [...context.resultLayers, result],
            }),
          },
          // generic error with search (not specific to a query layer)
          ERROR: {
            target: 'error',
            actions: assign({
              error: ({ event: { message } }) => message,
            }),
          },
          COMPLETE: {
            target: 'result',
            actions: assign({
              resultExtent: ({ event: { extent } }) => extent,
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
          selectedDownloadLayers: ({ context }) =>
            context.resultLayers
              .filter((result) => result.features.length > 0)
              .map((result) => result[fieldNames.queryLayers.tableName]),
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
          downloadResultId: null,
        }),
        on: {
          ERROR: {
            actions: assign({
              // @ts-ignore
              error: ({ event: { message } }) => message,
            }),
          },
          CLEAR: {
            target: 'selectLayers',
            actions: 'clear',
          },
          BACK: {
            target: 'result',
          },
          DOWNLOADING: {
            target: 'downloading',
            actions: assign({
              downloadResultId: ({ event: { id } }) => id,
            }),
          },
          SET_SELECTED_LAYERS: {
            actions: assign({
              // @ts-ignore
              selectedDownloadLayers: ({ event: { selectedLayers } }) =>
                selectedLayers,
            }),
          },
          SET_FORMAT: {
            actions: assign({
              // @ts-ignore
              downloadFormat: ({ event: { format } }) => format,
            }),
          },
        },
      },
      downloading: {
        entry: assign({
          error: null,
        }),
        on: {
          ERROR: {
            target: 'error',
            actions: assign({
              error: ({ event: { message } }) => message,
            }),
          },
          // TODO: add a button for this
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
        cacheSearchContext({ searchLayerTableNames: [], filter: blankFilter });

        return { ...blankContext };
      }),
      selectLayer: assign({
        searchLayerTableNames: ({ context, event: { tableName } }) => {
          const newData = [...context.searchLayerTableNames, tableName];
          cacheSearchContext({
            searchLayerTableNames: newData,
            filter: context.filter,
          });

          return newData;
        },
      }),
      unselectLayer: assign({
        searchLayerTableNames: ({ context, event: { tableName } }) => {
          const newData = context.searchLayerTableNames.filter(
            (existingId) => existingId !== tableName,
          );
          cacheSearchContext({
            searchLayerTableNames: newData,
            filter: context.filter,
          });

          return newData;
        },
      }),
      setFilter: assign({
        filter: ({ context, event: { /** @type {Filter} */ filter } }) => {
          cacheSearchContext({
            searchLayerTableNames: context.searchLayerTableNames,
            filter,
          });

          return filter;
        },
      }),
    },
  },
);

// exported for mocking in Storybook
export const SearchMachineContext = createContext(null);
export function SearchMachineProvider({ children }) {
  const [state, send] = useMachine(machine);

  // this get's incremented each time the config spreadsheet is deployed
  const { version } = useRemoteConfigValues();

  useEffect(() => {
    const VERSION_KEY = 'searchContextVersion';
    localforage.getItem(VERSION_KEY).then((cacheVersion) => {
      if (cacheVersion !== version) {
        console.warn('new search cache version found, clearing old cache');
        localforage.clear();
        localforage.setItem(VERSION_KEY, version);

        send({ type: 'CLEAR' });
      }
    });
  }, [send, version]);

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
/**
 * @returns {[
 *   import('xstate').StateFrom<typeof machine>,
 *   import('xstate').InterpreterFrom<typeof machine>['send'],
 * ]}
 */
// eslint-disable-next-line react-refresh/only-export-components
export function useSearchMachine() {
  const context = useContext(SearchMachineContext);

  if (context === undefined) {
    throw new Error(
      'useSearchMachine must be used within a SearchMachineProvider',
    );
  }

  return context;
}
