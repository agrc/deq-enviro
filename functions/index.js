import admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import update from './update.js';

admin.initializeApp();

const commonConfigs = {
  // longer timeout for local development to allow for debugging
  timeoutSeconds: process.env.FUNCTIONS_EMULATOR ? 60 * 60 : 60,
};

export const configs = onRequest(commonConfigs, async (_, response) => {
  try {
    response.send(await update());
  } catch (e) {
    console.error('returning error', e);
    response.status(500).send({ error: e.toString() });
  }
});
