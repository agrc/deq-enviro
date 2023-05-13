import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import admin from 'firebase-admin';
import { google } from 'googleapis';
import auth from './common/auth.js';
import { fieldNames } from './common/config.js';

const secretsClient = new SecretManagerServiceClient();

export async function getSpreadsheetId() {
  const [version] = await secretsClient.accessSecretVersion({
    name: `projects/${
      admin.app().options.projectId
    }/secrets/CONFIG_SPREADSHEET_ID/versions/latest`,
  });

  return version.payload.data.toString();
}

export function arraysToObjects(arrays, skipFields = []) {
  const [keys, ...values] = arrays;
  return values.map((row) => {
    return row.reduce((obj, value, keyIndex) => {
      if (!skipFields.includes(keys[keyIndex])) {
        obj[keys[keyIndex]] = value || null;
      }

      return obj;
    }, {});
  });
}

async function getConfigs(range, skipFields, authClient) {
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: await getSpreadsheetId(),
    range,
  });

  let configs = arraysToObjects(response.data.values, skipFields);

  return configs;
}

export function checkForDuplicateIds(configs) {
  const ids = configs.map((config) => config[fieldNames.queryLayers.uniqueId]);
  const uniqueIds = [];
  const duplicates = [];

  for (const id of ids) {
    if (uniqueIds.includes(id)) {
      duplicates.push(id);
    }

    uniqueIds.push(id);
  }

  if (duplicates.length) {
    throw new Error(
      `Duplicate values in the "Unique ID" column detected: ${JSON.stringify(
        duplicates
      )}`
    );
  }
}

async function updateRemoteConfigs(queryLayers, relatedTables) {
  const remoteConfig = admin.remoteConfig();

  console.log('fetching template');
  const template = await remoteConfig.getTemplate();

  const originalValues = {
    queryLayers: template.parameters.queryLayers.defaultValue.value,
    relatedTables: template.parameters.relatedTables.defaultValue.value,
  };

  template.parameters.queryLayers.defaultValue.value = queryLayers;
  template.parameters.relatedTables.defaultValue.value = relatedTables;

  console.log('validating new template');
  await remoteConfig.validateTemplate(template);

  if (
    originalValues.queryLayers === queryLayers &&
    originalValues.relatedTables === relatedTables
  ) {
    return 'No changes detected between the config spreadsheet and app configs.';
  }

  console.log('publishing updated template');
  const updatedTemplate = await remoteConfig.publishTemplate(template);
  console.log('ETag from server: ' + updatedTemplate.etag);

  return 'App configs updated successfully!';
}

export default async function main() {
  const authClient = await auth([
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/firebase.remoteconfig',
  ]);

  console.log('fetching data from Google Sheets...');
  const queryLayers = await getConfigs(
    "'Query Layers'!A:AG",
    ['Contact Info', 'ETL Type', 'Source Data'],
    authClient
  );

  console.log('checking for duplicate ids');
  checkForDuplicateIds(queryLayers);

  const relatedTables = await getConfigs(
    "'Related Tables'!A:H",
    ['Source Data'],
    authClient
  );

  return await updateRemoteConfigs(
    JSON.stringify(queryLayers),
    JSON.stringify(relatedTables)
  );
}
