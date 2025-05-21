import admin from 'firebase-admin';
import { google } from 'googleapis';
import got from 'got';
import auth from './common/auth.js';
import { fieldConfigs, fieldKeys, fieldNames } from './common/config.js';
import { schemas } from './common/validation.js';

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
        console.log(`transforming ${fieldName} for ${config['Table Name']}`);
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

export function checkForDuplicateTableNames(configs) {
  const names = configs.map(
    (config) => config[fieldNames.queryLayers.tableName],
  );
  const uniqueNames = [];
  const duplicates = [];

  for (const name of names) {
    if (uniqueNames.includes(name)) {
      duplicates.push(name);
    }

    uniqueNames.push(name);
  }

  if (duplicates.length) {
    throw new Error(
      `Duplicate values in the "Table Name" column detected: ${JSON.stringify(
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

/** @typedef {import('./common/config.js').FieldFilterConfig} FieldFilterConfig */
/** @typedef {import('./common/config.js').DateFilterConfig} DateFilterConfig */

/**
 * @param {(
 *   | FieldFilterConfig
 *   | import('./common/config.js').CheckboxRadioQueriesFilterConfig
 *   | DateFilterConfig
 * )[]} filters
 * @returns {string[]}
 */
export function getFieldsFromSpecialFilters(filters) {
  return filters.reduce((fields, filterConfig) => {
    if (['field', 'date'].includes(filterConfig.type)) {
      return [
        ...fields,
        /** @type {FieldFilterConfig | DateFilterConfig} */ (filterConfig)
          .field,
      ];
    }

    return fields;
  }, []);
}

/**
 * @typedef {{
 *       configProp: string;
 *       getFieldNames: (value: string | object) => string[];
 *     }
 *   | string} FieldValidation
 */

/** @type {FieldValidation[]} > */
const queryLayerFieldValidations = [
  fieldNames.queryLayers.resultGridFields,
  fieldNames.queryLayers.identifyFields,
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
  {
    configProp: fieldNames.queryLayers.specialFilters,
    getFieldNames: getFieldsFromSpecialFilters,
  },
  {
    configProp: fieldNames.queryLayers.IdentifyFields,
    getFieldNames: (values) => values.map((value) => value.name),
  },
];

const relatedTableFieldValidations = [
  fieldNames.relatedTables.oidField,
  fieldNames.relatedTables.gridFields,
  {
    configProp: fieldNames.relatedTables.additionalInformation,
    getFieldNames: getFieldsFromUrl,
  },
];

async function validateTableConfigs(
  configs,
  schema,
  nameField,
  fieldValidations,
) {
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

    if (serviceJSON.error) {
      validationErrors.push(
        `${configName}: could not fetch feature service JSON: ${serviceJSON.error.message}`,
      );
      continue;
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
 * @param {import('./common/config.js').RelationshipClassConfig[]} relationshipClasses
 * @param {import('./common/config.js').QueryLayerConfig[]} queryLayers
 * @param {import('./common/config.js').RelatedTableConfig[]} relatedTables
 * @returns {Promise<string[] | boolean>}
 */
async function validateRelationshipClasses(
  relationshipClasses,
  queryLayers,
  relatedTables,
) {
  const validationErrors = [];

  const possibleChildNames = relatedTables.map(
    (config) => config[fieldNames.relatedTables.tableName],
  );
  const possibleParentName = [
    ...queryLayers.map((config) => config[fieldNames.queryLayers.tableName]),
    // parent name can be a child name
    ...possibleChildNames,
  ];
  const allConfigs = [...queryLayers, ...relatedTables];

  const validate = async (config) => {
    const parent = config[fieldNames.relationshipClasses.parentDatasetName];
    const child = config[fieldNames.relationshipClasses.relatedTableName];
    const name = `${parent} -> ${child}`;
    console.log(`validating: ${name}`);

    if (!possibleParentName.includes(parent)) {
      validationErrors.push(
        `${name}: parent dataset name is not a valid query layer name.`,
      );

      return;
    }

    if (!possibleChildNames.includes(child)) {
      validationErrors.push(
        `${name}: related table name is not a valid related table name.`,
      );

      return;
    }

    const parentConfig = allConfigs.find(
      (config) => config[fieldNames.queryLayers.tableName] === parent,
    );
    const parentServiceJson = await got(
      `${parentConfig[fieldNames.queryLayers.featureService]}?f=json`,
    ).json();

    const results = validateFields(
      fieldNames.relationshipClasses.primaryKey,
      parentServiceJson.fields.map((field) => field.name),
      config,
      name,
    );
    if (typeof results === 'object' && results.length) {
      validationErrors.push(...results);
    }

    const childConfig = relatedTables.find(
      (config) => config[fieldNames.relatedTables.tableName] === child,
    );
    const childServiceJson = await got(
      `${childConfig[fieldNames.relatedTables.featureService]}?f=json`,
    ).json();

    const childResults = validateFields(
      fieldNames.relationshipClasses.foreignKey,
      childServiceJson.fields.map((field) => field.name),
      config,
      name,
    );
    if (typeof childResults === 'object' && childResults.length) {
      validationErrors.push(...childResults);
    }

    config?.nestedRelationships?.forEach(validate);
  };

  relationshipClasses.forEach(validate);

  return validationErrors;
}

/**
 * @param {FieldValidation} fieldValidation
 * @param {string[]} serviceFieldNames
 * @param {import('./common/config.js').QueryLayerConfig
 *   | import('./common/config.js').RelatedTableConfig
 *   | import('./common/config.js').RelationshipClassConfig} config
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
      validationFieldNames = configValue?.length
        ? configValue.map((value) =>
            typeof value === 'string' ? value : value.name,
          )
        : [];
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

async function updateRemoteConfigs(
  queryLayers,
  relatedTables,
  relationshipClasses,
) {
  const remoteConfig = admin.remoteConfig();

  console.log('fetching template');
  const template = await remoteConfig.getTemplate();

  const originalValues = {
    // @ts-expect-error - The template parameters structure is not fully typed
    queryLayers: template.parameters.queryLayers.defaultValue.value,
    // @ts-expect-error - The template parameters structure is not fully typed
    relatedTables: template.parameters.relatedTables.defaultValue.value,
    // @ts-expect-error - The template parameters structure is not fully typed
    version: template.parameters.version.defaultValue.value,
    relationshipClasses:
      // @ts-expect-error - The template parameters structure is not fully typed
      template.parameters.relationshipClasses.defaultValue.value,
  };

  // @ts-expect-error - The template parameters structure is not fully typed
  template.parameters.queryLayers.defaultValue.value = queryLayers;
  // @ts-expect-error - The template parameters structure is not fully typed
  template.parameters.relatedTables.defaultValue.value = relatedTables;
  // @ts-expect-error - The template parameters structure is not fully typed
  template.parameters.version.defaultValue.value = (
    parseInt(originalValues.version) + 1
  ).toString();
  // @ts-expect-error - The template parameters structure is not fully typed
  template.parameters.relationshipClasses.defaultValue.value =
    relationshipClasses;

  console.log('validating new template');
  await remoteConfig.validateTemplate(template);

  const queryLayerValidationErrors = await validateTableConfigs(
    queryLayers,
    schemas.queryLayers,
    fieldNames.queryLayers.layerName,
    queryLayerFieldValidations,
  );

  const relatedTableValidationErrors = await validateTableConfigs(
    relatedTables,
    schemas.relatedTables,
    fieldNames.relatedTables.tabName,
    relatedTableFieldValidations,
  );

  const relationshipClassValidationErrors = await validateRelationshipClasses(
    JSON.parse(relationshipClasses),
    JSON.parse(queryLayers),
    JSON.parse(relatedTables),
  );

  if (
    originalValues.queryLayers === queryLayers &&
    originalValues.relatedTables === relatedTables &&
    originalValues.relationshipClasses === relationshipClasses
  ) {
    return {
      success: true,
      message:
        'No changes detected between the config spreadsheet and app configs.',
      queryLayerValidationErrors,
      relatedTableValidationErrors,
      relationshipClassValidationErrors,
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
    relationshipClassValidationErrors,
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

  console.log('checking for duplicate table names');
  checkForDuplicateTableNames(queryLayers);

  const relatedTables = await getConfigs(
    "'Related Tables'!A:I",
    ['Source Data'],
    authClient,
    fieldConfigs.relatedTables,
    fieldKeys.relatedTables,
  );

  console.log('checking for duplicate table names');
  checkForDuplicateTableNames(relatedTables);

  const relationshipClasses = await getConfigs(
    "'Relationship Classes'!A:E",
    ['Relationship Name'],
    authClient,
    fieldConfigs.relationshipClasses,
    fieldKeys.relationshipClasses,
  );

  return await updateRemoteConfigs(
    JSON.stringify(queryLayers),
    JSON.stringify(relatedTables),
    JSON.stringify(nestRelationships(relationshipClasses)),
  );
}

/**
 * @param {import('./common/config').RelationshipClassConfig[]} relationshipClasses
 * @returns {import('./common/config').RelationshipClassConfig[]}
 */
export function nestRelationships(relationshipClasses) {
  console.log('nesting relationships');
  return relationshipClasses.reduce(
    (nestedRelationships, relationship) => {
      const potentialChildName =
        relationship[fieldNames.relationshipClasses.parentDatasetName];
      const parent = nestedRelationships.find(
        (nested) =>
          nested[fieldNames.relationshipClasses.relatedTableName] ===
          potentialChildName,
      );

      if (parent) {
        console.log(
          `moving ${potentialChildName} to ${parent[fieldNames.relationshipClasses.parentDatasetName]}`,
        );
        // found a nested relationship
        // remove current config from base array and add it to it's parent
        // can't trust the index param of the reduce because we are mutating the array
        const childIndex = nestedRelationships.indexOf(relationship);
        const child = nestedRelationships.splice(childIndex, 1)[0];
        if (!parent.nestedRelationships) {
          parent.nestedRelationships = [];
        }
        parent.nestedRelationships.push(child);
      }

      return nestedRelationships;
    },
    [...relationshipClasses],
  );
}
