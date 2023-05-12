import { useMachine } from '@xstate/react';
import { getItem, setItem } from 'localforage';
import PropTypes from 'prop-types';
import { createContext, useContext } from 'react';
import { assign, createMachine } from 'xstate';
import { fieldNames } from './config';

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
  error: null,
};

const machine = createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AjgK5joCeAMqqSbAMQCCAIgGr0ByAwgKKMDaADAF1EoAA4B7WAEsALlPEA7ESAAeiACwBOTbgCsAdgAcARnX8ATLsNHN-AGwAaEKUQBmI7mu6Avt6coMHAJiMkpqdDoAZS56ACUOAAkBYSQQCWk5RWU1BC0dAxMzS2tDW0dnDTtjXHM8w3V9dWNzY35NdV9-NCw8VAgAN1QFTEhaaLjE5OV02XklVJzC3FddTVdbYptjJxcEVzM9TpAAntw+weHRgEUAVS5YgE0AfXJ6B-vIqdSZzPnQHLyeiMpgsVhs9h2bnMhmW+h8fmO3SCJxwUgUUFoEEUYFwaP64gA1jiUXgSWioAg8eJMKhfskvmJJLMsgtEEsVmsNmDStsKggTIcESTcGT0bQSOhxOhcKIADa0gBmUoAtiKkaT1eTKQp8TS6UIGWkmb9sohjMZXDD9Jo7IZzJpzOZXHZXNDIXt1OpBV1Anh0HBCLKZHQOOQYrFDT85qaEMY7PwgYVQSUyu73NVNHCjsL-bBA8GGCx2Nw+EJpsbo6zY-HEyDNqUIXyrOZcPw2-xjLp65pjNn1bhc-m6Ld7s9Xu9Yp8y98Kyz-maawU69zU3zXdUGvCfacJVLaKHw5HZ39VGbjIZdLh1C07Q6nS63XzjNoavCEQpxBA4MoSeWMpX5wQABacpdhAvtfWCEgKCoGg-2ZE8cn2BM2ncOwuxXRtdldHRHS3RFIPOIYRggeCTSrW0dFQ-R0O7XlsKaCDTlFKAyIA08EEzL19HPfR+Gve9XUMNNzH4JigkHIN4Bnf85w468RJbO18OFXd0DYuScmaTNPGadRdAE50hPdUT9E8VwLMtJpNFWF19F8XwgA */
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

const SearchMachineContext = createContext();
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
