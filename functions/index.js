import { onCall, onRequest } from 'firebase-functions/v2/https';

const commonConfigs = {
  // longer timeout for local development to allow for debugging
  timeoutSeconds: process.env.FUNCTIONS_EMULATOR ? 60 * 60 : 60,
};

export const configs = onRequest(
  {
    ...commonConfigs,
    secrets: ['CONFIG_SPREADSHEET_ID'],
  },
  async (_, response) => {
    const { main: update } = await import('./configs.js');
    try {
      response.send(await update());
    } catch (e) {
      console.error('returning error', e);
      response.status(500).send({ error: e.toString() });
    }
  }
);

export const search = onCall(
  {
    ...commonConfigs,
    secrets: ['OPENSGID_CONNECTION_PARAMS'],
  },
  async ({ data }) => {
    const { search: searchSource } = await import('./search.js');

    return await searchSource(data);
  }
);

export const getFeature = onCall(
  {
    ...commonConfigs,
    secrets: ['OPENSGID_CONNECTION_PARAMS'],
  },
  async ({ data }) => {
    const { getFeature: getFeatureSource } = await import('./getFeature.js');

    return await getFeatureSource(data.match, data.context);
  }
);
