import admin from 'firebase-admin';
import { google } from 'googleapis';
import got from 'got';
import auth from './common/auth.js';
import { fieldConfigs, fieldKeys, fieldNames } from './common/config.js';
import { schemas, supportsExport } from './common/validation.js';

admin.initializeApp();

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
          config[fieldName],
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
  tableFieldNames,
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
        duplicates,
      )}`,
    );
  }
}

/**
 * @param {string} [url]
 * @returns {string[]}
 */
export function getFieldsFromUrl(url) {
  if (!url) return [];

  const regex = /{([^}]+)}/g;
  const matches = url.match(regex);

  if (!matches) return [];

  return matches.map((match) => match.replace(/[{}]/g, ''));
}

/**
 * @typedef {| {
 *       configProp: string;
 *       getFieldNames: (value: string) => string[];
 *     }
 *   | string} FieldValidation
 */

/** @type {FieldValidation[]} > */
const queryLayerFieldValidations = [
  fieldNames.queryLayers.resultGridFields,
  fieldNames.queryLayers.oidField,
  fieldNames.queryLayers.idField,
  fieldNames.queryLayers.nameField,
  {
    configProp: fieldNames.queryLayers.documentSearch,
    getFieldNames: getFieldsFromUrl,
  },
  {
    configProp: fieldNames.queryLayers.gramaRequest,
    getFieldNames: getFieldsFromUrl,
  },
  {
    configProp: fieldNames.queryLayers.permitInformation,
    getFieldNames: getFieldsFromUrl,
  },
  {
    configProp: fieldNames.queryLayers.additionalInformation,
    getFieldNames: getFieldsFromUrl,
  },
  /* TODO: validate all field names in the following fields:
   * Special Filters (special filter syntax)
   * Perhaps the Identify Attributes field if we bring it back...
   */
];

const relatedTableFieldValidations = [
  fieldNames.relatedTables.oidField,
  fieldNames.relatedTables.gridFields,
  {
    configProp: fieldNames.relatedTables.additionalInformation,
    getFieldNames: getFieldsFromUrl,
  },
];

async function validateConfigs(configs, schema, nameField, fieldValidations) {
  const validationErrors = [];

  for (const config of JSON.parse(configs)) {
    const configName = config[nameField];
    console.log(`validating: ${configName}`);

    try {
      schema.validateSync(config);
    } catch (error) {
      validationErrors.push(
        `${configName}: schema validation error: ${error.message}`,
      );
    }

    const serviceURL = config['Feature Service'];
    let serviceJSON;
    try {
      serviceJSON = await got(`${serviceURL}?f=json`).json();
    } catch (error) {
      validationErrors.push(
        `${configName}: could not fetch feature service JSON: ${error.message}`,
      );
      continue;
    }

    if (!supportsExport(serviceJSON)) {
      validationErrors.push(
        `Query Layer - ${configName}: feature service does not support export/downloading!`,
      );
    }

    const serviceFieldNames = serviceJSON.fields.map((field) => field.name);
    for (const fieldValidation of fieldValidations) {
      const results = validateFields(
        fieldValidation,
        serviceFieldNames,
        config,
        configName,
      );
      if (typeof results === 'object' && results.length) {
        validationErrors.push(...results);
      }
    }
  }

  return validationErrors;
}

/**
 * @param {FieldValidation} fieldValidation
 * @param {string[]} serviceFieldNames
 * @param {Object} config
 * @param {string} configName
 * @returns {string[] | boolean}
 */
export function validateFields(
  fieldValidation,
  serviceFieldNames,
  config,
  configName,
) {
  let configProp;
  let validationFieldNames;
  let configValue;
  const validationErrors = [];
  if (typeof fieldValidation === 'string') {
    configProp = fieldValidation;
    configValue = config[configProp];
    if (typeof configValue === 'string') {
      validationFieldNames = [configValue];
    } else {
      // must be array
      validationFieldNames = configValue?.length ? configValue : [];
    }
  } else {
    configProp = fieldValidation.configProp;
    configValue = config[configProp];
    validationFieldNames = configValue?.length
      ? fieldValidation.getFieldNames(config[configProp])
      : [];
  }
  for (const validationFieldName of validationFieldNames) {
    if (!serviceFieldNames.includes(validationFieldName)) {
      validationErrors.push(
        `${configName}: field "${validationFieldName}" in "${configProp}" is not a valid field name.`,
      );
    }
  }

  if (validationErrors.length) {
    return validationErrors;
  } else {
    return true;
  }
}

async function updateRemoteConfigs(queryLayers, relatedTables) {
  const remoteConfig = admin.remoteConfig();

  console.log('fetching template');
  const template = await remoteConfig.getTemplate();

  const originalValues = {
    // @ts-ignore
    queryLayers: template.parameters.queryLayers.defaultValue.value,
    // @ts-ignore
    relatedTables: template.parameters.relatedTables.defaultValue.value,
    // @ts-ignore
    version: template.parameters.version.defaultValue.value,
  };

  // @ts-ignore
  template.parameters.queryLayers.defaultValue.value = queryLayers;
  // @ts-ignore
  template.parameters.relatedTables.defaultValue.value = relatedTables;
  // @ts-ignore
  template.parameters.version.defaultValue.value = (
    parseInt(originalValues.version) + 1
  ).toString();

  console.log('validating new template');
  await remoteConfig.validateTemplate(template);

  const queryLayerValidationErrors = await validateConfigs(
    queryLayers,
    schemas.queryLayers,
    fieldNames.queryLayers.layerName,
    queryLayerFieldValidations,
  );

  const relatedTableValidationErrors = await validateConfigs(
    relatedTables,
    schemas.relatedTables,
    fieldNames.relatedTables.tableName,
    relatedTableFieldValidations,
  );

  if (
    originalValues.queryLayers === queryLayers &&
    originalValues.relatedTables === relatedTables
  ) {
    return {
      success: true,
      message:
        'No changes detected between the config spreadsheet and app configs.',
      queryLayerValidationErrors,
      relatedTableValidationErrors,
    };
  }

  console.log('publishing updated template');
  const updatedTemplate = await remoteConfig.publishTemplate(template);
  console.log('ETag from server: ' + updatedTemplate.etag);

  return {
    success: true,
    message: 'App configs updated successfully!',
    queryLayerValidationErrors,
    relatedTableValidationErrors,
  };
}

export async function main() {
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
    fieldKeys.queryLayers,
  );

  console.log('checking for duplicate ids');
  checkForDuplicateIds(queryLayers);

  const relatedTables = await getConfigs(
    "'Related Tables'!A:H",
    ['Source Data'],
    authClient,
    fieldConfigs.relatedTables,
    fieldKeys.relatedTables,
  );

  return await updateRemoteConfigs(
    JSON.stringify(queryLayers),
    JSON.stringify(relatedTables),
  );
}
