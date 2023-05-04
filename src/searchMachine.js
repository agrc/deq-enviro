import { assign, createMachine } from 'xstate';

export default createMachine(
  {
    /** @xstate-layout N4IgpgJg5mDOIC5SzAQwE4GMAWA6AjgK5joCeAMqqSbAMQCCAIgGr0ByAwgKKMDaADAF1EoAA4B7WAEsALlPEA7ESAAeiACwBOTbgCsAdgAcARnX8ATLsNHN-AGwAaEKUQBmI7mu6Avt6coMHAJiMkpqdDoAZS56ACUOAAkBYSQQCWk5RWU1BC0dAxMzS2tDW0dnDTtjXHM8w3V9dWNzY35NdV9-NCw8VAgAN1QFTEhaaLjE5OV02XklVJzC3FddTVdbYptjJxcEVzM9TpAAntw+weHRgEUAVS5YgE0AfXJ6B-vIqdSZzPnQHLyeiMpgsVhs9h2bnMhmW+h8fmO3SCJxwUgUUFoEEUYFwaP64gA1jiUXgSWioAg8eJMKhfskvmJJLMsgtEEsVmsNmDStsKggTIcESTcGT0bQSOhxOhcKIADa0gBmUoAtiKkaT1eTKQp8TS6UIGWkmb9sohjMZXDD9Jo7IZzJpzOZXHZXNDIXt1OpBV1Anh0HBCLKZHQOOQYrFDT85qaEMY7PwgYVQSUyu73NVNHCjsL-bBA8GGCx2Nw+EJpsbo6zY-HEyDNqUIXyrOZcPw2-xjLp65pjNn1bhc-m6Ld7s9Xu9Yp8y98Kyz-maawU69zU3zXdUGvCfacJVLaKHw5HZ39VGbjIZdLh1C07Q6nS63XzjNoavCEQpxBA4MoSeWMpX5wQABacpdhAvtfWCEgKCoGg-2ZE8cn2BM2ncOwuxXRtdldHRHS3RFIPOIYRggeCTSrW0dFQ-R0O7XlsKaCDTlFKAyIA08EEzL19HPfR+Gve9XUMNNzH4JigkHIN4Bnf85w468RJbO18OFXd0DYuScmaTNPGadRdAE50hPdUT9E8VwLMtJpNFWF19F8XwgA */
    id: 'search',
    initial: 'queryLayers',
    predictableActionArguments: true,
    // TODO: can I store this local storage?
    context: {
      /* I think that this means that I need Typescript. ;)
        {
          index: 3,
          filter: '...' || null
        }
       */
      queryLayers: [],
      advanced: null,
    },
    states: {
      queryLayers: {
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
        },
      },
      advanced: {
        on: {
          SEARCH: {
            target: 'searching',
          },
          QUERY_LAYERS: {
            target: 'queryLayers',
          },
        },
      },
      searching: {
        invoke: {
          src: (context) => {
            return Promise((resolve) => {
              console.log('context', context);
              setTimeout(resolve, 1500);
            });
          },
          onDone: {
            target: 'results',
          },
          onError: {
            target: 'error',
          },
        },
      },
      results: {
        on: {
          CLEAR: {
            target: 'queryLayers',
          },
          ADVANCED: {
            target: 'advanced',
          },
          QUERY_LAYERS: {
            target: 'queryLayers',
          },
        },
      },
      error: {
        on: {
          CLEAR: {
            target: 'queryLayers',
          },
        },
      },
    },
  },
  {
    actions: {
      selectLayer: assign({
        queryLayers: (context, event) => {
          return [...context.queryLayers, { index: event.index }];
        },
      }),
      unselectLayer: assign({
        queryLayers: (context, event) => {
          return context.queryLayers.filter(
            (config) => config.index !== event.index
          );
        },
      }),
    },
  }
);
