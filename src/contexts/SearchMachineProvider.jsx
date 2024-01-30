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
/**
 * @param {{
 *   searchLayerTableNames: string[];
 *   filter: Filter;
 *   layerFilterValues: Record<string, LayerFilterValue[]>;
 * }} cachedContext
 * @returns {void}
 */
function cacheSearchContext(cachedContext) {
  localforage.setItem(CACHE_KEY, cachedContext);
}

/**
 * @typedef {Object} Attribute
 * @property {string[] | number[]} values
 * @property {'all' | 'any'} queryType
 * @property {string} [fieldName]
 * @property {string} [configName]
 */

/**
 * @typedef {Object} LayerFilterValue
 * @property {'field' | 'checkbox' | 'radio' | 'date'} type
 * @property {string} [field]
 * @property {'text' | 'number'} [fieldType]
 * @property {string[]} values
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
 * @property {Record<string, LayerFilterValue[]>} layerFilterValues
 * @property {Record<string, QueryLayerResult>} resultLayers
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
  layerFilterValues: {},
  resultLayers: null,
  resultExtent: null,
  selectedDownloadLayers: [],
  downloadResultId: null,
  downloadFormat: downloadFormats.shapefile,
  error: null,
};

const machine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlgHb4Au+qANvgF5gDEEA9oWAYQG6MDWrKGObUuSq0ERTplRlmAbQAMAXXkLEoAA6NYQ5qpAAPRADYA7AFZcARlOGATMcMBmOXOumbAGhABPRABZfFrgmAJzGxsGGphYOkXYAvnGefFh4KBRgmCQAMqheYOiwdACCACIAakUAcgDCAKIlyroaWtKEugYIxnLGuAAcNr0WhsHBpr69ww6ePggWchbBuDbLQ71yvjZOvsYJSWgpuGkZ2bn5hQDKtUUAStUAEo1IIM3abU8dFnOB1ja+hmvBBxDBymaaIaKmcz-KKGf69Bx-Yy+XYgZICI6ZHJ5Ap0S5ZWrVAAqAH0skUAJq1a6PdSaV7tRDBGxyXDGGyRYLOay9Uw8sGzX49CzjYYbAIWfootGpMDpTGnHEAVUqeIJJLJlOpiiadNaDIQnMWJglwSs0UMFhsoO84LNllGFrs-V8wV6vSl+3RsuOWLOdGq+JuNOeuvwOnejKiuCZFnCTMMLoT1pmc0hSzFbjWDlNksSqM9eFQEHYqEImEguKutwe2qeLz1EYQJnMVls9icLli-MBvlwLt+kKZAzjHv4heLpfLEDoAEVFVTyaSKVTzsH62G3qAOs3LD921yuzbZnJhqyVha1r4HINkXnpbgiyWyxXLiSAGIASSyhKpa9D4a3Pxeh6bpQhcTZQMtQxu0cPsFjkZZQOsexRwOR9JwrAMqz-FoN31HdWzsRwDzcflPmZJYVmBE9TDkCJUK9MciCgOhrlqc5FW-HD6UbaIFlwbN4TsS0zQRMjfCjK8TxsOZ2QcYx3TvAtDgLZi6Cpa4AHktRUOt-03fRbQRSxgPGUwYjdSF+WZGwllouRs3+BFgivRS9jHFSmMIFjqk0gBZAAFfEf24htANmL5cB+P4ASBRxk3BUxQhM2iNgmaxXVMBiZS8nyqjqLJQrw3jLVsiSOzkQZeTsXwyKcFseRkzZBgcbMbGy3B0DgABXCgSH9QMdJ1XCAMMhBlnMCJgLGOirTS2qjyghwgldYZbFGNz8w8rrYF6-rSgqGp6iK0aOgm6N-jMXxZrGAYFpTTsghWVz5J5BEOp2vbZ3na5Fw1FcToMs6rQu6brqZW7enu8EQSNKIwjCMZxgcdqlO2nq+srG57kB-Vzqmq6bvm8T7D7EEEPimLeQ+jH+pKTSAHVKiyTTSlxxt8cumaIeJo9+kWNYrHFdYkSytGDiYAB3QgKEYIt1OuLShr0kagb8QE+nWYY3QTBzPn5Yx5IEqCzGMCVDFmjqpZluXpywoNa1pVX8LMXc22IztSL568ora2MxWuzYrcYaXZflgAhIpqgAaXZ8KO2jcyIR5Ww-ivfk3RZJwrCRE2ulvdyJZDm35fppmWdKD9KgAcTjsblkMII9yvESImWflHFsqGeU+a8JWsQxg9D23KxJVUiXqJdNVXR2Q2dxspL7KGYkBFwkoQjuAgEpKolMJFnAGTb72tsPp1fYk320vyikJOuOj+RZTf6VrhQRk9+TGcxrviveLX8KGh4lwgGpDS2k76IE5mDImd1rIITss4Ry8IXSuUAafNS1R8q1EKrPdcp0IEgwJtzOaMCjxsl6JrYEMlnDjAAeLAQJ9bZqUjjHcB40CFc3BsQqGBtwgCXmLRNY-QzajA6vkdAjB0ADWwjg-SLsWx7g9q4DwR4ETmDZLCBYJgnRp1EegcRkjLjYxrLpJ2PFwoEQUR2JRGdvjOAQkCNk4xgQJDzIQRgEA4C6GlMNMxY0AC00EjwBNwHY0JYSEJH2UkQIQlAaBgB8WFMafxloNz3mYJ00QJL8ivIsTk8VryVU-qjQuXo5QnGxPAFWviOiAlsuyQctTeRsjquMSw8weQbAWPYIOdDxxPinAk4q4UXTmBsK6DYTVwhWG4YtE8vZ5IyQ2OEQYIwxYlJyikZigy8ECmSjJdK2w7AuAsGRSEtlryvTmOsDaDgaa7T6tstWCANhkTkn2K0dhzKVUcLQ9ZuAGFFkefqGKAlYYSTMP8aSxgM4+3qfCDKZtegiN6f84uaDvJAoXrZcJOLAkzGGKM3e-xTSrWKVtA4YiJGYvCm4FkGw96chBIhMSR5zrbFhHrC0YQFguLiEAA */
    id: 'search',
    initial: 'initialize',
    context: blankContext,
    states: {
      initialize: {
        invoke: {
          src: fromPromise(async () => {
            const cachedContext = await localforage.getItem(CACHE_KEY);
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
          UPDATE_LAYER_FILTER_VALUES: {
            actions: 'updateLayerFilterValues',
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
            resultLayers: null,
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
              }) => ({
                ...context.resultLayers,
                [result[fieldNames.queryLayers.tableName]]: result,
              }),
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
            Object.keys(context.resultLayers).filter((tableName) => {
              const result = context.resultLayers[tableName];

              return result.features?.length > 0;
            }),
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
        cacheSearchContext({
          searchLayerTableNames: [],
          filter: blankFilter,
          layerFilterValues: {},
        });

        return { ...blankContext };
      }),
      selectLayer: assign({
        searchLayerTableNames: ({ context, event: { tableName } }) => {
          const newData = [...context.searchLayerTableNames, tableName];
          cacheSearchContext({
            searchLayerTableNames: newData,
            filter: context.filter,
            layerFilterValues: context.layerFilterValues,
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
            layerFilterValues: context.layerFilterValues,
          });

          return newData;
        },
      }),
      setFilter: assign({
        filter: ({ context, event: { /** @type {Filter} */ filter } }) => {
          cacheSearchContext({
            searchLayerTableNames: context.searchLayerTableNames,
            filter,
            layerFilterValues: context.layerFilterValues,
          });

          return filter;
        },
      }),
      updateLayerFilterValues: assign({
        layerFilterValues: ({ context, event: { tableName, newValues } }) => {
          const newFilterValues = {
            ...context.layerFilterValues,
            [tableName]: newValues,
          };
          cacheSearchContext({
            searchLayerTableNames: context.searchLayerTableNames,
            filter: context.filter,
            layerFilterValues: newFilterValues,
          });

          return newFilterValues;
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
