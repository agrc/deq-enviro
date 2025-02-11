import '@dotenvx/dotenvx/config';
import admin from 'firebase-admin';
import fs from 'fs';
import auth from '../functions/common/auth.js';

admin.initializeApp(JSON.parse(process.env.VITE_FIREBASE_CONFIG));

async function main() {
  await auth(['https://www.googleapis.com/auth/firebase.remoteconfig']);

  const remoteConfig = admin.remoteConfig();

  console.log('fetching template');
  const template = await remoteConfig.getTemplate();

  const newValues = {
    queryLayers: template.parameters.queryLayers.defaultValue.value,
    relatedTables: template.parameters.relatedTables.defaultValue.value,
    relationshipClasses:
      template.parameters.relationshipClasses.defaultValue.value,
    version: template.parameters.version.defaultValue.value,
  };

  console.log('writing new values to defaults file');
  fs.writeFileSync(
    './src/remote_config_defaults.json',
    JSON.stringify(newValues, null, 2),
  );
}

main();
