import admin from 'firebase-admin';
import { onRequest } from 'firebase-functions/v2/https';
import update from './update.js';

admin.initializeApp();

export const configs = onRequest(
  {
    // longer timeout for local development to allow for debugging
    timeoutSeconds: process.env.FUNCTIONS_EMULATOR ? 60 * 60 : 60,
  },
  async (_, res) => {
    try {
      res.send(await update());
    } catch (e) {
      console.error('returning error', e);
      res.status(500).send({ error: e.toString() });
    }
  }
);
