import { fromJSON } from '@arcgis/core/geometry/support/jsonUtils';
import { getAnalytics, logEvent } from 'firebase/analytics';
import localforage from 'localforage';
import { assign, createMachine, fromPromise } from 'xstate';
import { downloadFormats, fieldNames } from '../../functions/common/config';
import stateOfUtahJson from '../data/state-of-utah.json';

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
  // make sure that the original geometry is not modified...
  const newData = structuredClone(cachedContext);
  if (cachedContext.filter?.geometry?.toJSON) {
    newData.filter.geometry = cachedContext.filter.geometry.toJSON();
  }
  localforage.setItem(CACHE_KEY, newData);
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

/** @type {Filter} */
const blankFilter = {
  geometry: stateOfUtahJson,
  name: 'State of Utah',
  attribute: null,
};

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

export const machine = createMachine(
  {
    // cspell:disable-next-line
    /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AlgHb4Au+qANvgF5gDEEA9oWAYQG6MDWrKGObUuSq0ERTplRlmAbQAMAXXkLEoAA6NYQ5qpAAPRADYAHAFZcARlOGATBYCcAFmM3Hd+wBoQAT0QXDFsa4zoamctbGgYEAvtFefFh4KBRgmCQAMqjeYOiwdACCACIAavkAcgDCAKKFyroaWtKEugYIxpG4AMymTuGmFgDspgORXr4IFlbmpp2zxnImUcax8WiJuMmpGVk5eQDKVfkAShUAEnVIIA3azZetFp3Ghrh2xiPhg8OjPn6GnY64J6OUzGWZgsErEAJASbNKZbK5OgHdJVCoAFQA+ul8gBNKpHC7qTQ3Fp+KwAlxyToWGymMZ+Uw2Z6dGyRWmQ6FJMApOE7REAVTKyNRmOxeIJinqxKapImFkcnVwA1CtjpPwmCrkXSGHLWMO5W3huzo-IACoV8miqljcfiMQAxACS6StRwxpXS-Kqe0JV2l+B0dz8cnsipsVKm-SGIws9ImswBbkCOriUL1XJ52wReQqKOOvuuMqDcqeuDkVlVcZpj2CJhTq34GcNfLy+VNpvSOIxhSq9vy-JdPsll0LAduoHu8vM8oWpjnnxjVflNlw-Ws7NTnNwqAg7FQhEwkCRhxO52HRMaY9lJmn64czlc7ircjsSpVG4b6x3e4PR4Ail6RxdmK+JDioI7+oGE5GGYlh3k4LhJp46o0gsZZgvMiyRMsm7ptuu77oeEDHpiTouviBaQeO+iII49gDGWAz2IYfxyGYobRs+9j2EqnQvnOWExLhjb4T+RF0LmJ6UZeUE0QgN5wbY96IU+KG0s8MxzAs2FCZ++qNkQUB0Ec3oDmi0kksW-jymWpiOAMgTltG3zjIENgMcqfGCdhNi6iJnKGXQ+JHAA8hK4EXpZ0EaoEgIKu8UZfLG6rhiuH5pv56aBRUIUALIdlUVoWUW0UPKWrwJQuLl+PRzwKsxXk6S4fnrAFhBGRU5TVOkxVXlZjhyAxFghgN87OclrkggCnSGMCoLghCwnrOgcAAK4UCQEl5uFUoydRrQ2N0uDMW8aquQNWpyCGTjUk1LUCCtsDrZtRSlJUNS9bJB1HSdQxLvYK6hlp3n3Xgj3PXQAH4sBtpHGBu1RXJh3mL9Z1+HRKOsd5ukZcta0bcexxnJ9+2IMjx11mjEwjCujhY01bmg7g4ME4UIUAOplOkIVFCTsrk6jcb2IMjH2cqIzDMuTMs5tBykc6rp88WAuU1WoKA-TSyM0tAhMAA7oQFCMDuQVHKFO0QXtsphIq8x0wMNiuDSw1OHGiGruxnT1rjuuMAbRsm5J+bnn6VvFgpFbuA+SFC7SgI0qYTP64bxvEQAQvkFQANJK9F1JavYMwJ0LhgMcMYul2YDluEnfspybbOc9zRSOmUADiudIzNuDvlTDtas7oSDFXUs63gycB8RcsYsK6I1Da4rw5biOtI4A3BMY8V96yPcsmyidj7gE+pyRDphbllqd6vTFKkltJxn8K6l6jtf+6ngXBWFV9kz9qspS+LwD56XHnXSe2UupVB6iHUcX0f6Y1Om7fwosBjixHjXQ+x8dyBQztnb+CAVYIPVE8DSAwK4S2rr5DBoD37tS2lJaBVF+a-0IeMZwPFwzUnSluHI6BGDoDocHCKocV4wVvEpBCj4HBxn+OYB2vcmY8L4YTU8eCI7wWjqpcYHQD6pkIIwCAcBdCcgRiVOSABaQwcYLFMyIEISgNAwAmL6tFeyYYmTriptZZ4DlGpaxwsAjYBpeTZicbAuULEug9C9p42wDFWQJyZt+QikBQmkwQGEcwNh7CbweGxKJnE1JXR7vNTCd1D5tSgKk2UVhhaAiGFSD440qwAyCA5AIoY-GUICTLKpxY3BVjpq0kwtgvajIGF7V+9cIC9JcSMLo3QOJUwBtMTo9gFhcLwpgiAhkZlyX6eqByPFN4uGXGgrpPs8CKPQLs1oMwtRuGGCCGaURZpxkduYey8jYjRCAA */
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
          APPLY_DEFAULTS: {
            actions: assign(({ context, event: { defaults } }) => {
              return {
                ...context,
                ...defaults,
              };
            }),
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
          SET_FILTER: {
            actions: 'setFilter',
            target: 'selectLayers',
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
              selectedDownloadLayers: ({ event: { selectedLayers } }) =>
                selectedLayers,
            }),
          },
          SET_FORMAT: {
            actions: assign({
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
      clear: assign(({ event: { defaults } }) => {
        cacheSearchContext({
          searchLayerTableNames: [],
          filter: blankFilter,
          layerFilterValues: {},
          ...defaults,
        });

        return { ...blankContext, ...defaults };
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
