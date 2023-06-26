import admin from 'firebase-admin';
import { google } from 'googleapis';
import got from 'got';
import auth from './common/auth.js';
import { fieldConfigs, fieldKeys, fieldNames } from './common/config.js';
import { schemas, supportsExport } from './common/validation.js';

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

export function applyTransforms(configs, fieldConfigs, tableFieldNames) {
  for (const config of configs) {
    for (const fieldName in config) {
      if (fieldConfigs[tableFieldNames[fieldName]]?.transform) {
        config[fieldName] = fieldConfigs[tableFieldNames[fieldName]].transform(
          config[fieldName]
        );
      }
    }
  }

  return configs;
}

async function getConfigs(
  range,
  skipFields,
  authClient,
  tableFieldConfigs,
  tableFieldNames
) {
  const sheets = google.sheets({ version: 'v4', auth: authClient });
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: process.env.CONFIG_SPREADSHEET_ID,
    range,
  });

  let configs = arraysToObjects(response.data.values, skipFields);

  configs = applyTransforms(configs, tableFieldConfigs, tableFieldNames);

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

async function validateQueryLayers(queryLayers) {
  const validationErrors = [];

  for (const queryLayer of JSON.parse(queryLayers)) {
    const layerName = queryLayer[fieldNames.queryLayers.layerName];
    try {
      schemas.queryLayers.validateSync(queryLayer);
    } catch (error) {
      validationErrors.push(
        `${layerName}: schema validation error: ${error.message}`
      );
    }
    if (queryLayer[fieldNames.queryLayers.featureService]) {
      const serviceURL = queryLayer[fieldNames.queryLayers.featureService];
      const serviceJSON = await got(`${serviceURL}?f=json`).json();

      if (!supportsExport(serviceJSON)) {
        validationErrors.push(
          `${layerName}: feature service does not support export/downloading!`
        );
      }
    }
  }

  return validationErrors;
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

  const validationErrors = await validateQueryLayers(queryLayers);

  if (
    originalValues.queryLayers === queryLayers &&
    originalValues.relatedTables === relatedTables
  ) {
    return {
      success: true,
      message:
        'No changes detected between the config spreadsheet and app configs.',
      validationErrors,
    };
  }

  console.log('publishing updated template');
  const updatedTemplate = await remoteConfig.publishTemplate(template);
  console.log('ETag from server: ' + updatedTemplate.etag);

  return {
    success: true,
    message: 'App configs updated successfully!',
    validationErrors,
  };
}

export default async function main() {
  const authClient = await auth([
    'https://www.googleapis.com/auth/spreadsheets.readonly',
    'https://www.googleapis.com/auth/firebase.remoteconfig',
  ]);

  console.log('fetching data from Google Sheets...');
  const queryLayers = await getConfigs(
    "'Query Layers'!A:AZ",
    ['Contact Info', 'ETL Type', 'Source Data'],
    authClient,
    fieldConfigs.queryLayers,
    fieldKeys.queryLayers
  );

  console.log('checking for duplicate ids');
  checkForDuplicateIds(queryLayers);

  const relatedTables = await getConfigs(
    "'Related Tables'!A:H",
    ['Source Data'],
    authClient,
    fieldConfigs.relatedTables,
    fieldKeys.relatedTables
  );

  return await updateRemoteConfigs(
    JSON.stringify(queryLayers),
    JSON.stringify(relatedTables)
  );
}
