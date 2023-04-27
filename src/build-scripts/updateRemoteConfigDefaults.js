import * as dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';
import auth from '../utils/auth.js';

dotenv.config();

admin.initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  appId: process.env.VITE_FIREBASE_APP_ID,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

async function main() {
  await auth(['https://www.googleapis.com/auth/firebase.remoteconfig']);

  const remoteConfig = admin.remoteConfig();

  console.log('fetching template');
  const template = await remoteConfig.getTemplate();

  const newValues = {
    queryLayers: template.parameters.queryLayers.defaultValue.value,
    relatedTables: template.parameters.relatedTables.defaultValue.value,
  };

  console.log('writing new values to defaults file');
  fs.writeFileSync(
    './src/remote_config_defaults.json',
    JSON.stringify(newValues, null, 2)
  );
}

main();
