import { SecretManagerServiceClient } from '@google-cloud/secret-manager';
import admin from 'firebase-admin';
import { google } from 'googleapis';
import auth from '../utils/auth.js';

const secretsClient = new SecretManagerServiceClient();

export async function getSpreadsheetId() {
  const [version] = await secretsClient.accessSecretVersion({
    name: `projects/${
      admin.app().options.projectId
    }/secrets/CONFIG_SPREADSHEET_ID/versions/latest`,
  });

  return version.payload.data.toString();
}

const sheets = google.sheets('v4');

export function arraysToObjects(arrays, skipFields = []) {
  const [keys, ...values] = arrays;
  return values.map((row) => {
    return row.reduce((obj, value, index) => {
      if (!skipFields.includes(keys[index])) {
        obj[keys[index]] = value;
      }

      return obj;
    }, {});
  });
}

async function getConfigs(range, skipFields) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: await getSpreadsheetId(),
    range,
  });

  let configs = arraysToObjects(response.data.values, skipFields);

  return configs;
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
  await auth([
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/firebase.remoteconfig',
  ]);

  console.log('fetching data from Google Sheets...');
  const queryLayers = await getConfigs("'Query Layers'!A:AG", [
    'Contact Info',
    'ETL Type',
    'Source Data',
    'Unique ID',
  ]);

  const relatedTables = await getConfigs("'Related Tables'!A:H", [
    'Source Data',
  ]);

  return await updateRemoteConfigs(
    JSON.stringify(queryLayers),
    JSON.stringify(relatedTables)
  );
}
