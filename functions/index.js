import { onCall, onRequest } from 'firebase-functions/https';
import { defineSecret } from 'firebase-functions/params';

const configSpreadsheetIdSecret = defineSecret('CONFIG_SPREADSHEET_ID');
const openSgidConnectionParamsSecret = defineSecret(
  'OPENSGID_CONNECTION_PARAMS',
);

const commonConfigs = {
  // longer timeout for local development to allow for debugging
  timeoutSeconds: process.env.FUNCTIONS_EMULATOR ? 60 * 60 : 60,
};

export const configs = onRequest(
  {
    ...commonConfigs,
    secrets: [configSpreadsheetIdSecret],
  },
  async (_, response) => {
    const { main: update } = await import('./configs.js');
    try {
      response.send(await update());
    } catch (e) {
      console.error('returning error', e);
      response.status(500).send({ error: e.toString() });
    }
  },
);

export const search = onCall(
  {
    ...commonConfigs,
    secrets: [openSgidConnectionParamsSecret],
  },
  async ({ data }) => {
    const { search: searchSource } = await import('./search.js');

    return await searchSource(data);
  },
);

export const getFeature = onCall(
  {
    ...commonConfigs,
    secrets: [openSgidConnectionParamsSecret],
  },
  async ({ data }) => {
    const { getFeature: getFeatureSource } = await import('./search.js');

    return await getFeatureSource(data.match, data.context);
  },
);
