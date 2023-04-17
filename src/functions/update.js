import admin from 'firebase-admin';
import fs from 'fs';
import { google } from 'googleapis';
import got from 'got';
import { fieldNames } from '../config.js';

const sheets = google.sheets('v4');
const remote_config_defaults_path = 'src/remote_config_defaults.json';
// TODO: figure out how to switch these between environments...
const spreadsheetId = '1aVJ68hOyp4H6sKEEuL-xtB2qE_y6W0gDg35TgUSxtFg';
const mapServiceUrl =
  'https://mapserv.utah.gov/arcgis/rest/services/DEQEnviro/MapService/MapServer';

async function auth() {
  console.log('initializing authentication...');

  const auth = new google.auth.GoogleAuth({
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/firebase.remoteconfig',
    ],
  });

  const authClient = await auth.getClient();
  google.options({ auth: authClient });

  return authClient;
}

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

export function addFeatureServices(configs, featureServices, nameField) {
  return configs.map((config) => {
    const featureService = featureServices[config[nameField].split('.')[2]];

    config.featureService = featureService;

    return config;
  });
}

async function getFeatureServiceLayers(propName) {
  console.log('fetching feature service layers...');
  const response = await got.get(`${mapServiceUrl}?f=json`).json();

  return response[propName].reduce((obj, layer) => {
    obj[layer.name] = `${mapServiceUrl}/${layer.id}`;

    return obj;
  }, {});
}

async function getConfigs(range, skipFields, featureServiceProp, nameField) {
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range,
  });

  let configs = arraysToObjects(response.data.values, skipFields);

  configs = addFeatureServices(
    configs,
    await getFeatureServiceLayers(featureServiceProp),
    nameField
  );

  return configs;
}

export function getLinksConfig(values) {
  const [keys, ...rows] = values;

  return rows.reduce((obj, row) => {
    const id = row[keys.indexOf(fieldNames.links.id)];
    obj[id] = {
      description: row[keys.indexOf(fieldNames.links.description)],
      url: row[keys.indexOf(fieldNames.links.url)],
    };

    return obj;
  }, {});
}

async function updateRemoteConfigs(queryLayers, relatedTables, links) {
  const remoteConfig = admin.remoteConfig();

  console.log('fetching template');
  const template = await remoteConfig.getTemplate();

  if (
    template.parameters.queryLayers.defaultValue.value === queryLayers &&
    template.parameters.relatedTables.defaultValue.value === relatedTables &&
    template.parameters.links.defaultValue.value === links
  ) {
    console.log('no changes detected, skipping remote config update');
    return;
  }

  template.parameters.queryLayers.defaultValue.value = queryLayers;
  template.parameters.relatedTables.defaultValue.value = relatedTables;
  template.parameters.links.defaultValue.value = links;

  console.log('validating new template');
  await remoteConfig.validateTemplate(template);

  console.log('publishing updated template');
  const updatedTemplate = await remoteConfig.publishTemplate(template);
  console.log('ETag from server: ' + updatedTemplate.etag);

  if (fs.existsSync(remote_config_defaults_path)) {
    console.log('updating local defaults file');
    fs.writeFileSync(
      remote_config_defaults_path,
      JSON.stringify(
        {
          queryLayers,
          relatedTables,
          links,
        },
        null,
        2
      )
    );
  }
}

export default async function main() {
  await auth();

  console.log('fetching data from Google Sheets...');
  const queryLayers = await getConfigs(
    "'Query Layers'!A:AJ",
    ['Contact Info', 'ETL Type', 'Source Data', 'Unique ID'],
    'layers',
    fieldNames.queryLayers.sgidFeatureClassName
  );

  const relatedTables = await getConfigs(
    "'Related Tables'!A:G",
    ['Source Data'],
    'tables',
    fieldNames.relatedTables.sgidTableName
  );

  const response = await sheets.spreadsheets.values.get({
    spreadsheetId,
    range: "'Other Links'!A:C",
  });

  const links = getLinksConfig(response.data.values);

  const configs = {
    queryLayers,
    relatedTables,
    links,
  };

  await updateRemoteConfigs(
    JSON.stringify(queryLayers),
    JSON.stringify(relatedTables),
    JSON.stringify(links)
  );

  return configs;
}
