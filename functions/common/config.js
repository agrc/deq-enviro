import { array, string } from 'yup';

// https://github.com/jsdoc/jsdoc/issues/1468
/**
 * @typedef {{
 *   'Table Name': string;
 *   'Layer Name': string;
 *   'Geometry Type': string;
 *   'Division Heading': string;
 *   'Layer Description': string;
 *   'Metadata Link': string;
 *   'Special Filters': string;
 *   'Special Filter Default To On': string;
 *   'Additional Searches': string;
 *   'OID Field': string;
 *   ID: string;
 *   NAME: string;
 *   'Custom Symbology Field': string;
 *   'Legend Title': string;
 *   'Map Label Field': string;
 *   'Sort Field': string;
 *   'Identify Fields': (string | { name: string; alias: string })[];
 *   'Result Grid Fields': (string | { name: string; alias: string })[];
 *   'Related Tables': string;
 *   'Document Search': string;
 *   'GRAMA Request': string;
 *   'Permit Information': string;
 *   'Additional Information': string;
 *   Comments: string;
 *   'Feature Service': string;
 *   'Coded Values': string;
 * }} QueryLayerConfig
 */

/**
 * @typedef {{
 *   'Additional Information': string;
 *   'Additional Information Link Fields': string[];
 *   'Feature Service': string;
 *   'Grid Fields': (string | { name: string; alias: string })[];
 *   'OID Field': string;
 *   'SGID Table Name': string;
 *   'Table Name': string;
 *   'Tab Name': string;
 * }} RelatedTableConfig
 */

/**
 * @typedef {{
 *   'Parent Dataset Name': string;
 *   'Primary Key': string;
 *   'Related Table Name': string;
 *   'Foreign Key': string;
 * }} RelationshipClassConfig
 */

// use a different regex that yup to allow for the {FieldName} syntax
const urlRegex = /https?:\/\//i;
const invalidUrl = '"${value}" must be a valid URL ("{" and "}" are allowed)';

export function transformFields(value) {
  const entries = value.split(',').map((v) => v.trim());

  return entries.map((entry) => {
    const match = entry.match(/^(.*)\(([^()]*(?:\([^()]*\)[^()]*)*)\)$/);

    if (match) {
      return {
        name: match[1].trim(),
        alias: match[2].trim(),
      };
    }

    return entry;
  });
}

export const fieldConfigs = {
  queryLayers: {
    additionalInformation: {
      name: 'Additional Information',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    additionalSearches: {
      name: 'Additional Searches',
      schema: string().nullable(),
    },
    codedValues: {
      name: 'Coded Values',
      schema: string().nullable(),
    },
    comments: {
      name: 'Comments',
      schema: string().nullable(),
    },
    customSymbologyField: {
      name: 'Custom Symbology Field',
      schema: string().nullable(),
    },
    divisionHeading: {
      name: 'Division Heading',
      schema: string().required(),
    },
    documentSearch: {
      name: 'Document Search',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    featureService: {
      name: 'Feature Service',
      schema: string().url().required(),
    },
    geometryType: {
      name: 'Geometry Type',
      schema: string().nullable(),
    },
    gramaRequest: {
      name: 'GRAMA Request',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    identifyFields: {
      name: 'Identify Fields',
      schema: array().required(),
      transform: transformFields,
    },
    idField: {
      name: 'ID Field',
      schema: string().required(),
    },
    layerDescription: {
      name: 'Layer Description',
      schema: string().required(),
    },
    layerName: {
      name: 'Layer Name',
      schema: string().required(),
    },
    legendTitle: {
      name: 'Legend Title',
      schema: string().nullable(),
    },
    mapLabelField: {
      name: 'Map Label Field',
      schema: string().nullable(),
    },
    metadataLink: {
      name: 'Metadata Link',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    nameField: {
      name: 'Name Field',
      schema: string().required(),
    },
    oidField: {
      name: 'OID Field',
      schema: string().nullable(),
    },
    permitInformation: {
      name: 'Permit Information',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    relatedTables: {
      name: 'Related Tables',
      schema: string().nullable(),
    },
    resultGridFields: {
      name: 'Result Grid Fields',
      schema: array().required(),
      transform: transformFields,
    },
    sgidFeatureClassName: {
      name: 'SGID Feature Class Name',
      schema: string().nullable(),
    },
    sortField: {
      name: 'Sort Field',
      schema: string().nullable(),
    },
    specialFilterDefaultToOn: {
      name: 'Special Filter Default To On',
      schema: string().nullable(),
    },
    specialFilters: {
      name: 'Special Filters',
      schema: string().nullable(),
    },
    tableName: {
      name: 'Table Name',
      schema: string().nullable(),
    },
  },
  relatedTables: {
    additionalInformation: {
      name: 'Additional Information',
      schema: string().matches(urlRegex, { message: invalidUrl }).nullable(),
    },
    additionalInformationLinkFields: {
      name: 'Additional Information Link Fields',
      scheme: array().nullable(),
      transform: transformFields,
    },
    featureService: {
      name: 'Feature Service',
      schema: string().url().required(),
    },
    gridFields: {
      name: 'Grid Fields',
      schema: array().required(),
      transform: transformFields,
    },
    oidField: {
      name: 'OID Field',
      schema: string().nullable(),
    },
    sgidTableName: {
      name: 'SGID Table Name',
      schema: string().nullable(),
    },
    tableName: {
      name: 'Table Name',
      schema: string().required(),
    },
    tabName: {
      name: 'Tab Name',
      schema: string().nullable(),
    },
  },
  relationshipClasses: {
    parentDatasetName: {
      name: 'Parent Dataset Name',
      schema: string().required(),
    },
    primaryKey: {
      name: 'Primary Key',
      schema: string().required(),
    },
    relatedTableName: {
      name: 'Related Table Name',
      schema: string().required(),
    },
    foreignKey: {
      name: 'Foreign Key',
      schema: string().required(),
    },
  },
};

/**
 * @param {Record<string, Object>} fieldConfigs
 * @returns {Record<string, string>}
 */
function getFieldNames(fieldConfigs) {
  return Object.keys(fieldConfigs).reduce((obj, key) => {
    obj[key] = fieldConfigs[key].name;

    return obj;
  }, {});
}

/**
 * @param {Record<string, object>} fieldConfigs
 * @returns {Record<string, string>}
 */
function getFieldKeys(fieldConfigs) {
  return Object.keys(fieldConfigs).reduce((obj, key) => {
    obj[fieldConfigs[key].name] = key;

    return obj;
  }, {});
}

export const fieldNames = {
  queryLayers: getFieldNames(fieldConfigs.queryLayers),
  relatedTables: getFieldNames(fieldConfigs.relatedTables),
  relationshipClasses: getFieldNames(fieldConfigs.relationshipClasses),
};

export const fieldKeys = {
  queryLayers: getFieldKeys(fieldConfigs.queryLayers),
  relatedTables: getFieldKeys(fieldConfigs.relatedTables),
  relationshipClasses: getFieldKeys(fieldConfigs.relationshipClasses),
};

export const downloadFormats = {
  csv: 'csv',
  excel: 'excel',
  filegdb: 'filegdb',
  geojson: 'geojson',
  geoPackage: 'geoPackage',
  shapefile: 'shapefile',
  sqlite: 'sqlite',
};
