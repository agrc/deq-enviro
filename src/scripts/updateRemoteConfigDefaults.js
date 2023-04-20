import * as dotenv from 'dotenv';
import admin from 'firebase-admin';
import fs from 'fs';
import { google } from 'googleapis';

dotenv.config();

admin.initializeApp({
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  appId: process.env.VITE_FIREBASE_APP_ID,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
});

async function auth() {
  console.log('initializing authentication');

  const auth = new google.auth.GoogleAuth({
    scopes: ['https://www.googleapis.com/auth/firebase.remoteconfig'],
  });

  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  return authClient;
}

async function main() {
  await auth();

  const remoteConfig = admin.remoteConfig();

  console.log('fetching template');
  const template = await remoteConfig.getTemplate();

  const newValues = {
    queryLayers: template.parameters.queryLayers.defaultValue.value,
    relatedTables: template.parameters.relatedTables.defaultValue.value,
    links: template.parameters.links.defaultValue.value,
  };

  console.log('writing new values to defaults file');
  fs.writeFileSync(
    './src/remote_config_defaults.json',
    JSON.stringify(newValues, null, 2)
  );
}

main();
