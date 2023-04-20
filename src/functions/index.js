import admin from 'firebase-admin';
import functions from 'firebase-functions';
import update from './update.js';

admin.initializeApp();

export const updateRemoteConfigFromSheets = functions.https.onRequest(
  async (_, res) => {
    try {
      res.send(await update());
    } catch (e) {
      console.log('returning error', e);
      res.status(500).send(e);
    }
  }
);
